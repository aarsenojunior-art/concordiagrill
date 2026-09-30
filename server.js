import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import express from 'express';

dotenv.config({ path: ['.env.local', '.env'] });

const app = express();
const port = Number(process.env.PORT || 3000);
const rootDir = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === 'production' || process.argv.includes('--production');

const packages = {
  CG02: { name: 'Confraterniza Grill', pricePerPerson: 160 },
  CG03: { name: 'Celebração Grill', pricePerPerson: 160 },
  CG04: { name: '15 Anos Essencial', pricePerPerson: 160 },
  CG06: { name: 'Casamento Essencial', pricePerPerson: 160 },
};

const extras = {
  beverages: { name: 'Open Bar de Bebidas Não Alcoólicas', pricePerPerson: 18 },
  draft_beer: { name: 'Chopp Artesanal ou Cerveja Pilsen Premium', pricePerPerson: 32 },
  extra_dessert: { name: 'Mesa de Doces Finos e Sobremesas', pricePerPerson: 15 },
  extra_hour: { name: 'Hora Adicional de Buffet', fixedPrice: 1200 },
};

const allowedGuestCounts = new Set([25, 50, 75, 100, 150, 200, 250, 300]);
const allowedCheckoutHosts = new Set(['payment-link.pagar.me', 'checkout.pagar.me']);

app.disable('x-powered-by');
app.use(express.json({ limit: '20kb' }));

function toCents(value) {
  return Math.round(value * 100);
}

function buildCheckoutItems(packageCode, guests, selectedExtras) {
  const selectedPackage = packages[packageCode];
  const items = [
    {
      name: `${selectedPackage.name} - ${guests} pessoas`,
      description: `Pacote ${packageCode} do Concórdia Grill`,
      amount: toCents(selectedPackage.pricePerPerson * guests),
      default_quantity: 1,
    },
  ];

  for (const extraId of selectedExtras) {
    const extra = extras[extraId];
    const price = extra.fixedPrice ?? extra.pricePerPerson * guests;
    items.push({
      name: extra.name,
      description: `Opcional para ${guests} pessoas`,
      amount: toCents(price),
      default_quantity: 1,
    });
  }

  return items;
}

function validateCheckoutRequest(body) {
  const packageCode = typeof body.packageCode === 'string' ? body.packageCode.toUpperCase() : '';
  const guests = Number(body.guests);
  const selectedExtras = Array.isArray(body.selectedExtras) ? body.selectedExtras : [];

  if (!packages[packageCode]) return { error: 'Pacote inválido.' };
  if (!Number.isInteger(guests) || !allowedGuestCounts.has(guests)) {
    return { error: 'Quantidade de convidados inválida.' };
  }
  if (selectedExtras.length > Object.keys(extras).length || new Set(selectedExtras).size !== selectedExtras.length) {
    return { error: 'Lista de opcionais inválida.' };
  }
  if (selectedExtras.some((id) => typeof id !== 'string' || !extras[id])) {
    return { error: 'Um dos opcionais selecionados é inválido.' };
  }

  return { packageCode, guests, selectedExtras };
}

app.post('/api/checkout', async (request, response) => {
  const validated = validateCheckoutRequest(request.body ?? {});
  if ('error' in validated) return response.status(400).json({ error: validated.error });

  const secretKey = process.env.PAGARME_SECRET_KEY;
  const baseUrl = (process.env.PAGARME_BASE_URL || 'https://sdx-api.pagar.me/core/v5').replace(/\/$/, '');

  if (!secretKey) {
    return response.status(503).json({
      error: 'O checkout ainda não foi ativado pelo estabelecimento.',
    });
  }

  const orderCode = `CG-${crypto.randomUUID().replaceAll('-', '').slice(0, 20).toUpperCase()}`;
  const payload = {
    type: 'order',
    name: `Concórdia Grill ${validated.packageCode}`,
    order_code: orderCode,
    expires_in: 120,
    max_paid_sessions: 1,
    payment_settings: {
      accepted_payment_methods: ['pix', 'credit_card'],
    },
    cart_settings: {
      items: buildCheckoutItems(validated.packageCode, validated.guests, validated.selectedExtras),
    },
  };

  try {
    const pagarmeResponse = await fetch(`${baseUrl}/paymentlinks`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Basic ${Buffer.from(`${secretKey}:`).toString('base64')}`,
        'Content-Type': 'application/json',
        'User-Agent': 'concordia-grill-checkout/1.0',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15000),
    });

    const result = await pagarmeResponse.json().catch(() => ({}));
    if (!pagarmeResponse.ok) {
      console.error('Pagar.me checkout error', pagarmeResponse.status, result);
      return response.status(502).json({ error: 'Não foi possível iniciar o pagamento. Tente novamente.' });
    }

    const checkoutUrl = new URL(result.url);
    if (checkoutUrl.protocol !== 'https:' || !allowedCheckoutHosts.has(checkoutUrl.hostname)) {
      console.error('Unexpected checkout URL returned by Pagar.me', result.url);
      return response.status(502).json({ error: 'O gateway retornou um endereço de pagamento inválido.' });
    }

    return response.json({ url: checkoutUrl.href, orderCode });
  } catch (error) {
    console.error('Unable to create Pagar.me checkout', error);
    return response.status(502).json({ error: 'O serviço de pagamento está temporariamente indisponível.' });
  }
});

if (isProduction) {
  app.use(express.static(path.join(rootDir, 'dist')));
  app.get('*', (_request, response) => response.sendFile(path.join(rootDir, 'dist', 'index.html')));
} else {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    root: rootDir,
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

app.listen(port, () => {
  console.log(`Concórdia Grill disponível em http://localhost:${port}`);
});
