import { createClient } from '@supabase/supabase-js';

// VITE_ vars are embedded at build time. The fallbacks below are the PUBLIC
// project credentials (anon key — safe for client-side use, NOT the service_role key).
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  'https://zemqeaorsunajpevdiwj.supabase.co';

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplbXFlYW9yc3VuYWpwZXZkaXdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3MjYyOTcsImV4cCI6MjEwNjMwMjI5N30.8o7XpEAHTLzGoFYyNvzSlgWk9PlaoRb5ISw1lFub4pM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
