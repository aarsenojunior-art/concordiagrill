# Concórdia Grill

Site React/Vite com checkout hospedado do Pagar.me para PIX e cartão de crédito.

## Executar localmente

1. Instale as dependências com `npm install`.
2. Copie `.env.example` para `.env.local`.
3. Configure uma chave de teste do Pagar.me em `PAGARME_SECRET_KEY`.
4. Mantenha `PAGARME_BASE_URL=https://sdx-api.pagar.me/core/v5` durante os testes.
5. Execute `npm run dev` e abra `http://localhost:3000`.

O servidor recalcula o valor com base no pacote, convidados e opcionais cadastrados. A chave secreta nunca é enviada ao navegador.

## Ativar pagamentos reais

Depois de validar o fluxo no ambiente de teste:

1. Use uma conta Pagar.me aprovada e habilitada para PIX e cartão.
2. Cadastre `PAGARME_SECRET_KEY` como variável secreta na hospedagem.
3. Configure `PAGARME_BASE_URL=https://api.pagar.me/core/v5`.
4. Execute `npm run build` e inicie o servidor com `npm start`.
5. Faça uma compra real de baixo valor e confirme o recebimento no painel antes de divulgar o site.

Não coloque a chave secreta em arquivos do frontend, no repositório ou em variáveis que comecem com `VITE_`.

## Rotas

- `POST /api/checkout`: valida o carrinho e cria um link de pagamento de uso único.
- O cliente é redirecionado para o domínio seguro do Pagar.me, onde escolhe PIX ou cartão.
