# Concórdia Grill - Buffet & Celebrações

Sistema web de contratação direta de buffets para eventos do Concórdia Grill (Cuiabá - MT), com catálogo de pacotes, dimensionamento por quantidade de convidados (50, 100 e 150 pessoas) e checkout seguro integrado à Pagar.me v5.

## 1. Regras de Negócio e Pacotes

Os pacotes e seus valores são centralizados em `packages.config.js`:

1. **Confraterniza Grill** (CG02, Outros / Corporativo):
   - 50 pessoas: R$ 7.000,00
   - 100 pessoas: R$ 14.000,00
   - 150 pessoas: R$ 21.000,00

2. **Casamento Essencial** (CG06, Casamentos):
   - 50 pessoas: R$ 7.500,00
   - 100 pessoas: R$ 15.000,00
   - 150 pessoas: R$ 22.500,00

3. **Celebração Grill** (CG03, Aniversário - Destaque):
   - 50 pessoas: R$ 8.000,00
   - 100 pessoas: R$ 16.000,00
   - 150 pessoas: R$ 24.000,00

4. **15 Anos Essencial** (CG04, 15 Anos):
   - 50 pessoas: R$ 8.500,00
   - 100 pessoas: R$ 17.000,00
   - 150 pessoas: R$ 25.500,00

## 2. Fluxo de Compra Direto (Sem Carrinho)

1. O cliente visualiza os pacotes e seleciona o número de convidados (50, 100 ou 150) no card ou na página individual do produto.
2. O valor total em BRL atualiza instantaneamente.
3. Ao clicar em **Contratar** ou **Ir para o pagamento**, o modal de checkout solicita os dados do titular (nome, e-mail, telefone, CPF/CNPJ) e forma de pagamento (PIX ou Cartão).
4. O backend valida os dados, calcula o total diretamente do arquivo de configuração `packages.config.js` (nunca confiando em valores vindos do navegador) e gera a sessão de pagamento seguro na Pagar.me.

## 3. Variáveis de Ambiente do Servidor

As credenciais ficam **exclusivamente no servidor**, configuradas no arquivo `.env` (nunca no código e nunca no frontend):

- `PORT`: Porta do servidor HTTP (padrão: 3000).
- `PAGARME_SECRET_KEY`: Chave secreta da Pagar.me v5 (`sk_...`).
- `PAGARME_ENVIRONMENT`: `production` ou `sandbox`.
- `WEBHOOK_SECRET`: (Opcional) Senha de autenticação Basic para os webhooks da Pagar.me.

## 4. Como Executar

### Desenvolvimento Local:
```bash
npm install
npm run dev
```

### Build e Produção (Hostinger):
```bash
npm run build
npm start
```

## 5. Estrutura do Projeto

- `packages.config.js`: Arquivo central de preços e nomes de pacotes.
- `server.js`: Backend Express com cálculo seguro de valores, integração Pagar.me e persistência local de pedidos.
- `src/`: Aplicação frontend React + Vite + Tailwind CSS.
  - `src/components/PackagesCatalog.tsx`: Catálogo com seletor de convidados e atualização dinâmica de preço.
  - `src/components/ProductPage.tsx`: Página de detalhes do pacote com termo de concordância e checkout direto.
  - `src/components/EventSimulator.tsx`: Simulador "Meu evento".
  - `src/components/GatewayModal.tsx`: Formulário de dados do titular e redirecionamento Pagar.me.
  - `src/data/packages.ts`: Catálogo de cardápios, descrições e itens inclusos.
