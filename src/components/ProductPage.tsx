import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Users,
  Clock,
  Flame,
  Utensils,
  CheckCircle,
  ShieldCheck,
  Share2,
  ChevronRight,
  Star,
  ExternalLink,
  AlertCircle,
  Phone
} from 'lucide-react';
import { PackageItem, PACKAGES } from '../data/packages';

interface ProductPageProps {
  pkg: PackageItem;
  onBack: () => void;
  onSelectOtherProduct: (pkg: PackageItem) => void;
}

// Formata valor em Real Brasileiro: R$ 1.000,00
const formatBRL = (val: number): string => {
  return 'R$ ' + val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

type GuestOption = 10 | 200 | 500 | 1000 | 'outros';

export const ProductPage: React.FC<ProductPageProps> = ({
  pkg,
  onBack,
  onSelectOtherProduct,
}) => {
  // Rola ao topo quando o produto muda
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pkg.id]);

  const [selectedOption, setSelectedOption] = useState<GuestOption | null>(null);
  const [customGuests, setCustomGuests] = useState<string>('');
  const [termsConfirmed, setTermsConfirmed] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [purchaseClicked, setPurchaseClicked] = useState(false);

  // Reset state quando o produto muda
  useEffect(() => {
    setSelectedOption(null);
    setCustomGuests('');
    setTermsConfirmed(false);
    setPurchaseClicked(false);
  }, [pkg.id]);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Resolve a opção de compra com base na seleção
  const resolvedPurchaseOption = selectedOption !== null && selectedOption !== 'outros'
    ? pkg.purchaseOptions.find(o => o.guests === selectedOption) ?? null
    : null;

  // Para opção "Outros": calcula o número de convidados e preço
  const customGuestsNum = parseInt(customGuests, 10);
  const isCustomGuestsValid =
    selectedOption === 'outros' &&
    !isNaN(customGuestsNum) &&
    customGuestsNum >= pkg.customOption.minGuests;

  const customPrice =
    isCustomGuestsValid && pkg.customOption.perPersonPrice !== null
      ? customGuestsNum * pkg.customOption.perPersonPrice
      : null;

  const isConsult =
    selectedOption === 'outros' &&
    isCustomGuestsValid &&
    pkg.customOption.perPersonPrice === null;

  // Determina se uma quantidade válida foi selecionada
  const hasValidSelection =
    (selectedOption !== null && selectedOption !== 'outros' && resolvedPurchaseOption !== null) ||
    (selectedOption === 'outros' && isCustomGuestsValid);

  // Determina o link externo a ser aberto
  const externalUrl: string | null = (() => {
    if (selectedOption === 'outros') {
      if (isConsult) return pkg.customOption.consultUrl || null;
      if (isCustomGuestsValid && pkg.customOption.perPersonPrice !== null) {
        return pkg.customOption.consultUrl || null;
      }
      return null;
    }
    return resolvedPurchaseOption?.externalUrl ?? null;
  })();

  const isValidExternalUrl = externalUrl !== null && !externalUrl.startsWith('https://TODO');

  const canBuy = hasValidSelection && termsConfirmed && isValidExternalUrl;

  const handleBuy = () => {
    if (!canBuy || purchaseClicked) return;
    setPurchaseClicked(true);
    if (externalUrl) {
      window.open(externalUrl, '_blank', 'noopener,noreferrer');
    }
    // Reset após breve delay para evitar cliques múltiplos acidentais
    setTimeout(() => setPurchaseClicked(false), 2000);
  };

  // Preço a exibir no resumo
  const displayPrice = (() => {
    if (selectedOption === null) return null;
    if (selectedOption !== 'outros') {
      return resolvedPurchaseOption ? resolvedPurchaseOption.price : null;
    }
    if (!isCustomGuestsValid) return null;
    if (isConsult) return 'consulta';
    return customPrice;
  })();

  // Quantidade a exibir no resumo
  const displayGuests = (() => {
    if (selectedOption === null) return null;
    if (selectedOption !== 'outros') return selectedOption;
    return isCustomGuestsValid ? customGuestsNum : null;
  })();

  const PRESET_OPTIONS: GuestOption[] = [10, 200, 500, 1000, 'outros'];

  const labelFor = (opt: GuestOption) => {
    if (opt === 'outros') return 'Outros';
    return `${opt.toLocaleString('pt-BR')} pessoas`;
  };

  // Pacotes relacionados na mesma categoria
  const relatedPackages = PACKAGES.filter((p) => p.id !== pkg.id && p.category === pkg.category).slice(0, 3);

  return (
    <article className="w-full min-h-screen bg-white text-gray-900 pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-8">

        {/* Breadcrumb & Botão Voltar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-gray-200">
          {/* Breadcrumb - scroll horizontal no mobile para não quebrar layout */}
          <div className="flex items-center gap-1.5 text-xs text-gray-600 overflow-x-auto whitespace-nowrap scrollbar-none min-w-0">
            <button
              type="button"
              onClick={onBack}
              className="hover:text-gray-900 transition-colors cursor-pointer flex items-center gap-1 font-semibold shrink-0"
            >
              <span>Início</span>
            </button>
            <ChevronRight className="w-3 h-3 shrink-0" />
            <button
              type="button"
              onClick={onBack}
              className="hover:text-gray-900 transition-colors cursor-pointer shrink-0"
            >
              {pkg.categoryLabel}
            </button>
            <ChevronRight className="w-3 h-3 shrink-0" />
            <span className="text-red-600 font-bold truncate">{pkg.code} — {pkg.name}</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-none bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs font-semibold uppercase tracking-wider text-gray-900 transition-colors cursor-pointer"
              title="Copiar link do produto"
            >
              <Share2 className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">{copiedLink ? 'Copiado!' : 'Compartilhar'}</span>
              <span className="sm:hidden">{copiedLink ? '✓' : 'Link'}</span>
            </button>

            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-none bg-gray-100 hover:bg-[#2d3448] hover:text-white text-gray-900 text-xs font-bold uppercase tracking-wider transition-colors border border-gray-200 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar</span>
            </button>
          </div>
        </div>

        {/* Grid principal: Imagem + Painel de Contratação */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

          {/* Coluna Esquerda: Imagem e Cardápio */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Imagem */}
            <div className="relative w-full aspect-[16/10] overflow-hidden rounded-none border border-gray-200 bg-gray-100 shadow-2xl group">
              <img
                src={pkg.image}
                alt={pkg.altText}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#060e1f] via-transparent to-transparent opacity-70" />

              {/* Tags */}
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

            {/* Especificações rápidas */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-gray-50 border border-gray-200 rounded-none text-center">
              <div className="flex flex-col items-center justify-center gap-1 border-r border-gray-200">
                <Clock className="w-4 h-4 text-amber-600" />
                <span className="text-[10px] text-gray-600 uppercase tracking-wider">Duração</span>
                <span className="text-xs sm:text-sm font-bold text-gray-900">{pkg.durationHours} horas de serviço</span>
              </div>
              <div className="flex flex-col items-center justify-center gap-1 border-r border-gray-200">
                <Users className="w-4 h-4 text-red-600" />
                <span className="text-[10px] text-gray-600 uppercase tracking-wider">Referência</span>
                <span className="text-xs sm:text-sm font-bold text-gray-900">a partir de {pkg.customOption.minGuests} pessoas</span>
              </div>
              <div className="flex flex-col items-center justify-center gap-1">
                <Flame className="w-4 h-4 text-[#e03131]" />
                <span className="text-[10px] text-gray-600 uppercase tracking-wider">Padrão</span>
                <span className="text-xs sm:text-sm font-bold text-gray-900">Churrasco Nobre</span>
              </div>
            </div>

            {/* Cardápio completo */}
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

              {/* Carnes */}
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

          {/* Coluna Direita: Painel de Contratação */}
          <div className="lg:col-span-5 flex flex-col gap-6 lg:sticky lg:top-28 order-first lg:order-last">
            <div className="bg-gray-50 border border-gray-200 p-6 sm:p-8 rounded-none shadow-2xl flex flex-col gap-6">

              {/* Cabeçalho do produto */}
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
                  Referência:{' '}
                  <strong className="text-gray-900 font-sans font-bold tabular-nums">
                    {pkg.perPerson !== null
                      ? `R$ ${pkg.perPerson.toFixed(2).replace('.', ',')}`
                      : 'sob consulta'}
                  </strong>{' '}
                  / pessoa
                </div>
              </div>

              {/* PASSO 1: Selecionar quantidade de pessoas */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-none bg-[#e9c349] text-[#060e1f] flex items-center justify-center text-xs font-bold shrink-0">
                    1
                  </div>
                  <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Escolha a quantidade de pessoas:
                  </span>
                </div>

                {/* Dropdown único para selecionar a quantidade */}
                <select
                  id="guest-quantity"
                  value={selectedOption ?? ''}
                  onChange={(event) => {
                    const value = event.target.value;
                    setSelectedOption(value === 'outros' ? 'outros' : Number(value) as GuestOption);
                    setCustomGuests('');
                  }}
                  className="w-full h-12 px-4 bg-white border-2 border-gray-200 focus:border-[#e03131] text-gray-900 font-bold focus:outline-none transition-colors text-sm cursor-pointer"
                >
                  <option value="" disabled>Selecione a quantidade de pessoas</option>
                  {PRESET_OPTIONS.map((opt) => {
                    const purchaseOpt = opt !== 'outros'
                      ? pkg.purchaseOptions.find(o => o.guests === opt)
                      : null;
                    const priceLabel = purchaseOpt ? ` — ${formatBRL(purchaseOpt.price)}` : '';

                    return (
                      <option key={opt} value={opt}>
                        {labelFor(opt)}{priceLabel}
                      </option>
                    );
                  })}
                </select>

                {/* Campo numérico para "Outros" */}
                {selectedOption === 'outros' && (
                  <div className="mt-2 flex flex-col gap-2">
                    <label htmlFor="custom-guests" className="text-xs font-semibold text-gray-700">
                      Informe a quantidade de pessoas (mínimo {pkg.customOption.minGuests}):
                    </label>
                    <input
                      id="custom-guests"
                      type="number"
                      inputMode="numeric"
                      min={pkg.customOption.minGuests}
                      step={1}
                      value={customGuests}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/[^0-9]/g, '');
                        setCustomGuests(raw);
                      }}
                      placeholder={`Ex: ${pkg.customOption.minGuests}`}
                      className="w-full h-11 px-4 bg-white border-2 border-gray-200 focus:border-[#e03131] text-gray-900 font-bold focus:outline-none transition-colors text-sm"
                    />
                    {customGuests !== '' && !isCustomGuestsValid && (
                      <p className="text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        Mínimo de {pkg.customOption.minGuests} pessoas.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* PASSO 2: Resumo do preço */}
              <div className="p-5 rounded-none bg-gray-100 border border-gray-200 min-h-[100px] flex items-center justify-center">
                {displayPrice === null ? (
                  <div className="flex flex-col items-center justify-center text-center gap-2 py-2">
                    <Users className="w-7 h-7 text-amber-600 opacity-70" />
                    <p className="text-sm font-bold text-gray-900">
                      Selecione a quantidade acima
                    </p>
                    <p className="text-xs text-gray-600 max-w-xs">
                      O valor total será exibido assim que você escolher o número de convidados.
                    </p>
                  </div>
                ) : displayPrice === 'consulta' ? (
                  <div className="w-full space-y-2">
                    <span className="text-xs uppercase tracking-wider text-gray-600 font-semibold block">
                      Valor para {displayGuests?.toLocaleString('pt-BR')} pessoas
                    </span>
                    <div className="flex items-center gap-2">
                      <Phone className="w-5 h-5 text-amber-600 shrink-0" />
                      <span className="text-2xl font-bold text-amber-600">
                        Valor sob consulta
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">
                      Nossa equipe preparará uma proposta personalizada para você.
                    </p>
                  </div>
                ) : (
                  <div className="w-full space-y-2 animate-[fadeIn_0.2s_ease-in-out]">
                    <span className="text-xs uppercase tracking-wider text-gray-600 font-semibold block">
                      {selectedOption === 'outros'
                        ? `Valor estimado para ${displayGuests?.toLocaleString('pt-BR')} pessoas`
                        : `Valor para ${displayGuests?.toLocaleString('pt-BR')} pessoas`}
                    </span>
                    <div className="flex items-baseline justify-between flex-wrap gap-1">
                      <span className="text-2xl sm:text-4xl font-bold tracking-tight text-red-600 font-sans tabular-nums">
                        {formatBRL(displayPrice as number)}
                      </span>
                      {displayGuests && (
                        <span className="text-xs text-gray-600 font-sans font-medium tabular-nums">
                          {typeof displayPrice === 'number'
                            ? `${formatBRL(displayPrice / displayGuests)} / pessoa`
                            : ''}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* PASSO 3: Caixa de concordância */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-none bg-[#e9c349] text-[#060e1f] flex items-center justify-center text-xs font-bold shrink-0">
                    2
                  </div>
                  <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Concordância
                  </span>
                </div>
                <label className="flex items-start gap-3 p-4 rounded-none bg-white border-2 border-gray-200 cursor-pointer text-xs select-none hover:border-gray-300 transition-colors">
                  <input
                    type="checkbox"
                    id="terms-checkbox"
                    checked={termsConfirmed}
                    onChange={(e) => setTermsConfirmed(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-[#e03131] focus:ring-[#e03131] cursor-pointer shrink-0"
                  />
                  <span className="text-gray-700 leading-relaxed [&_a]:text-gray-700 [&_a]:no-underline" style={{color: '#374151'}}>
                    Concordo com as condições do serviço e estou ciente de que a disponibilidade da data e os detalhes finais do evento serão confirmados diretamente com a equipe do Concórdia Grill.
                  </span>
                </label>
              </div>

              {/* PASSO 4: Botão de compra externa */}
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  id="buy-external-btn"
                  onClick={handleBuy}
                  disabled={!canBuy}
                  aria-disabled={!canBuy}
                  className={`
                    w-full py-4 px-6 rounded-none text-sm font-bold uppercase tracking-wider
                    flex items-center justify-center gap-2.5 border transition-all duration-200
                    ${canBuy
                      ? 'bg-[#e03131] hover:bg-[#bc121c] text-white border-[#e03131] shadow-[0_10px_25px_rgba(224,49,49,0.35)] cursor-pointer active:scale-[0.98]'
                      : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-60'
                    }
                  `}
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>
                    {displayPrice === 'consulta' ? 'FALAR COM A EQUIPE' : 'IR PARA O PAGAMENTO'}
                  </span>
                </button>

                {/* Mensagens de status */}
                {!hasValidSelection && (
                  <p className="text-xs text-gray-500 text-center">
                    Selecione uma quantidade de pessoas para continuar.
                  </p>
                )}
                {hasValidSelection && !termsConfirmed && (
                  <p className="text-xs text-gray-500 text-center">
                    Marque a caixa de concordância para continuar.
                  </p>
                )}
                {hasValidSelection && termsConfirmed && !isValidExternalUrl && (
                  <p className="text-xs text-amber-700 text-center flex items-center justify-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    Link de compra ainda não configurado. Entre em contato diretamente.
                  </p>
                )}
              </div>

              {/* Garantia */}
              <div className="pt-1 flex items-center gap-2 text-xs text-gray-600 justify-center">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Atendimento presencial e assinatura contratual direta.</span>
              </div>
            </div>
          </div>

        </div>

        {/* Pacotes relacionados na mesma categoria */}
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
                    <span>Ver detalhes</span>
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
