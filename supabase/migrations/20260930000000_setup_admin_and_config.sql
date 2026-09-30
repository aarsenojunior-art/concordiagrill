-- Migration: Setup Admin, Payment Config and Order Tracking

-- 1. Administrators table
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
-- Permitir que o admin leia o próprio registro se estiver autenticado via Supabase Auth
CREATE POLICY "Admins can view own record" ON public.admins
    FOR SELECT TO authenticated
    USING (auth.uid() = id);

-- 2. Payment config table (stores encrypted pagarme key)
CREATE TABLE IF NOT EXISTS public.payment_config (
    id INTEGER PRIMARY KEY CHECK (id = 1), -- Tabela de linha única
    environment TEXT NOT NULL DEFAULT 'sandbox',
    pagarme_key_encrypted TEXT,
    pagarme_key_iv TEXT,
    pagarme_key_auth_tag TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.payment_config ENABLE ROW LEVEL SECURITY;
-- Acesso exclusivo via service_role (backend). Nenhuma política pública.

-- 3. Modify orders table to add tracking and payment details
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tracking_token_hash TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS pix_payload JSONB;

-- Remove the public read policy on orders (if it still exists) to enforce status checking via Express API
DROP POLICY IF EXISTS "Allow anon to select orders" ON public.orders;

-- Index for fast lookup by tracking token hash
CREATE INDEX IF NOT EXISTS idx_orders_tracking_hash ON public.orders(tracking_token_hash);

-- Trigger for payment_config updated_at
CREATE TRIGGER set_payment_config_updated_at
    BEFORE UPDATE ON public.payment_config
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
