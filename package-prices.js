// Fallback único usado pelo frontend e pelo backend quando a tabela do Supabase
// ainda não estiver disponível. Em produção, package_prices é a fonte oficial.
export const PACKAGE_PRICE_CENTS = {
  CG02: { 50: 700000, 100: 1400000, 150: 2100000 },
  CG06: { 50: 750000, 100: 1500000, 150: 2250000 },
  CG03: { 50: 800000, 100: 1600000, 150: 2400000 },
  CG04: { 50: 850000, 100: 1700000, 150: 2550000 },
};

export const PACKAGE_NAMES = {
  CG02: 'Confraterniza Grill',
  CG06: 'Casamento Essencial',
  CG03: 'Celebração Grill',
  CG04: '15 Anos Essencial',
};
