import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import express from 'express';
import { PACKAGE_PRICE_CENTS, PACKAGE_NAMES, ALLOWED_GUEST_COUNTS, getExternalPaymentUrl } from './packages.config.js';

dotenv.config({ path: ['.env.local', '.env'] });

const app = express();
const port = Number(process.env.PORT || 3000);
const rootDir = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === 'production' || process.argv.includes('--production');

// Armazenamento local leve de pedidos (zero dependência de banco de dados externo)
const dataDir = path.join(rootDir, 'data');
const ordersFilePath = path.join(dataDir, 'orders.json');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
if (!fs.existsSync(ordersFilePath)) {
  fs.writeFileSync(ordersFilePath, JSON.stringify([], null, 2), 'utf-8');
}

function readOrders() {
  try {
    const raw = fs.readFileSync(ordersFilePath, 'utf-8');
    return JSON.parse(raw) || [];
  } catch (err) {
    console.error('Erro ao ler pedidos locais:', err);
    return [];
  }
}

function saveOrders(orders) {
  try {
    fs.writeFileSync(ordersFilePath, JSON.stringify(orders, null, 2), 'utf-8');
  } catch (err) {
    console.error('Erro ao salvar pedidos locais:', err);
  }
}

function recordOrder(order) {
  const orders = readOrders();
  orders.unshift(order);
  // Mantém os 500 pedidos mais recentes
  if (orders.length > 500) orders.length = 500;
  saveOrders(orders);
}

function updateOrder(orderId, updates) {
  const orders = readOrders();
  const index = orders.findIndex((o) => o.id === orderId || o.gatewayOrderId === orderId || o.orderCode === orderId);
  if (index !== -1) {
    orders[index] = { ...orders[index], ...updates, updatedAt: new Date().toISOString() };
    saveOrders(orders);
    return orders[index];
  }
  return null;
}

function findOrderByTokenHash(tokenHash) {
  const orders = readOrders();
  return orders.find((o) => o.trackingTokenHash === tokenHash) || null;
}

app.disable('x-powered-by');
app.use(express.json({ limit: '20kb' }));

// Preço calculado com segurança no backend a partir de packages.config.js
function resolvePackagePrice(packageCode, guests) {
  if (!PACKAGE_PRICE_CENTS[packageCode]) return null;
  const price = PACKAGE_PRICE_CENTS[packageCode][guests];
  if (typeof price !== 'number') return null;
  return { packageCode, guests, priceCents: price };
}

// Inicia checkout seguro com Pagar.me v5
app.post('/api/checkout', async (req, res) => {
  const body = req.body || {};
  const packageCode = typeof body.packageCode === 'string' ? body.packageCode.trim().toUpperCase() : '';
  const guests = Number(body.guests);

  if (!PACKAGE_PRICE_CENTS[packageCode]) {
    return res.status(400).json({ error: 'Pacote inválido ou não encontrado.' });
  }

  if (!Number.isInteger(guests) || !ALLOWED_GUEST_COUNTS.includes(guests)) {
    return res.status(400).json({ error: 'Quantidade de convidados inválida. Opções permitidas: 50, 100 ou 150 pessoas.' });
  }

  // Preço calculado no backend a partir de packages.config.js — NUNCA confia no navegador
  const priceInfo = resolvePackagePrice(packageCode, guests);
  if (!priceInfo) {
    return res.status(400).json({ error: 'Preço não configurado para este pacote e quantidade.' });
  }

  // Chaves da Pagar.me ficam SOMENTE nas variáveis de ambiente do servidor
  const pagarmeKey = process.env.PAGARME_SECRET_KEY || process.env.PAGARME_KEY;
  if (!pagarmeKey || pagarmeKey.includes('sua_chave')) {
    const externalUrl = getExternalPaymentUrl(packageCode, guests);
    return res.json({
      url: externalUrl,
      totalFormatted: (priceInfo.priceCents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
    });
  }

  const isPagarmeProd = process.env.PAGARME_ENVIRONMENT === 'production' || (!pagarmeKey.startsWith('sk_test_') && isProduction);
  const baseUrl = isPagarmeProd ? 'https://api.pagar.me/core/v5' : 'https://sdx-api.pagar.me/core/v5';

  const orderId = `CG-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  const trackingToken = crypto.randomBytes(32).toString('hex');
  const trackingTokenHash = crypto.createHash('sha256').update(trackingToken).digest('hex');

  const packageName = PACKAGE_NAMES[packageCode] || packageCode;
  const items = [
    {
      name: `${packageName} — ${guests} pessoas`,
      description: `Buffet Concórdia Grill - Pacote ${packageCode} (${guests} convidados)`,
      amount: priceInfo.priceCents,
      default_quantity: 1,
    },
  ];

  const orderRecord = {
    id: orderId,
    orderCode: orderId,
    packageCode,
    packageName,
    guests,
    totalCents: priceInfo.priceCents,
    customer_name: body.customer_name || 'Não informado',
    customer_email: body.customer_email || 'nao@informado.com',
    customer_phone: body.customer_phone || 'Não informado',
    customer_document: body.customer_document || '',
    trackingTokenHash,
    status: 'pending',
    payment_method: body.payment_method || 'pix',
    createdAt: new Date().toISOString(),
  };

  recordOrder(orderRecord);

  const payload = {
    type: 'order',
    name: `Concórdia Grill - ${packageName}`,
    order_code: orderId,
    expires_in: 120, // 2 horas
    max_paid_sessions: 1,
    payment_settings: {
      accepted_payment_methods: body.payment_method ? [body.payment_method] : ['pix', 'credit_card'],
    },
    cart_settings: { items },
    customer_settings: {
      customer: {
        name: body.customer_name || 'Cliente Concórdia Grill',
        email: body.customer_email || 'cliente@concordiagrill.com.br',
        phones: body.customer_phone ? {
          mobile_phone: {
            country_code: '55',
            area_code: body.customer_phone.replace(/\D/g, '').slice(0, 2) || '65',
            number: body.customer_phone.replace(/\D/g, '').slice(2) || '999999999',
          }
        } : undefined,
      }
    }
  };

  try {
    const response = await fetch(`${baseUrl}/paymentlinks`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Basic ${Buffer.from(`${pagarmeKey.trim()}:`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.url) {
      console.error('Erro na resposta da Pagar.me:', result);
      return res.status(502).json({
        error: result.message || 'Erro ao gerar o link de pagamento na Pagar.me. Verifique suas credenciais.',
      });
    }

    updateOrder(orderId, { gatewayOrderId: result.id, paymentUrl: result.url });

    res.json({
      url: result.url,
      orderCode: orderId,
      trackingToken,
      totalFormatted: (priceInfo.priceCents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
    });
  } catch (error) {
    console.error('Erro de conexão com Pagar.me:', error);
    res.status(502).json({ error: 'Serviço de pagamento indisponível temporariamente.' });
  }
});

// Consulta de status do pedido por token seguro
app.get('/api/order-status', (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido ou inválido' });
  }
  const token = authHeader.split(' ')[1];
  const hash = crypto.createHash('sha256').update(token).digest('hex');

  const order = findOrderByTokenHash(hash);
  if (!order) {
    return res.status(404).json({ error: 'Pedido não encontrado' });
  }

  res.json({
    orderCode: order.orderCode,
    status: order.status,
    packageName: order.packageName,
    guests: order.guests,
    amount: order.totalCents,
    paymentMethod: order.payment_method,
    pix: order.pix_payload || null,
  });
});

// Webhook da Pagar.me v5 para confirmação de pagamento
app.post('/api/webhook', (req, res) => {
  const webhookSecret = process.env.WEBHOOK_SECRET;
  if (webhookSecret) {
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== `Basic ${Buffer.from(`${webhookSecret}:`).toString('base64')}`) {
      console.error('Falha de autenticação no webhook Pagar.me.');
      return res.status(401).send('Unauthorized');
    }
  }

  const payload = req.body;
  if (!payload || !payload.id || !payload.type) {
    return res.status(400).send('Invalid');
  }

  const orderCode = payload.data?.code;
  if (orderCode) {
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
          expires_at: charges[0].last_transaction.expires_at,
        };
      }
    }

    if (Object.keys(updates).length > 0) {
      updateOrder(orderCode, updates);
    }
  }

  res.status(200).send('OK');
});

// Servir frontend
if (isProduction) {
  app.use(express.static(path.join(rootDir, 'dist')));
  app.get('*', (_req, res) => res.sendFile(path.join(rootDir, 'dist', 'index.html')));
} else {
  import('vite').then(({ createServer }) => {
    createServer({ root: rootDir, server: { middlewareMode: true }, appType: 'spa' }).then((vite) => {
      app.use(vite.middlewares);
    });
  });
}

app.listen(port, () => console.log(`Servidor Concórdia Grill rodando na porta ${port}`));
