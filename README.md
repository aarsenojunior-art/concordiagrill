# Concórdia Grill - Integração Pagar.me & Supabase

Este projeto foi construído com Vite, React, Tailwind e um backend Express, integrado ao Supabase para Autenticação e Banco de Dados, e ao Pagar.me V5 para Checkouts.

## 1. Visão Geral da Arquitetura
O frontend interage com o backend via `/api/*`. O backend é responsável pelas rotas administrativas e de checkout, processando criptografia local, não expondo segredos.
As chaves da Pagar.me são salvas com criptografia AES-256-GCM no Supabase (`payment_config`), gerenciadas pelo painel de controle restrito no frontend (`/admin`).

## 2. Instalação Local
1. Clone o repositório.
2. Rode `npm install --legacy-peer-deps`.
3. Renomeie `.env.example` para `.env` e preencha suas variáveis.
4. Rode `npm run dev` para desenvolvimento local.

## 3. Variáveis de Ambiente Necessárias
- `VITE_SUPABASE_URL`: A URL pública do seu projeto Supabase.
- `VITE_SUPABASE_ANON_KEY`: A chave pública do Supabase (safe para o frontend).
- `SUPABASE_URL`: A mesma URL (uso do backend).
- `SUPABASE_SERVICE_ROLE_KEY`: A chave secreta/admin do Supabase. NUNCA exponha.
- `ENCRYPTION_KEY`: Uma string de exatos **32 bytes (caracteres)** para a encriptação. Para gerar no terminal Node: `require('crypto').randomBytes(32).toString('base64').slice(0,32)`

## 4. Configuração do Supabase
1. Aplique a migration existente em `supabase/migrations/` no editor SQL do Supabase.
2. Crie seu usuário admin no **Authentication** > **Users**.
3. Copie o `id` gerado.
4. Insira um registro na tabela `admins` com esse `id` e seu `email`.

## 5. Deploy na Hostinger (VPS ou Node.js)
Este projeto roda em um servidor contínuo Node.js. Planos básicos de hospedagem compartilhada que não suportam Node contínuo NÃO servem; é necessário um plano **VPS** ou **Plano Cloud/Node.js** da Hostinger.
1. Configure as variáveis de ambiente no painel da Hostinger ou crie o `.env`.
2. Rode `npm install --production --legacy-peer-deps`.
3. Rode `npm run build`.
4. Inicie o servidor com `npm start` (ou use PM2/Phusion Passenger conforme sua hospedagem).
5. No painel da Pagar.me, cadastre a URL do webhook como `https://SEU_DOMINIO/api/webhook`.

## 6. Scripts Disponíveis
- `npm run dev`: Roda o servidor e o Vite em modo desenvolvimento.
- `npm run build`: Compila a versão de produção.
- `npm start`: Inicia o backend já servindo a pasta `dist` na produção.
- `npm run lint`: Checa tipagem.
