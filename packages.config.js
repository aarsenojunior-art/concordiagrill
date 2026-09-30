// packages.config.js
// Configuração central de pacotes e preços do Concórdia Grill.
// Compartilhado pelo backend Node.js e frontend React/Vite.
// Todos os valores em centavos (ex.: 700000 = R$ 7.000,00).

export const PACKAGE_PRICE_CENTS = {
  // 1) Confraterniza Grill (OUTROS, CG02)
  CG02: {
    50: 700000,   // R$ 7.000,00
    100: 1400000, // R$ 14.000,00
    150: 2100000, // R$ 21.000,00
  },
  // 2) Casamento Essencial (CASAMENTO, CG06)
  CG06: {
    50: 750000,   // R$ 7.500,00
    100: 1500000, // R$ 15.000,00
    150: 2250000, // R$ 22.500,00
  },
  // 3) Celebração Grill (ANIVERSÁRIO, selo DESTAQUE, CG03)
  CG03: {
    50: 800000,   // R$ 8.000,00
    100: 1600000, // R$ 16.000,00
    150: 2400000, // R$ 24.000,00
  },
  // 4) 15 Anos Essencial (15 ANOS, CG04)
  CG04: {
    50: 850000,   // R$ 8.500,00
    100: 1700000, // R$ 17.000,00
    150: 2550000, // R$ 25.500,00
  },
};

export const PACKAGE_NAMES = {
  CG02: 'Confraterniza Grill',
  CG06: 'Casamento Essencial',
  CG03: 'Celebração Grill',
  CG04: '15 Anos Essencial',
};

export const ALLOWED_GUEST_COUNTS = [50, 100, 150];
