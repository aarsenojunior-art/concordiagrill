-- Migration: Fix RLS policies and ensure admin setup is complete
-- Data: 2026-09-30
-- CAUSA RAIZ: faltava GRANT SELECT para o role authenticated na tabela admins,
-- causando o erro "permission denied" mesmo com RLS policy correta.

-- 1. Concede permissão de SELECT para usuários autenticados na tabela admins
GRANT SELECT ON TABLE public.admins TO authenticated;

-- 2. Recria a política RLS para garantir que ela está ativa e correta
DROP POLICY IF EXISTS "Admins can view own record" ON public.admins;

CREATE POLICY "Admins can view own record"
  ON public.admins
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- 3. Garante que payment_config tem ao menos 1 linha (sandbox)
-- para evitar o erro 503 "checkout não configurado"
INSERT INTO public.payment_config (id, environment)
VALUES (1, 'sandbox')
ON CONFLICT (id) DO NOTHING;
