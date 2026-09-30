-- Central pricing table for the public catalog, admin panel and secure checkout.
CREATE TABLE IF NOT EXISTS public.package_prices (
    package_code TEXT NOT NULL,
    guests INTEGER NOT NULL CHECK (guests IN (50, 100, 150)),
    price_cents INTEGER NOT NULL CHECK (price_cents > 0),
    active BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (package_code, guests)
);

ALTER TABLE public.package_prices ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.package_prices FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.package_prices TO service_role;

DROP TRIGGER IF EXISTS set_package_prices_updated_at ON public.package_prices;
CREATE TRIGGER set_package_prices_updated_at
    BEFORE UPDATE ON public.package_prices
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

INSERT INTO public.package_prices (package_code, guests, price_cents)
VALUES
    ('CG02', 50, 700000), ('CG02', 100, 1400000), ('CG02', 150, 2100000),
    ('CG06', 50, 750000), ('CG06', 100, 1500000), ('CG06', 150, 2250000),
    ('CG03', 50, 800000), ('CG03', 100, 1600000), ('CG03', 150, 2400000),
    ('CG04', 50, 850000), ('CG04', 100, 1700000), ('CG04', 150, 2550000)
ON CONFLICT (package_code, guests) DO UPDATE
SET price_cents = EXCLUDED.price_cents,
    active = true;

NOTIFY pgrst, 'reload schema';
