import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Users, 
  Clock, 
  Flame, 
  Utensils, 
  CheckCircle, 
  ShoppingBag, 
  MessageCircle, 
  ShieldCheck, 
  Share2, 
  ChevronRight,
  Star,
  Info,
  RotateCcw,
  Plus,
  Minus,
  CheckCircle2
} from 'lucide-react';
import { PackageItem, PACKAGES, EXTRA_OPTIONS } from '../data/packages';

interface ProductPageProps {
  pkg: PackageItem;
  onBack: () => void;
  onSelectOtherProduct: (pkg: PackageItem) => void;
  onAddToCart: (pkg: PackageItem, customGuests?: number) => void;
  onOpenDirectValidation: (details: {
    packageCode: string;
    packageName: string;
    guests: number;
    estimatedTotal: string;
    extras: string[];
    termsConfirmed: boolean;
  }) => void;
}

export const ProductPage: React.FC<ProductPageProps> = ({
  pkg,
  onBack,
  onSelectOtherProduct,
  onAddToCart,
  onOpenDirectValidation,
}) => {
  // Scroll to top when product page loads or package changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pkg.id]);

  // Dimensioning state on product page
  const [guests, setGuests] = useState<number | null>(null);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [termsConfirmed, setTermsConfirmed] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const hasGuestsChosen = guests !== null && guests > 0;
  const isCustomGuests = hasGuestsChosen && guests !== pkg.people;

  const extrasCost = selectedExtras.reduce((sum, extraId) => {
    const extra = EXTRA_OPTIONS.find((e) => e.id === extraId);
    if (!extra) return sum;
    if (extra.fixedPrice) return sum + extra.fixedPrice;
    if (extra.pricePerPerson) return sum + extra.pricePerPerson * (guests || 1);
    return sum;
  }, 0);

  const baseCost = hasGuestsChosen
    ? (isCustomGuests ? guests * pkg.perPerson : pkg.totalPrice)
    : 0;

  const totalCalculated = baseCost + extrasCost;

  const formatBRL = (val: number) => {
    return 'R$ ' + val.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  };

  const toggleExtra = (id: string) => {
    setSelectedExtras((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Other packages in the same category
  const relatedPackages = PACKAGES.filter((p) => p.id !== pkg.id && p.category === pkg.category).slice(0, 3);

  return (
    <article className="w-full min-h-screen bg-white text-gray-900 pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-8">
        
        {/* Navigation Breadcrumb & Back Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <button
              type="button"
              onClick={onBack}
              className="hover:text-gray-900 transition-colors cursor-pointer flex items-center gap-1 font-semibold"
            >
              <span>Início</span>
            </button>
            <ChevronRight className="w-3.5 h-3.5" />
            <button
              type="button"
              onClick={onBack}
              className="hover:text-gray-900 transition-colors cursor-pointer"
            >
              {pkg.categoryLabel}
            </button>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-red-600 font-bold">{pkg.code} — {pkg.name}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-none bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs font-semibold uppercase tracking-wider text-gray-900 transition-colors cursor-pointer"
              title="Copiar link do produto"
            >
              <Share2 className="w-3.5 h-3.5 text-amber-600" />
              <span>{copiedLink ? 'Link Copiado!' : 'Compartilhar'}</span>
            </button>

            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-none bg-gray-100 hover:bg-[#2d3448] text-gray-900 hover:text-gray-900 text-xs font-bold uppercase tracking-wider transition-colors border border-gray-200 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar aos Pacotes</span>
            </button>
          </div>
        </div>

        {/* Product Hero Grid (Image Showcase & Overview) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Product Photography & Badges */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="relative w-full aspect-[16/10] overflow-hidden rounded-none border border-gray-200 bg-gray-100 shadow-2xl group">
              <img
                src={pkg.image}
                alt={pkg.altText}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#060e1f] via-transparent to-transparent opacity-70" />

              {/* Status Tags */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-none bg-gray-100/90 backdrop-blur-md text-xs text-amber-600 font-bold uppercase tracking-wider border border-gray-200">
                  {pkg.categoryLabel}
                </span>
                <span className="px-3 py-1 rounded-none bg-gray-50/90 backdrop-blur-md font-mono text-xs uppercase tracking-wider font-bold text-[#ffdad6] border border-gray-200">
                  CÓDIGO: {pkg.code}
                </span>
              </div>

              {pkg.highlight && (
                <div className="absolute top-4 right-4 bg-[#e03131] text-white px-3 py-1 text-xs font-bold uppercase tracking-wider flex items-center gap-1 shadow-lg">
                  <Star className="w-3.5 h-3.5 fill-white" />
                  <span>Destaque da Seleção</span>
                </div>
              )}

              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-gray-600 pointer-events-none">
                <span className="bg-gray-100/80 px-2.5 py-1 border border-gray-200">
                  Foto ilustrativa de serviço real
                </span>
                <span className="bg-gray-100/80 px-2.5 py-1 border border-gray-200 text-amber-600 font-bold flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-[#e9c349]" /> Ponto &amp; Brasa
                </span>
              </div>
            </div>

            {/* Quick Specs Strip */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-gray-50 border border-gray-200 rounded-none text-center">
              <div className="flex flex-col items-center justify-center gap-1 border-r border-gray-200">
                <Clock className="w-4 h-4 text-amber-600" />
                <span className="text-[10px] text-gray-600 uppercase tracking-wider">Duração</span>
                <span className="text-xs sm:text-sm font-bold text-gray-900">{pkg.durationHours} horas de serviço</span>
              </div>
              <div className="flex flex-col items-center justify-center gap-1 border-r border-gray-200">
                <Users className="w-4 h-4 text-red-600" />
                <span className="text-[10px] text-gray-600 uppercase tracking-wider">Sugerido</span>
                <span className="text-xs sm:text-sm font-bold text-gray-900">{pkg.people} pessoas</span>
              </div>
              <div className="flex flex-col items-center justify-center gap-1">
                <Flame className="w-4 h-4 text-[#e03131]" />
                <span className="text-[10px] text-gray-600 uppercase tracking-wider">Padrão</span>
                <span className="text-xs sm:text-sm font-bold text-gray-900">Churrasco Nobre</span>
              </div>
            </div>

            {/* Full Gastronomic Menu Breakdown */}
            <div className="bg-gray-50 p-6 sm:p-8 rounded-none border border-gray-200 space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <span className="text-xs uppercase tracking-widest text-red-600 font-bold flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-[#e03131]" />
                  Composição Completa do Produto
                </span>
                <h3 className="text-xl sm:text-2xl font-bold font-editorial text-gray-900 mt-1">
                  Itens inclusos no cardápio {pkg.code}
                </h3>
              </div>

              {/* Entradas */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-2 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-none bg-[#e9c349]" />
                  Entradas &amp; Recepção
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {pkg.fullMenu.entradas.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 bg-gray-100 p-3 rounded-none border border-gray-200">
                      <CheckCircle className="w-3.5 h-3.5 text-[#e03131] shrink-0 mt-0.5" />
                      <span className="text-gray-900">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Carnes Nobres */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-2 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-[#e03131]" />
                  Carnes Selecionadas &amp; Ponto da Brasa
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {pkg.fullMenu.carnes.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 bg-gray-100 p-3 rounded-none border border-gray-200">
                      <CheckCircle className="w-3.5 h-3.5 text-[#e03131] shrink-0 mt-0.5" />
                      <span className="text-gray-900 font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Guarnições */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-2 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-none bg-[#e9c349]" />
                  Guarnições &amp; Saladas de Acompanhamento
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {pkg.fullMenu.guarnicoes.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 bg-gray-100 p-3 rounded-none border border-gray-200">
                      <CheckCircle className="w-3.5 h-3.5 text-[#e03131] shrink-0 mt-0.5" />
                      <span className="text-gray-900">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sobremesas */}
              {pkg.fullMenu.sobremesas && pkg.fullMenu.sobremesas.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-2 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-none bg-[#e9c349]" />
                    Sobremesas
                  </h4>
                  <div className="space-y-2 text-xs">
                    {pkg.fullMenu.sobremesas.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2 bg-gray-100 p-3 rounded-none border border-gray-200">
                        <CheckCircle className="w-3.5 h-3.5 text-[#e03131] shrink-0 mt-0.5" />
                        <span className="text-gray-900">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Equipe & Estrutura */}
              <div className="p-4 bg-gray-100 border border-gray-200 rounded-none space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600">
                  Estrutura Operacional Inclusa
                </h4>
                <ul className="space-y-1.5 text-xs text-gray-600">
                  {pkg.fullMenu.servico.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-none bg-[#e9c349] shrink-0 mt-1.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>

          {/* Right Column: Pricing Calculator, Guest Selector, and Action Panel */}
          <div className="lg:col-span-5 flex flex-col gap-6 lg:sticky lg:top-28">
            
            {/* Main Product Card */}
            <div className="bg-gray-50 border border-gray-200 p-6 sm:p-8 rounded-none shadow-2xl flex flex-col gap-6">
              
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-amber-600 font-bold">
                    {pkg.categoryLabel}
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-none bg-gray-100 text-[#ffdad6] font-bold border border-gray-200">
                    {pkg.code}
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold font-editorial text-gray-900">
                  {pkg.name}
                </h1>
                <p className="text-xs sm:text-sm text-gray-600">
                  {pkg.tag || 'Proposta gastronômica completa para eventos'}
                </p>
                <div className="text-xs text-gray-600 pt-1">
                  Referência unitária: <strong className="text-gray-900 font-sans font-bold tabular-nums">R$ {pkg.perPerson.toFixed(2).replace('.', ',')}</strong> / pessoa
                </div>
              </div>

              {/* STEP 1: Select Guests First */}
              <div className="p-5 rounded-none bg-gray-100 border border-gray-200 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <label 
                    htmlFor="product-guests-input"
                    className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2"
                  >
                    <div className="w-5 h-5 rounded-none bg-[#e9c349] text-[#060e1f] flex items-center justify-center text-[10px] font-bold">
                      1
                    </div>
                    <span>Defina a quantidade de convidados:</span>
                  </label>

                  {hasGuestsChosen && (
                    <button
                      type="button"
                      onClick={() => setGuests(pkg.people)}
                      className="text-xs text-red-600 hover:text-gray-900 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Sugerido ({pkg.people}p)</span>
                    </button>
                  )}
                </div>

                <p className="text-xs text-gray-600">
                  O valor exato total é calculado após a definição do número de convidados.
                </p>

                {/* Dropdown Selection */}
                <div className="flex items-center gap-3 pt-1">
                  <select
                    id="product-guests-input"
                    value={guests ?? ''}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setGuests(isNaN(val) ? null : val);
                    }}
                    className="w-full h-11 px-4 bg-gray-50 border border-gray-200 text-gray-900 font-bold focus:outline-none focus:border-[#e03131]"
                  >
                    <option value="" disabled>Escolha a quantidade de pessoas</option>
                    {[30, 50, 75, 100, 150, 200, 250].map((preset) => (
                      <option key={preset} value={preset}>{preset} pessoas</option>
                    ))}
                  </select>

                  <div className="text-xs shrink-0">
                    {hasGuestsChosen ? (
                      <span className="text-amber-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Definido
                      </span>
                    ) : (
                      <span className="text-red-600 font-medium animate-pulse">
                        Selecione ao lado
                      </span>
                    )}
                  </div>
                </div>


              </div>

              {/* Optional Extras Selection */}
              <div className="space-y-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
                  Opcionais recomendados para {pkg.name}:
                </span>
                <div className="space-y-2">
                  {EXTRA_OPTIONS.slice(0, 3).map((opt) => {
                    const isChecked = selectedExtras.includes(opt.id);
                    return (
                      <label
                        key={opt.id}
                        className={`flex items-start justify-between gap-3 p-3 rounded-none cursor-pointer transition-colors border ${
                          isChecked
                            ? 'bg-gray-100 border-[#e9c349]/50 text-white'
                            : 'bg-gray-100/60 border-gray-200 text-gray-600 hover:bg-gray-100/50'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleExtra(opt.id)}
                            className="mt-0.5 rounded-none text-[#e03131] focus:ring-[#e03131]"
                          />
                          <span className="text-xs font-medium text-gray-900">{opt.name}</span>
                        </div>
                        <span className="text-xs font-bold text-amber-600 shrink-0 font-sans tabular-nums">
                          {opt.fixedPrice
                            ? `+ R$ ${opt.fixedPrice.toLocaleString('pt-BR')}`
                            : `+ R$ ${opt.pricePerPerson},00/p`}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Calculation Result: Revealed only after guests defined */}
              <div className="p-5 rounded-none bg-gray-100 border border-gray-200">
                {!hasGuestsChosen ? (
                  <div className="flex flex-col items-center justify-center text-center py-4 gap-2">
                    <Users className="w-8 h-8 text-amber-600 opacity-70" />
                    <h4 className="text-sm font-bold text-gray-900 font-sans">
                      Valor do produto a ser revelado
                    </h4>
                    <p className="text-xs text-gray-600 max-w-xs">
                      Selecione a quantidade de convidados acima para visualizar o valor total orçado deste pacote.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 animate-in fade-in">
                    <span className="text-xs uppercase tracking-wider text-gray-600 font-semibold block">
                      Valor Total Calculado
                    </span>
                    
                    <div className="flex items-baseline justify-between">
                      <span className="text-3xl sm:text-4xl font-bold tracking-tight text-red-600 font-sans tabular-nums">
                        {formatBRL(totalCalculated)}
                      </span>
                      <span className="text-xs text-gray-600 font-sans font-medium tabular-nums">
                        (R$ {(totalCalculated / guests).toFixed(2).replace('.', ',')} / conv.)
                      </span>
                    </div>

                    <div className="pt-2 border-t border-gray-200 flex items-center justify-between text-xs text-gray-600">
                      <span>Buffet para {guests} pessoas</span>
                      <span className="font-sans font-semibold text-gray-900 tabular-nums">{formatBRL(baseCost)}</span>
                    </div>

                    {selectedExtras.length > 0 && (
                      <div className="flex items-center justify-between text-xs text-amber-600">
                        <span>Opcionais extras ({selectedExtras.length}):</span>
                        <span className="font-sans font-semibold tabular-nums">+ {formatBRL(extrasCost)}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Term confirmation */}
              <label className="flex items-start gap-2.5 p-3 rounded-none bg-gray-100/70 hover:bg-gray-100 border border-gray-200 cursor-pointer text-xs select-none">
                <input
                  type="checkbox"
                  checked={termsConfirmed}
                  onChange={(e) => setTermsConfirmed(e.target.checked)}
                  className="mt-0.5 rounded-none text-[#e03131] focus:ring-[#e03131]"
                />
                <span className="text-gray-600 leading-relaxed">
                  Confirmo que alinharei data, local e cardápio diretamente com a equipe do restaurante Concórdia Grill.
                </span>
              </label>

              {/* Action Buttons - Rectangular */}
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => onAddToCart(pkg, guests || undefined)}
                  className="w-full py-4 px-6 rounded-none bg-[#e03131] hover:bg-[#bc121c] text-white text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_10px_25px_rgba(224,49,49,0.35)] transition-all cursor-pointer active:scale-98 border border-[#e03131]"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Adicionar ao Carrinho</span>
                </button>

                <button
                  type="button"
                  disabled={!hasGuestsChosen}
                  onClick={() =>
                    onOpenDirectValidation({
                      packageCode: pkg.code,
                      packageName: pkg.name,
                      guests: guests || pkg.people,
                      estimatedTotal: hasGuestsChosen ? formatBRL(totalCalculated) : 'A definir',
                      extras: selectedExtras.map(
                        (id) => EXTRA_OPTIONS.find((e) => e.id === id)?.name || id
                      ),
                      termsConfirmed,
                    })
                  }
                  className={`w-full py-3.5 px-6 rounded-none text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-2 transition-all border ${
                    hasGuestsChosen
                      ? 'bg-gray-100 hover:bg-[#2d3448] text-white border-gray-200 cursor-pointer'
                      : 'bg-gray-50 text-gray-600 border-gray-200 cursor-not-allowed opacity-60'
                  }`}
                >
                  <MessageCircle className="w-4 h-4 text-amber-600" />
                  <span>Alinhar Data no WhatsApp</span>
                </button>
              </div>

              {/* Guarantee badge */}
              <div className="pt-2 flex items-center gap-2 text-xs text-gray-600 justify-center">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>Atendimento presencial e assinatura contratual direta.</span>
              </div>

            </div>

          </div>

        </div>

        {/* Related Packages in Same Category */}
        {relatedPackages.length > 0 && (
          <div className="pt-12 border-t border-gray-200 flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-widest text-red-600 font-bold">
                Outras Opções
              </span>
              <h3 className="text-2xl font-bold font-editorial text-gray-900">
                Mais cardápios de {pkg.categoryLabel}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPackages.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => onSelectOtherProduct(rel)}
                  className="bg-gray-50 border border-gray-200 hover:border-[#e03131]/60 p-4 rounded-none cursor-pointer flex flex-col justify-between gap-3 group transition-all"
                >
                  <div className="relative w-full aspect-[16/10] overflow-hidden bg-gray-100 rounded-none">
                    <img
                      src={rel.image}
                      alt={rel.altText}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-none font-mono text-[10px] uppercase font-bold bg-gray-50/90 text-[#ffdad6] border border-gray-200">
                      {rel.code}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-gray-900 font-syne group-hover:text-red-600 transition-colors">
                      {rel.name}
                    </h4>
                    <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                      {rel.highlights.join(' • ')}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-gray-200 flex items-center justify-between text-xs text-red-600 font-semibold">
                    <span>Ver esta página</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </article>
  );
};
