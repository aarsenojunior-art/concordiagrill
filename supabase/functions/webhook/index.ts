import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const MAX_BODY_BYTES = 256_000

function secureEquals(left: string, right: string): boolean {
  const encoder = new TextEncoder()
  const a = encoder.encode(left)
  const b = encoder.encode(right)
  let diff = a.length ^ b.length
  const max = Math.max(a.length, b.length)
  for (let i = 0; i < max; i++) diff |= (a[i] ?? 0) ^ (b[i] ?? 0)
  return diff === 0
}

function getObject(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null
}

function getOrderId(data: Record<string, unknown>): string | null {
  const nestedOrder = getObject(data.order)
  const metadata = getObject(data.metadata)
  const candidates = [data.code, data.order_code, nestedOrder?.code, metadata?.order_id]
  return candidates.find((value): value is string => typeof value === 'string' && UUID_PATTERN.test(value)) ?? null
}

function firstCharge(data: Record<string, unknown>): Record<string, unknown> | null {
  const charges = Array.isArray(data.charges) ? data.charges : []
  return getObject(charges[0])
}

function eventUpdate(eventType: string, data: Record<string, unknown>) {
  const charge = firstCharge(data)
  const transaction = getObject(charge?.last_transaction) ?? getObject(data.last_transaction)
  const chargeId = eventType.startsWith('charge.') && typeof data.id === 'string'
    ? data.id
    : typeof charge?.id === 'string' ? charge.id : null
  const paymentMethod = typeof data.payment_method === 'string'
    ? data.payment_method
    : typeof charge?.payment_method === 'string' ? charge.payment_method : null
  const pixCode = typeof transaction?.qr_code === 'string' ? transaction.qr_code : null
  const pixImage = typeof transaction?.qr_code_url === 'string' ? transaction.qr_code_url : null
  const pixExpiresAt = typeof transaction?.expires_at === 'string' ? transaction.expires_at : null

  const statusByEvent: Record<string, string> = {
    'order.paid': 'paid',
    'charge.paid': 'paid',
    'order.payment_failed': 'failed',
    'charge.payment_failed': 'failed',
    'order.canceled': 'canceled',
    'charge.canceled': 'canceled',
    'charge.pending': 'pending',
    'charge.refunded': 'refunded',
  }

  return {
    status: statusByEvent[eventType] ?? null,
    chargeId,
    paymentMethod,
    pixCode: paymentMethod === 'pix' ? pixCode : null,
    pixImage: paymentMethod === 'pix' ? pixImage : null,
    pixExpiresAt: paymentMethod === 'pix' ? pixExpiresAt : null,
  }
}

Deno.serve(async (request) => {
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 })

  const webhookSecret = Deno.env.get('PAGARME_WEBHOOK_TOKEN')
  if (!webhookSecret || webhookSecret.length < 32) {
    console.error('PAGARME_WEBHOOK_TOKEN is missing or too short.')
    return new Response('Webhook is not configured', { status: 503 })
  }
  const token = new URL(request.url).searchParams.get('token') ?? ''
  if (!secureEquals(webhookSecret, token)) return new Response('Unauthorized', { status: 401 })

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Supabase webhook configuration is incomplete.')
    return new Response('Webhook is not configured', { status: 503 })
  }

  try {
    const rawBody = await request.text()
    if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
      return new Response('Payload too large', { status: 413 })
    }
    const payload = getObject(JSON.parse(rawBody))
    const data = getObject(payload?.data)
    const eventId = payload?.id
    const eventType = payload?.type
    if (!payload || !data || typeof eventId !== 'string' || eventId.length < 1 || eventId.length > 255 || typeof eventType !== 'string' || eventType.length > 100) {
      return new Response('Invalid payload', { status: 400 })
    }

    const orderId = getOrderId(data)
    if (!orderId) return new Response('Order code not recognized', { status: 400 })

    const changes = eventUpdate(eventType, data)
    const charge = firstCharge(data)
    const transaction = getObject(charge?.last_transaction) ?? getObject(data.last_transaction)
    // Keep an allowlisted audit record; the full webhook can contain customer PII.
    const safePayload = {
      id: eventId,
      type: eventType,
      data: {
        id: typeof data.id === 'string' ? data.id : null,
        code: orderId,
        status: typeof data.status === 'string' ? data.status : null,
        payment_method: changes.paymentMethod,
        charge_id: changes.chargeId,
        pix_qr_code: changes.pixCode,
        pix_qr_code_url: changes.pixImage,
        pix_expires_at: changes.pixExpiresAt,
        transaction_status: typeof transaction?.status === 'string' ? transaction.status : null,
      },
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
    const { data: applied, error } = await supabase.rpc('apply_pagarme_event', {
      p_order_id: orderId,
      p_event_id: eventId,
      p_event_type: eventType,
      p_payload: safePayload,
      p_status: changes.status,
      p_charge_id: changes.chargeId,
      p_payment_method: changes.paymentMethod,
      p_pix_qr_code: changes.pixCode,
      p_pix_qr_code_url: changes.pixImage,
      p_pix_expires_at: changes.pixExpiresAt,
    })

    if (error) {
      console.error('Could not apply Pagar.me event:', error.code ?? 'database error')
      return new Response('Could not process event', { status: 500 })
    }

    return new Response(applied === true ? 'OK' : 'Already processed', { status: 200 })
  } catch (error) {
    console.error('Webhook processing failed:', error instanceof Error ? error.name : 'unknown error')
    return new Response('Invalid or unprocessable webhook', { status: 400 })
  }
})
