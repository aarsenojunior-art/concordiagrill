import { PACKAGE_PRICE_CENTS } from '../../package-prices.js';

/** Dados editoriais dos produtos. Os preços ficam no arquivo central package-prices.js. */

export interface PurchaseOption {
  guests: number;
  price: number;
}

export const ALLOWED_GUEST_COUNTS = [50, 100, 150] as const;

export const formatBRL = (value: number): string =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export interface PackageItem {
  id: string;
  code: string;
  name: string;
  category: 'casamento' | 'aniversario' | '15anos' | 'outros';
  categoryLabel: string;
  people: number;
  durationHours: number;
  highlight?: boolean;
  tag?: string;
  image: string;
  altText: string;
  highlights: string[];
  fullMenu: {
    entradas: string[];
    carnes: string[];
    guarnicoes: string[];
    sobremesas?: string[];
    servico: string[];
  };
  purchaseOptions: PurchaseOption[];
}

// ============================================================
// PACOTE CG03 — Celebração Grill (Aniversário)
// ============================================================
const CG03: PackageItem = {
  id: 'CG03',
  code: 'CG03',
  name: 'Celebração Grill',
  category: 'aniversario',
  categoryLabel: 'Aniversário',
  people: 50,
  durationHours: 4,
  highlight: true,
  tag: 'Destaque Aniversário',
  image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuALiLSuVthXRPE6gf-XvKERGRUoqnCi9dv4kcAH8ZKzK-z3ZE1f6GwC6wUYSgGAa-McSyNmRgBP0C5jakoOpJczdgY6beGGP2a_2oU8xo8CbcvdmKOlYD3wnByU0VMp5XRLpIgm-K9_aEfUHJcXofGzdVEwVZrejzSAG0Tv2Z38saDTAyijsSTfvJk6lOHylovuF4PJedcLj739ynPQD82cTh3vY2oyZa7SPrTzAI-IWRLYLeLG9IvC',
  altText: 'Destaque da seleção - buffet comemorativo completo de carnes nobres',
  highlights: [
    'Cardápio Encontro Grill com cortes selecionados.',
    'Pão de alho e maionese de legumes artesanal.',
    'Quatro horas de buffet completo com equipe.'
  ],
  fullMenu: {
    entradas: ['Pão de alho tradicional e com queijo', 'Torradinhas temperadas', 'Molho chimichurri fresco'],
    carnes: ['Picanha bovina fatiada na tábua', 'Fraldinha na mostarda e ervas', 'Linguiça artesanal com queijo coalho', 'Galeto marinado'],
    guarnicoes: ['Maionese cremosa de legumes artesanal', 'Arroz branco perfumado', 'Farofa crocante com bacon e ervas', 'Salada caprese com rúcula e tomate seco'],
    sobremesas: ['Abacaxi grelhado com canela e raspas de limão siciliano'],
    servico: ['Churrasqueiros mestres e equipe de salão dedicada', 'Equipamentos completos de brasa e corte', '4 horas de serviço contínuo']
  },
  purchaseOptions: [
    {
      guests: 50,
      price: PACKAGE_PRICE_CENTS.CG03[50] / 100
    },
    {
      guests: 100,
      price: PACKAGE_PRICE_CENTS.CG03[100] / 100
    },
    {
      guests: 150,
      price: PACKAGE_PRICE_CENTS.CG03[150] / 100
    }
  ]
};

// ============================================================
// PACOTE CG04 — 15 Anos Essencial
// ============================================================
const CG04: PackageItem = {
  id: 'CG04',
  code: 'CG04',
  name: '15 Anos Essencial',
  category: '15anos',
  categoryLabel: '15 Anos',
  people: 50,
  durationHours: 4,
  tag: 'Festa de 15 Anos',
  image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBelgoRJl4Vh3Uo6de4YcU0CMbSFULDOlBoZ0buQn30TV35fc_tKMFANwLFJ9L_dY0LhcC5uzwM76MkqwMNx58IC4ioJ0SyqH0PrJYuwWtK5omerHJxDaXhMsEwc0rnWOCzSXurVNgXyBn0CGl0erSAGpltTMSrS_EoTAiALnSPy-nXoh9SxJ8kRH5CBW-DjaBhbIQfYBvrVnneRT0cFxffH8ENDLPQmtA5GL2SdNaEkkH0NmMNLMSo',
  altText: 'Banquete sofisticado de 15 anos com buffet de carnes nobres',
  highlights: [
    'Duas opções de entradas a definir.',
    'Dois cortes bovinos nobres, frango e guarnições.',
    'Uma sobremesa inclusa e quatro horas de buffet.'
  ],
  fullMenu: {
    entradas: ['Mini espetinhos caprese com pesto', 'Bruschettas com confit de tomate', 'Canapés de carne seca com queijo coalho'],
    carnes: ['Baby beef macio ao chimichurri', 'Maminha premium na brasa', 'Filé de frango ao molho de ervas finas'],
    guarnicoes: ['Arroz com amêndoas laminadas', 'Purê de batata baroa aveludado', 'Mix de folhas verdes com palmito e nozes'],
    sobremesas: ['Mousse aerada de chocolate meio amargo com calda de frutas vermelhas'],
    servico: ['Brigada completa com garçons trajados', 'Utensílios de serviço e travessas térmicas', '4 horas de buffet refinado']
  },
  purchaseOptions: [
    {
      guests: 50,
      price: PACKAGE_PRICE_CENTS.CG04[50] / 100
    },
    {
      guests: 100,
      price: PACKAGE_PRICE_CENTS.CG04[100] / 100
    },
    {
      guests: 150,
      price: PACKAGE_PRICE_CENTS.CG04[150] / 100
    }
  ]
};

// ============================================================
// PACOTE CG06 — Casamento Essencial
// ============================================================
const CG06: PackageItem = {
  id: 'CG06',
  code: 'CG06',
  name: 'Casamento Essencial',
  category: 'casamento',
  categoryLabel: 'Casamento',
  people: 50,
  durationHours: 4,
  tag: 'Recepção Matrimonial',
  image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBaXBdtNXzhD3xwcxqtdzDK8PJJmo_OPtxoQBrh-GqipNjXytP4YekIexN3DeIOyQHXVyl2ubuVrmdLxkg6Y2DOAyHvj2q7fA7wpw0MoKjV36A49jlFwhCAzopsfA1Y-GYcC9odgEVuTi-OiCVFLlhW51vGBsB2IWeZGOm4mLyC1KNqqwweNJrjDU03YpLCAevxNP2a9AJtcrOSRaUOJyxB63MRVbMhkRZZ-VZKeuHuSpjzavbqr0mJ',
  altText: 'Recepção de casamento elegante com banquete de churrasco',
  highlights: [
    'Duas opções de entradas a definir.',
    'Dois cortes bovinos, corte de frango e acompanhamentos.',
    'Uma sobremesa e quatro horas de serviço de buffet.'
  ],
  fullMenu: {
    entradas: ['Mini dadinhos de tapioca com geleia de pimenta', 'Vol-au-vent de cogumelos', 'Torradinhas com carpaccio'],
    carnes: ['Picanha fatiada ao flor de sal', 'Bife de ancho marinado com manteiga de ervas', 'Supremo de frango ao perfume de limão siciliano'],
    guarnicoes: ['Risoto de parmesão e alho poró', 'Legumes grelhados na brasa com azeite trufado', 'Salada verde com figos frescos e queijo de cabra'],
    sobremesas: ['Panna cotta com calda de frutas vermelhas'],
    servico: ['Coordenação gastronômica no local', 'Garçons trajados para recepção matrimonial', '4 horas de serviço ininterrupto']
  },
  purchaseOptions: [
    {
      guests: 50,
      price: PACKAGE_PRICE_CENTS.CG06[50] / 100
    },
    {
      guests: 100,
      price: PACKAGE_PRICE_CENTS.CG06[100] / 100
    },
    {
      guests: 150,
      price: PACKAGE_PRICE_CENTS.CG06[150] / 100
    }
  ]
};

// ============================================================
// PACOTE CG02 — Confraterniza Grill (Outros)
// ============================================================
const CG02: PackageItem = {
  id: 'CG02',
  code: 'CG02',
  name: 'Confraterniza Grill',
  category: 'outros',
  categoryLabel: 'Outros',
  people: 50,
  durationHours: 4,
  tag: 'Corporativo & Amigos',
  image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCFiwmdk9KLej63jEf8Yh7KDEKkLlmheseM9G3QcjzET29T8l7Rh9YSpo-9IJThPwi6JxV2phMwb637aTxphIAjiOQS0bUA1I-aJQVZ0wu1bxIoQ1kUVLGGGO9VUgPzaqVL4vo8TZSS2pzMTaUQGg5Lf15m2MQrb8Y8uEkiuR8WiVJ-L_5KSMUOArrg7NpXt94QnJapBpcm8g6dz8ZiRBjonsV_HwwP-Dkjw3irK9VWxtcFYh9M0pzg',
  altText: 'Confraternização corporativa com buffet de churrasco nobre',
  highlights: [
    'Cardápio Encontro Grill completo.',
    'Pão de alho e um acompanhamento adicional.',
    'Quatro horas de serviço de buffet.'
  ],
  fullMenu: {
    entradas: ['Pão de alho especial recheado assado na brasa', 'Vinagrete campestre'],
    carnes: ['Corte bovino grelhado no ponto nobre', 'Coxinha da asa dourada com especiarias', 'Linguiça toscana e linguiça cuiabana'],
    guarnicoes: ['Arroz branco e arroz biro-biro', 'Farofa crocante amanteigada', 'Salada mista com molho de mostarda e mel'],
    servico: ['Equipe com churrasqueiro chefe e garçons de apoio', 'Réchauds aquecidos e reposição constante', '4 horas de buffet livre']
  },
  purchaseOptions: [
    {
      guests: 50,
      price: PACKAGE_PRICE_CENTS.CG02[50] / 100
    },
    {
      guests: 100,
      price: PACKAGE_PRICE_CENTS.CG02[100] / 100
    },
    {
      guests: 150,
      price: PACKAGE_PRICE_CENTS.CG02[150] / 100
    }
  ]
};

export const PACKAGES: PackageItem[] = [CG03, CG04, CG06, CG02];
