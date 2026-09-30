import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders, isAllowedOrigin } from '../_shared/cors.ts'
import { buildCheckoutItems, calculateTotalCents, validateCheckoutRequest } from '../_shared/packages.ts'

const TEST_API_BASE = 'https://sdx-api.pagar.me/core/v5'
const CHECKOUT_HOSTS = new Set(['payment-link.pagar.me', 'checkout.pagar.me'])
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function jsonResponse(request: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(request), 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  })
}

function normalizeCustomer(body: Record<string, unknown>) {
  const input = body.customer && typeof body.customer === 'object' && !Array.isArray(body.customer)
    ? body.customer as Record<string, unknown>
    : body
  const name = typeof input.customer_name === 'string' ? input.customer_name.trim() : ''
  const email = typeof input.customer_email === 'string' ? input.customer_email.trim().toLowerCase() : ''
  const phone = typeof input.customer_phone === 'string' ? input.customer_phone.replace(/\D/g, '') : ''
  const document = typeof input.customer_document === 'string'
    ? input.customer_document.replace(/\D/g, '')
    : ''

  if (name.length < 2 || name.length > 160 || !EMAIL_PATTERN.test(email) || email.length > 254 || phone.length < 10 || phone.length > 13) {
    return { error: 'Informe nome, e-mail e telefone válidos.' }
  }
  if (document && ![11, 14].includes(document.length)) {
    return { error: 'Informe um CPF ou CNPJ válido.' }
  }

  return { name, email, phone, document: document || null }
}

function configuredTestBase() {
  const value = Deno.env.get('PAGARME_BASE_URL') || TEST_API_BASE
  const url = new URL(value)
  if (url.protocol !== 'https:' || url.hostname !== 'sdx-api.pagar.me' || url.pathname.replace(/\/$/, '') !== '/core/v5') {
    throw new Error('PAGARME_BASE_URL deve apontar para o ambiente de testes da Pagar.me.')
  }
  return url.href.replace(/\/$/, '')
}

Deno.serve(async (request) => {
  const headers = corsHeaders(request)
  if (request.method === 'OPTIONS') return new Response('ok', { headers })
  if (!isAllowedOrigin(request.headers.get('Origin'))) return jsonResponse(request, { error: 'Origem não permitida.' }, 403)
  if (request.method !== 'POST') return jsonResponse(request, { error: 'Método não permitido.' }, 405)

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const pagarmeSecret = Deno.env.get('PAGARME_SECRET_KEY')
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Supabase server configuration is incomplete.')
    return jsonResponse(request, { error: 'O serviço de pedidos está temporariamente indisponível.' }, 503)
  }
  if (!pagarmeSecret) return jsonResponse(request, { error: 'O checkout ainda não foi ativado pelo estabelecimento.' }, 503)

  let baseUrl: string
  try {
    baseUrl = configuredTestBase()
  } catch {
    return jsonResponse(request, { error: 'O ambiente de testes da Pagar.me está configurado incorretamente.' }, 503)
  }

  try {
    const body = await request.json()
    const validated = validateCheckoutRequest(body)
    if ('error' in validated) return jsonResponse(request, { error: validated.error }, 400)

    const customer = normalizeCustomer(body as Record<string, unknown>)
    if ('error' in customer) return jsonResponse(request, { error: customer.error }, 400)

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
    const totalCents = calculateTotalCents(validated.packageCode, validated.guests, validated.selectedExtras)
    const { data: order, error: insertError } = await supabase
      .from('orders')
      .insert({
        package_id: validated.packageCode,
        guests_adults: validated.guests,
        guests_children: 0,
        optionals: validated.selectedExtras,
        total_cents: totalCents,
        customer_name: customer.name,
        customer_email: customer.email,
        customer_phone: customer.phone,
        customer_document: customer.document,
        status: 'pending',
      })
      .select('id')
      .single()

    if (insertError || !order) {
      console.error('Order insert failed:', insertError?.code ?? 'unknown database error')
      return jsonResponse(request, { error: 'Não foi possível registrar o pedido. Tente novamente.' }, 500)
    }

    const paymentLinkPayload = {
      type: 'order',
      name: `Concórdia Grill ${validated.packageCode}`,
      order_code: order.id,
      expires_in: 120,
      max_paid_sessions: 1,
      payment_settings: { accepted_payment_methods: ['pix', 'credit_card'] },
      cart_settings: {
        items: buildCheckoutItems(validated.packageCode, validated.guests, validated.selectedExtras),
      },
    }

    const pagarmeResponse = await fetch(`${baseUrl}/paymentlinks`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Basic ${btoa(`${pagarmeSecret}:`)}`,
        'Content-Type': 'application/json',
        'User-Agent': 'concordia-grill-checkout/2.0 (Supabase Edge)',
      },
      body: JSON.stringify(paymentLinkPayload),
      signal: AbortSignal.timeout(15000),
    })
    const result = await pagarmeResponse.json().catch(() => ({}))

    if (!pagarmeResponse.ok) {
      console.error('Pagar.me rejected payment link:', pagarmeResponse.status)
      await supabase.from('orders').update({ status: 'failed' }).eq('id', order.id)
      return jsonResponse(request, { error: 'Não foi possível iniciar o pagamento. Tente novamente.' }, 502)
    }

    let checkoutUrl: URL
    try {
      checkoutUrl = new URL(result.url)
    } catch {
      console.error('Pagar.me returned an invalid checkout URL.')
      await supabase.from('orders').update({ status: 'failed' }).eq('id', order.id)
      return jsonResponse(request, { error: 'O gateway retornou um endereço de pagamento inválido.' }, 502)
    }
    if (checkoutUrl.protocol !== 'https:' || !CHECKOUT_HOSTS.has(checkoutUrl.hostname) || typeof result.id !== 'string') {
      console.error('Pagar.me returned an unexpected checkout response.')
      await supabase.from('orders').update({ status: 'failed' }).eq('id', order.id)
      return jsonResponse(request, { error: 'O gateway retornou uma resposta de pagamento inválida.' }, 502)
    }

    const { error: updateError } = await supabase
      .from('orders')
      .update({ gateway_order_id: result.id })
      .eq('id', order.id)
    if (updateError) {
      console.error('Could not save the Pagar.me payment link id:', updateError.code)
      return jsonResponse(request, { error: 'O pagamento foi preparado, mas não foi possível confirmar o pedido. Fale com o estabelecimento.' }, 502)
    }

    return jsonResponse(request, { url: checkoutUrl.href, orderId: order.id })
  } catch (error) {
    console.error('Checkout request failed:', error instanceof Error ? error.name : 'unknown error')
    return jsonResponse(request, { error: 'Não foi possível iniciar o pagamento. Verifique os dados e tente novamente.' }, 500)
  }
})
