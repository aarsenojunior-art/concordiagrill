# Concórdia Grill - Buffet & Celebrações

Sistema web de contratação direta de buffets para eventos do Concórdia Grill (Cuiabá - MT), com catálogo de pacotes, dimensionamento por quantidade de convidados (50, 100 e 150 pessoas) e redirecionamento para links externos de pagamento.

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
3. Ao clicar em **Contratar** ou **Ir para o pagamento**, o cliente é direcionado ao link externo configurado para o pacote e a quantidade selecionados.
4. Enquanto os links definitivos não estiverem disponíveis, todas as opções usam `https://www.google.com/` como endereço provisório.

## 3. Links de pagamento

Os endereços ficam centralizados em `EXTERNAL_PAYMENT_LINKS`, dentro de `packages.config.js`. Quando os links definitivos forem recebidos, basta substituir o endereço correspondente a cada pacote e quantidade.

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
- `server.js`: Servidor Express da aplicação.
- `src/`: Aplicação frontend React + Vite + Tailwind CSS.
  - `src/components/PackagesCatalog.tsx`: Catálogo com seletor de convidados e atualização dinâmica de preço.
  - `src/components/ProductPage.tsx`: Página de detalhes do pacote com termo de concordância e redirecionamento externo.
  - `src/components/EventSimulator.tsx`: Simulador "Meu evento".
  - `src/data/packages.ts`: Catálogo de cardápios, descrições e itens inclusos.
