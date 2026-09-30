import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { PACKAGE_NAMES, PACKAGE_PRICE_CENTS } from './package-prices.js';

dotenv.config({ path: ['.env.local', '.env'] });

const app = express();
const port = Number(process.env.PORT || 3000);
const rootDir = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === 'production' || process.argv.includes('--production');

// Supabase Init
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseKey) {
  console.warn('WARNING: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
}
const supabase = createClient(supabaseUrl || 'https://xyz.supabase.co', supabaseKey || 'dummy');

// Crypto Settings
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // Must be 32 bytes (256 bits) for AES-256-GCM

// Catalog Data
const packages = Object.fromEntries(
  Object.entries(PACKAGE_NAMES).map(([code, name]) => [code, { name, prices: PACKAGE_PRICE_CENTS[code] }]),
);

const allowedGuestCounts = new Set([50, 100, 150]);

app.disable('x-powered-by');
app.use(express.json({ limit: '20kb' }));

// Utils
function fallbackPriceRecords() {
  return Object.entries(packages).flatMap(([packageCode, pkg]) =>
    Object.entries(pkg.prices).map(([guests, priceCents]) => ({
      packageCode,
      guests: Number(guests),
      priceCents,
    })),
  );
}

async function getPackagePriceRecords() {
  const { data, error } = await supabase
    .from('package_prices')
    .select('package_code, guests, price_cents')
    .eq('active', true)
    .order('package_code')
    .order('guests');
  if (error || !data?.length) {
    if (error) console.warn('Using fallback package prices:', error.message);
    return fallbackPriceRecords();
  }
  return data.map((row) => ({ packageCode: row.package_code, guests: row.guests, priceCents: row.price_cents }));
}

async function resolvePackagePrice(packageCode, guests) {
  const records = await getPackagePriceRecords();
  return records.find((record) => record.packageCode === packageCode && record.guests === guests) || null;
}

function encrypt(text) {
  if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) throw new Error('Invalid ENCRYPTION_KEY length (must be exactly 32 bytes)');
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY, 'utf-8'), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return { encrypted, iv: iv.toString('hex'), authTag };
}

function decrypt(encrypted, ivHex, authTagHex) {
  if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) throw new Error('Invalid ENCRYPTION_KEY length (must be exactly 32 bytes)');
  const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY, 'utf-8'), Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Check Admin Middleware
async function authenticateAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'Token não fornecido ou inválido' });
  const token = authHeader.split(' ')[1];

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Sessão inválida ou expirada' });

  // Validate admin role in DB
  const { data: admin } = await supabase.from('admins').select('*').eq('id', user.id).single();
  if (!admin) return res.status(403).json({ error: 'Acesso negado' });

  req.admin = admin;
  next();
}

app.get('/api/package-prices', async (_req, res) => {
  const records = await getPackagePriceRecords();
  res.setHeader('Cache-Control', 'no-store');
  res.json(records);
});

app.get('/api/admin/package-prices', authenticateAdmin, async (_req, res) => {
  res.json(await getPackagePriceRecords());
});

app.put('/api/admin/package-prices', authenticateAdmin, async (req, res) => {
  const records = Array.isArray(req.body?.prices) ? req.body.prices : [];
  const expectedKeys = fallbackPriceRecords().map((item) => `${item.packageCode}:${item.guests}`);
  const receivedKeys = records.map((item) => `${String(item.packageCode || '').toUpperCase()}:${Number(item.guests)}`);
  if (records.length !== expectedKeys.length || expectedKeys.some((key) => !receivedKeys.includes(key))) {
    return res.status(400).json({ error: 'Envie os preços de 50, 100 e 150 pessoas para todos os pacotes.' });
  }
  const rows = records.map((item) => ({
    package_code: String(item.packageCode).toUpperCase(),
    guests: Number(item.guests),
    price_cents: Number(item.priceCents),
    active: true,
  }));
  if (rows.some((row) => !packages[row.package_code] || !allowedGuestCounts.has(row.guests) || !Number.isInteger(row.price_cents) || row.price_cents <= 0)) {
    return res.status(400).json({ error: 'Há preços ou quantidades inválidos.' });
  }
  const { error } = await supabase.from('package_prices').upsert(rows, { onConflict: 'package_code,guests' });
  if (error) {
    console.error('Package price update error:', error);
    return res.status(500).json({ error: 'Não foi possível salvar os preços.' });
  }
  res.json({ success: true, prices: await getPackagePriceRecords() });
});

// Admin Config Endpoints
app.get('/api/admin/config', authenticateAdmin, async (req, res) => {
  const { data, error } = await supabase.from('payment_config').select('*').eq('id', 1).single();
  if (error && error.code !== 'PGRST116') return res.status(500).json({ error: 'Erro ao buscar configuração' });
  
  res.json({
    environment: data?.environment || 'sandbox',
    pagarme_key_configured: !!data?.pagarme_key_encrypted
  });
});

app.post('/api/admin/config', authenticateAdmin, async (req, res) => {
  const { environment, pagarme_key } = req.body;
  let updates = { id: 1, environment: environment || 'sandbox' };
  
  if (pagarme_key && pagarme_key.trim() !== '') {
    try {
      const { encrypted, iv, authTag } = encrypt(pagarme_key.trim());
      updates.pagarme_key_encrypted = encrypted;
      updates.pagarme_key_iv = iv;
      updates.pagarme_key_auth_tag = authTag;
    } catch (err) {
      console.error('Crypto error:', err);
      return res.status(500).json({ error: 'Erro ao criptografar chave. Verifique ENCRYPTION_KEY no .env.' });
    }
  }

  const { error } = await supabase.from('payment_config').upsert(updates);
  if (error) {
    console.error('DB update error:', error);
    return res.status(500).json({ error: 'Erro ao salvar configuração no banco' });
  }

  res.json({ success: true });
});

app.get('/api/admin/orders', authenticateAdmin, async (req, res) => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error);
    return res.status(500).json({ error: 'Erro ao buscar pedidos' });
  }
  res.json(data || []);
});

app.get('/api/admin/users', authenticateAdmin, async (req, res) => {
  const { data, error } = await supabase.from('admins').select('*').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: 'Erro ao buscar administradores' });
  res.json(data || []);
});

app.post('/api/admin/users', authenticateAdmin, async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email e senha são obrigatórios' });

  // 1. Create user in Supabase Auth using Admin API
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError) {
    console.error('Create user error:', authError);
    return res.status(400).json({ error: authError.message });
  }

  // 2. Add to admins table
  const { error: dbError } = await supabase.from('admins').insert({
    id: authData.user.id,
    email: authData.user.email
  });

  if (dbError) {
    console.error('Insert admin error:', dbError);
    // Best effort rollback
    await supabase.auth.admin.deleteUser(authData.user.id);
    return res.status(500).json({ error: 'Erro ao salvar administrador no banco' });
  }

  res.json({ success: true, user: { id: authData.user.id, email: authData.user.email } });
});

// Checkout amount is resolved server-side from the central price table.
function buildCheckoutItems(packageCode, guests, priceCents) {
  const selectedPackage = packages[packageCode];
  return [{
    name: `${selectedPackage.name} - ${guests} pessoas`,
    description: `Pacote ${packageCode} do Concórdia Grill`,
    amount: priceCents,
    default_quantity: 1,
  }];
}

app.post('/api/checkout', async (req, res) => {
  const body = req.body || {};
  const packageCode = typeof body.packageCode === 'string' ? body.packageCode.toUpperCase() : '';
  const guests = Number(body.guests);

  if (!packages[packageCode]) return res.status(400).json({ error: 'Pacote inválido.' });
  if (!Number.isInteger(guests) || !allowedGuestCounts.has(guests)) return res.status(400).json({ error: 'Quantidade de convidados inválida.' });

  const selectedPrice = await resolvePackagePrice(packageCode, guests);
  if (!selectedPrice) return res.status(400).json({ error: 'Preço não configurado para este pacote e quantidade.' });

  // Load config
  const { data: config } = await supabase.from('payment_config').select('*').eq('id', 1).single();
  if (!config || !config.pagarme_key_encrypted) {
    return res.status(503).json({ error: 'O checkout não está configurado.' });
  }

  let secretKey;
  try {
    secretKey = decrypt(config.pagarme_key_encrypted, config.pagarme_key_iv, config.pagarme_key_auth_tag);
  } catch (err) {
    console.error('Decryption error:', err);
    return res.status(500).json({ error: 'Erro interno ao decifrar credenciais. Fale com o suporte.' });
  }

  const baseUrl = config.environment === 'production' 
    ? 'https://api.pagar.me/core/v5' 
    : 'https://sdx-api.pagar.me/core/v5';

  const orderId = crypto.randomUUID();
  const trackingToken = crypto.randomBytes(32).toString('hex');
  const trackingTokenHash = crypto.createHash('sha256').update(trackingToken).digest('hex');
  
  const items = buildCheckoutItems(packageCode, guests, selectedPrice.priceCents);
  const totalCents = items.reduce((acc, item) => acc + item.amount, 0);

  const { error: dbError } = await supabase.from('orders').insert({
    id: orderId,
    package_id: packageCode,
    guests_adults: guests,
    optionals: [],
    total_cents: totalCents,
    customer_name: body.customer_name || 'Não informado',
    customer_email: body.customer_email || 'nao@informado.com',
    customer_phone: body.customer_phone || '0000000000',
    tracking_token_hash: trackingTokenHash,
    status: 'pending'
  });

  if (dbError) {
    console.error('Order DB insertion failed:', dbError);
    return res.status(500).json({ error: 'Erro ao registrar pedido.' });
  }

  const payload = {
    type: 'order',
    name: `Concórdia Grill ${packageCode}`,
    order_code: orderId,
    expires_in: 120,
    max_paid_sessions: 1,
    payment_settings: { accepted_payment_methods: body.payment_method ? [body.payment_method] : ['pix', 'credit_card'] },
    cart_settings: { items },
  };

  try {
    const response = await fetch(`${baseUrl}/paymentlinks`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Basic ${Buffer.from(`${secretKey}:`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error('Pagar.me Error:', result);
      return res.status(502).json({ error: 'Erro ao criar pagamento.' });
    }
    
    // We update the gateway_order_id just for completeness
    await supabase.from('orders').update({ gateway_order_id: result.id }).eq('id', orderId);

    res.json({ url: result.url, trackingToken });
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(502).json({ error: 'Serviço de pagamento indisponível.' });
  }
});

app.get('/api/order-status', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'Token não fornecido' });
  const token = authHeader.split(' ')[1];

  const hash = crypto.createHash('sha256').update(token).digest('hex');
  const { data: order } = await supabase.from('orders').select('status, payment_method, total_cents, pix_payload').eq('tracking_token_hash', hash).single();

  if (!order) return res.status(404).json({ error: 'Pedido não encontrado' });

  res.json({
    status: order.status,
    paymentMethod: order.payment_method,
    amount: order.total_cents,
    pix: order.pix_payload
  });
});

app.post('/api/webhook', async (req, res) => {
  // Pagar.me V5 Webhook Authentication (via Basic Auth configured in the dashboard)
  const webhookSecret = process.env.WEBHOOK_SECRET;
  if (webhookSecret) {
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== `Basic ${Buffer.from(`${webhookSecret}:`).toString('base64')}`) {
      console.error('Webhook auth failed.');
      return res.status(401).send('Unauthorized');
    }
  }

  const payload = req.body;
  if (!payload || !payload.id || !payload.type) return res.status(400).send('Invalid');

  // Idempotency check
  const { error: eventError } = await supabase.from('payment_events').insert({
    order_id: payload.data?.code, // Reference to local order if exists
    gateway_event_id: payload.id,
    event_type: payload.type,
    payload: payload
  });

  if (eventError) {
    if (eventError.code === '23505' || eventError.message.includes('unique constraint')) {
      return res.status(200).send('Idempotent OK');
    }
    // Let Pagarme retry if it was a real DB issue, except if foreign key
    if (eventError.code === '23503') return res.status(404).send('Order not found');
    console.error('Webhook DB Event Error:', eventError);
    return res.status(500).send('DB Error');
  }

  if (payload.data?.code) {
    const updates = {};
    if (payload.type === 'order.paid') updates.status = 'paid';
    else if (payload.type === 'order.payment_failed') updates.status = 'failed';
    else if (payload.type === 'order.canceled') updates.status = 'canceled';
    
    const charges = payload.data?.charges;
    if (charges && charges.length > 0) {
       updates.payment_method = charges[0].payment_method;
       if (updates.payment_method === 'pix' && charges[0].last_transaction?.qr_code) {
         updates.pix_payload = {
           qr_code: charges[0].last_transaction.qr_code,
           qr_code_url: charges[0].last_transaction.qr_code_url,
           expires_at: charges[0].last_transaction.expires_at
         };
       }
    }

    if (Object.keys(updates).length > 0) {
      const { error: upError } = await supabase.from('orders').update(updates).eq('id', payload.data.code);
      if (upError) console.error('Webhook DB Update Error:', upError);
    }
  }

  res.status(200).send('OK');
});

if (isProduction) {
  app.use(express.static(path.join(rootDir, 'dist')));
  app.get('*', (_req, res) => res.sendFile(path.join(rootDir, 'dist', 'index.html')));
} else {
  import('vite').then(({ createServer }) => {
    createServer({ root: rootDir, server: { middlewareMode: true }, appType: 'spa' })
      .then(vite => app.use(vite.middlewares));
  });
}

app.listen(port, () => console.log(`Server running on port ${port}`));
