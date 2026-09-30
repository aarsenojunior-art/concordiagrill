import { createClient } from '@supabase/supabase-js';

// VITE_ vars are embedded at build time. These fallbacks are PUBLIC browser
// credentials. Never place the service_role key in this file.
const fallbackUrl = 'https://zemqeaorsunajpevdiwj.supabase.co';
const fallbackAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplbXFlYW9yc3VuYWpwZXZkaXdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3MjYyOTcsImV4cCI6MjEwNjMwMjI5N30.8o7XpEAHTLzGoFYyNvzSlgWk9PlaoRb5ISw1lFub4pM';

function isValidSupabaseUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false;

  try {
    const url = new URL(value.trim());
    return url.protocol === 'https:' && url.hostname.endsWith('.supabase.co');
  } catch {
    return false;
  }
}

function isValidPublicKey(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const key = value.trim();

  // Supabase accepts both the current publishable format and legacy anon JWTs.
  return key.startsWith('sb_publishable_') ||
    (key.startsWith('eyJ') && key.split('.').length === 3);
}

const configuredUrl = import.meta.env.VITE_SUPABASE_URL;
const configuredAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabaseUrl = isValidSupabaseUrl(configuredUrl)
  ? configuredUrl.trim()
  : fallbackUrl;

const supabaseAnonKey = isValidPublicKey(configuredAnonKey)
  ? configuredAnonKey.trim()
  : fallbackAnonKey;

if (configuredUrl && !isValidSupabaseUrl(configuredUrl)) {
  console.warn('VITE_SUPABASE_URL inválida; usando a URL pública configurada no aplicativo.');
}

if (configuredAnonKey && !isValidPublicKey(configuredAnonKey)) {
  console.warn('VITE_SUPABASE_ANON_KEY inválida; usando a chave pública configurada no aplicativo.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
