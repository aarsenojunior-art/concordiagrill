const DEFAULT_ALLOWED_ORIGINS = new Set([
  'http://localhost:3000',
  'http://localhost:4173',
  'http://localhost:5173',
])

export function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return true

  const configuredOrigins = (Deno.env.get('ALLOWED_ORIGINS') ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
  const allowedOrigins = configuredOrigins.length > 0
    ? new Set(configuredOrigins)
    : DEFAULT_ALLOWED_ORIGINS

  return allowedOrigins.has(origin)
}

export function corsHeaders(request: Request): HeadersInit {
  const origin = request.headers.get('Origin')
  const headers: Record<string, string> = {
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  }

  if (origin && isAllowedOrigin(origin)) {
    headers['Access-Control-Allow-Origin'] = origin
  }

  return headers
}
