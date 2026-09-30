-- Orders and Pagar.me webhook event storage.
-- Client roles intentionally receive no direct table access; Edge Functions use service_role.

CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gateway_order_id TEXT UNIQUE,
    package_id TEXT NOT NULL,
    guests_adults INTEGER NOT NULL,
    guests_children INTEGER NOT NULL DEFAULT 0,
    optionals JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_cents INTEGER NOT NULL CHECK (total_cents > 0),
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_document TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Additive columns allow safe upgrades if an orders table already exists.
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS gateway_payment_link_id TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS gateway_charge_id TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS pix_qr_code TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS pix_qr_code_url TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS pix_expires_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS public.payment_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    gateway_event_id TEXT NOT NULL UNIQUE,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    processed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_events ADD COLUMN IF NOT EXISTS processed_at TIMESTAMPTZ NOT NULL DEFAULT now();

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;

-- Remove all existing policies, including permissive policies from earlier setups.
DO $migration$
DECLARE
    policy_row RECORD;
BEGIN
    FOR policy_row IN
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename IN ('orders', 'payment_events')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', policy_row.policyname, policy_row.schemaname, policy_row.tablename);
    END LOOP;
END
$migration$;

REVOKE ALL ON TABLE public.orders, public.payment_events FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.orders, public.payment_events TO service_role;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS set_orders_updated_at ON public.orders;
CREATE TRIGGER set_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Atomically records each event and updates its order. A retry after a SQL error
-- rolls back both writes, so a later delivery can safely retry the full operation.
CREATE OR REPLACE FUNCTION public.apply_pagarme_event(
    p_order_id UUID,
    p_event_id TEXT,
    p_event_type TEXT,
    p_payload JSONB,
    p_status TEXT,
    p_gateway_order_id TEXT,
    p_gateway_payment_link_id TEXT,
    p_charge_id TEXT,
    p_payment_method TEXT,
    p_pix_qr_code TEXT,
    p_pix_qr_code_url TEXT,
    p_pix_expires_at TIMESTAMPTZ
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
DECLARE
    current_status TEXT;
    inserted_event UUID;
BEGIN
    IF p_event_id IS NULL OR length(p_event_id) = 0 OR length(p_event_id) > 255 THEN
        RAISE EXCEPTION 'Invalid gateway event id' USING ERRCODE = '22023';
    END IF;

    SELECT status
      INTO current_status
      FROM public.orders
     WHERE id = p_order_id
     FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Order not found' USING ERRCODE = 'P0002';
    END IF;

    INSERT INTO public.payment_events (order_id, gateway_event_id, event_type, payload)
    VALUES (p_order_id, p_event_id, p_event_type, p_payload)
    ON CONFLICT (gateway_event_id) DO NOTHING
    RETURNING id INTO inserted_event;

    IF inserted_event IS NULL THEN
        RETURN FALSE;
    END IF;

    UPDATE public.orders
       SET status = CASE
               WHEN p_status = 'refunded' THEN 'refunded'
               WHEN p_status = 'paid' AND current_status <> 'refunded' THEN 'paid'
               WHEN current_status IN ('paid', 'refunded', 'failed', 'canceled') THEN current_status
               WHEN p_status IN ('pending', 'failed', 'canceled') THEN p_status
               ELSE current_status
           END,
           gateway_order_id = COALESCE(p_gateway_order_id, gateway_order_id),
           gateway_payment_link_id = COALESCE(p_gateway_payment_link_id, gateway_payment_link_id),
           gateway_charge_id = COALESCE(p_charge_id, gateway_charge_id),
           payment_method = COALESCE(p_payment_method, payment_method),
           pix_qr_code = COALESCE(p_pix_qr_code, pix_qr_code),
           pix_qr_code_url = COALESCE(p_pix_qr_code_url, pix_qr_code_url),
           pix_expires_at = COALESCE(p_pix_expires_at, pix_expires_at)
     WHERE id = p_order_id;

    RETURN TRUE;
END;
$function$;

REVOKE ALL ON FUNCTION public.apply_pagarme_event(UUID, TEXT, TEXT, JSONB, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TIMESTAMPTZ) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.apply_pagarme_event(UUID, TEXT, TEXT, JSONB, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TIMESTAMPTZ) TO service_role;
