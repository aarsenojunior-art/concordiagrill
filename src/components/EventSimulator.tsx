import React, { useState } from 'react';
import { 
  Utensils, 
  Users, 
  AlertTriangle, 
  RotateCcw, 
  Lock, 
  Plus, 
  Minus, 
  MessageCircle, 
  PlusCircle,
  Sparkles,
  ShoppingBag,
  CheckCircle2
} from 'lucide-react';
import { PACKAGES, EXTRA_OPTIONS } from '../data/packages';

interface EventSimulatorProps {
  selectedPackageId: string;
  onSelectPackageId: (id: string) => void;
  onOpenDirectValidation: (details: {
    packageCode: string;
    packageName: string;
    guests: number;
    estimatedTotal: string;
    extras: string[];
    termsConfirmed: boolean;
  }) => void;
  onOpenGatewayModal: () => void;
  onOpenCartWithPkg?: (pkgId: string) => void;
}

export const EventSimulator: React.FC<EventSimulatorProps> = ({
  selectedPackageId,
  onSelectPackageId,
  onOpenDirectValidation,
  onOpenGatewayModal,
  onOpenCartWithPkg,
}) => {
  const currentPkg = PACKAGES.find((p) => p.id === selectedPackageId) || PACKAGES[2]; // Default to CG03
  
  // The client must choose the quantity of people first,
  // and only after that the calculated price appears.
  const [guests, setGuests] = useState<number | null>(null);
  const [termsConfirmed, setTermsConfirmed] = useState<boolean>(false);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);

  // When package changes, reset guests to null so the user must select guests before price shows
  const handlePackageChange = (newId: string) => {
    onSelectPackageId(newId);
    setGuests(null);
  };

  const handleSelectDefaultGuests = () => {
    setGuests(currentPkg.people);
  };

  // Toggle optional extras
  const toggleExtra = (id: string) => {
    setSelectedExtras((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const hasGuestsChosen = guests !== null && guests > 0;
  const isCustomGuests = hasGuestsChosen && guests !== currentPkg.people;

  // Calculate extras cost
  const extrasCost = selectedExtras.reduce((sum, extraId) => {
    const extra = EXTRA_OPTIONS.find((e) => e.id === extraId);
    if (!extra) return sum;
    if (extra.fixedPrice) return sum + extra.fixedPrice;
    if (extra.pricePerPerson) return sum + extra.pricePerPerson * (guests || 1);
    return sum;
  }, 0);

  // Price calculations based on chosen guests:
  const baseCost = hasGuestsChosen
    ? (isCustomGuests ? guests * currentPkg.perPerson : currentPkg.totalPrice)
    : 0;
  
  const totalPriceCalculated = baseCost + extrasCost;

  const formatBRL = (val: number) => {
    return 'R$ ' + val.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  };

  return (
    <section className="w-full py-20 bg-gray-100 relative" id="meu-evento">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <span className="text-xs text-red-600 uppercase tracking-widest font-bold">
              Simulador de Celebração
            </span>
            <h2 className="text-3xl sm:text-4xl text-gray-900 font-editorial font-normal">
              Meu Evento: Dimensionamento &amp; Proposta
            </h2>
            <p className="text-sm text-gray-600">
              Escolha seu pacote gastronômico, indique o número de convidados e veja o valor exato calculado.
            </p>
          </div>

          {onOpenCartWithPkg && (
            <button
              type="button"
              onClick={() => onOpenCartWithPkg(currentPkg.id)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-none bg-gray-100 hover:bg-[#2d3448] text-gray-900 hover:text-gray-900 border border-gray-200 text-xs font-semibold uppercase tracking-wider transition-colors shrink-0 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-[#e03131]" />
              <span>Abrir no Carrinho Lateral</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Interactive Controls (Left Column) */}
          <div className="lg:col-span-7 flex flex-col gap-6 bg-gray-50 p-6 sm:p-8 rounded-none shadow-xl border border-gray-200">
            
            {/* Step 1: Package Selector with grouped Category Tags */}
            <div className="flex flex-col gap-2">
              <label 
                htmlFor="package-select"
                className="text-xs font-semibold text-gray-900 uppercase tracking-wider flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-none bg-[#e03131] text-white flex items-center justify-center text-[10px] font-bold">
                    1
                  </div>
                  <span>Selecione o pacote gastronômico:</span>
                </div>
                <span className="text-[11px] text-amber-600 font-normal">
                  {currentPkg.categoryLabel}
                </span>
              </label>

              <select
                id="package-select"
                value={currentPkg.id}
                onChange={(e) => handlePackageChange(e.target.value)}
                className="w-full h-12 px-4 rounded-none bg-gray-100 text-gray-900 text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#e03131] transition-all cursor-pointer font-medium"
              >
                <optgroup label="Aniversários &amp; Festas de 15 Anos">
                  {PACKAGES.filter((p) => p.category === 'aniversario' || p.category === '15anos').map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.code} — {pkg.name} ({pkg.tag} | sugerido {pkg.people} pessoas)
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Outros (Confraternizações)">
                  {PACKAGES.filter((p) => p.category === 'outros').map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.code} — {pkg.name} ({pkg.tag} | sugerido {pkg.people} pessoas)
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Casamentos">
                  {PACKAGES.filter((p) => p.category === 'casamento').map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.code} — {pkg.name} ({pkg.tag} | sugerido {pkg.people} pessoas)
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Step 2: Choose Number of Guests FIRST (Crucial Rule) */}
            <div className="flex flex-col gap-3 p-5 rounded-none bg-gray-100/80 border border-gray-200">
              <div className="flex items-center justify-between">
                <label 
                  htmlFor="guests-input"
                  className="text-xs font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-2"
                >
                  <div className="w-5 h-5 rounded-none bg-[#e9c349] text-[#060e1f] flex items-center justify-center text-[10px] font-bold">
                    2
                  </div>
                  <span>Defina a quantidade de convidados:</span>
                </label>

                {guests !== null && (
                  <button
                    type="button"
                    onClick={handleSelectDefaultGuests}
                    className="text-xs text-red-600 hover:text-gray-900 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Sugerido ({currentPkg.people} pessoas)</span>
                  </button>
                )}
              </div>

              <p className="text-xs text-gray-600">
                Selecione abaixo para quantas pessoas será a celebração. O valor somente será revelado após essa definição.
              </p>

              {/* Quick Guest presets - Rectangular Buttons */}
              <div className="flex flex-wrap gap-2 pt-1">
                {[30, 50, 75, 100, 150, 200, 250].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setGuests(preset)}
                    className={`px-3.5 py-2 rounded-none text-xs font-semibold transition-all cursor-pointer uppercase tracking-wider border ${
                      guests === preset
                        ? 'bg-[#e03131] text-white border-[#e03131] shadow-md ring-2 ring-[#e03131]/40'
                        : 'bg-gray-50 text-gray-600 hover:text-gray-900 border-gray-200'
                    }`}
                  >
                    {preset} pessoas
                  </button>
                ))}
              </div>

              {/* Stepper Input - Rectangular Design */}
              <div className="flex items-center gap-3 pt-2">
                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-none overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setGuests((g) => Math.max(10, (g || currentPkg.people) - 5))}
                    className="p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer rounded-none"
                    aria-label="Diminuir 5 convidados"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <input
                    id="guests-input"
                    type="number"
                    min={10}
                    max={1000}
                    step={5}
                    placeholder="Ex: 50"
                    value={guests ?? ''}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setGuests(isNaN(val) ? null : Math.max(0, val));
                    }}
                    className="w-24 h-12 text-center bg-transparent text-gray-900 font-sans text-xl font-bold focus:outline-none placeholder:text-gray-600/40 placeholder:text-sm tabular-nums"
                  />

                  <button
                    type="button"
                    onClick={() => setGuests((g) => (g ? g + 5 : currentPkg.people))}
                    className="p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer rounded-none"
                    aria-label="Aumentar 5 convidados"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-xs text-gray-600">
                  {hasGuestsChosen ? (
                    <span className="text-amber-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {guests} pessoas selecionadas
                    </span>
                  ) : (
                    <span className="text-red-600 font-medium animate-pulse">
                      Aguardando escolha de pessoas...
                    </span>
                  )}
                </div>
              </div>

              {/* Custom Guests Banner */}
              {isCustomGuests && (
                <div className="mt-1 p-3 rounded-none bg-[#af8d11]/20 border border-[#af8d11]/40 text-[#ffe088] text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    Quantidade personalizada ({guests} pessoas): dimensionamento proporcional a R$ {currentPkg.perPerson.toFixed(2).replace('.', ',')}/pessoa.
                  </span>
                </div>
              )}
            </div>

            {/* Optional Event Add-ons */}
            <div className="pt-2 border-t border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-600 flex items-center gap-1.5">
                  <PlusCircle className="w-3.5 h-3.5 text-amber-600" />
                  Simular Opcionais Adicionais (Sob Demanda)
                </span>
                <span className="text-[11px] text-gray-600">Opcional</span>
              </div>

              <div className="space-y-2">
                {EXTRA_OPTIONS.map((opt) => {
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
                      <div className="flex items-start gap-2.5">
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

            {/* Terms Checkbox Confirmation */}
            <div className="pt-2">
              <label className="flex items-start gap-3 p-4 rounded-none bg-gray-100/70 hover:bg-gray-100 border border-gray-200 cursor-pointer select-none transition-colors">
                <input
                  type="checkbox"
                  checked={termsConfirmed}
                  onChange={(e) => setTermsConfirmed(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded-none bg-gray-100 text-[#e03131] focus:ring-[#e03131] cursor-pointer shrink-0"
                />
                <span className="text-xs text-gray-600 leading-relaxed">
                  Confirmo que já combinei data, local, cardápio e condições diretamente com a equipe do restaurante{' '}
                  <strong className="text-gray-900 font-bold">Concórdia Grill</strong>.
                </span>
              </label>
            </div>

            {/* Technical Specs Preview Box */}
            <div className="p-4 rounded-none bg-gray-100/90 border border-gray-200 flex flex-col gap-2">
              <div className="flex items-center justify-between text-gray-600 text-[11px] font-mono">
                <span className="font-bold">ESTRUTURA TÉCNICA</span>
                <span className="text-amber-600">CÓDIGO: {currentPkg.code}</span>
              </div>
              <div className="flex flex-col gap-1 text-xs">
                <p>
                  <strong className="text-gray-900">Cardápio:</strong>{' '}
                  <span className="text-gray-600">
                    {currentPkg.highlights.join(' ')}
                  </span>
                </p>
                <p>
                  <strong className="text-gray-900">Duração contratual:</strong>{' '}
                  <span className="text-gray-600">4 horas contínuas de atendimento de buffet</span>
                </p>
              </div>
            </div>

          </div>

          {/* Dynamic Summary Card (Right Column - Price displays ONLY after guests chosen) */}
          <div className="lg:col-span-5 bg-gray-50 p-6 sm:p-8 rounded-none shadow-2xl border border-gray-200 flex flex-col gap-6 lg:sticky lg:top-28">
            
            {/* Header tags */}
            <div className="flex items-center justify-between pb-2 border-b border-gray-200">
              <span className="text-xs uppercase tracking-wider text-amber-600 font-bold">
                {currentPkg.categoryLabel}
              </span>
              <span className="px-3 py-1 rounded-none bg-[#2d3448] text-gray-900 text-xs font-semibold uppercase tracking-wider border border-[#3b455c]">
                {hasGuestsChosen 
                  ? `${guests} convidados definidos` 
                  : 'Aguardando seleção de convidados'}
              </span>
            </div>

            {/* Title & Status */}
            <div className="flex flex-col gap-1">
              <h3 className="text-2xl sm:text-3xl font-bold font-editorial text-gray-900">
                {currentPkg.name}
              </h3>
              <p className="text-xs text-gray-600">
                Proposta gastronômica sujeita a confirmação de data
              </p>
            </div>

            {/* Total Calculation Display - REVEALED ONLY AFTER GUESTS IS DEFINED */}
            {!hasGuestsChosen ? (
              <div className="p-6 rounded-none bg-gray-100 border border-gray-200 flex flex-col items-center justify-center text-center gap-3">
                <div className="w-12 h-12 rounded-none bg-[#e9c349]/15 border border-[#e9c349]/40 flex items-center justify-center text-amber-600">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 font-syne">
                    Selecione a quantidade de pessoas
                  </h4>
                  <p className="text-xs text-gray-600 mt-1 max-w-xs">
                    Para visualizar o valor total exato deste pacote ({currentPkg.name}), informe acima o número de convidados planejado.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSelectDefaultGuests}
                  className="px-5 py-2.5 rounded-none bg-[#e03131] hover:bg-[#bc121c] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border border-[#e03131]"
                >
                  Usar sugerido ({currentPkg.people} pessoas)
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-none bg-gray-100 border border-gray-200 flex flex-col gap-2 animate-in fade-in">
                <span className="text-xs text-gray-600 uppercase tracking-wider font-semibold">
                  Valor total da proposta
                </span>

                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-bold text-red-600 font-sans tabular-nums">
                    {formatBRL(totalPriceCalculated)}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-200/80 text-xs text-gray-600">
                  <span>Equivalente por pessoa:</span>
                  <span className="text-gray-900 font-bold font-sans text-sm tabular-nums">
                    R$ {(totalPriceCalculated / guests).toFixed(2).replace('.', ',')}
                  </span>
                </div>

                {selectedExtras.length > 0 && (
                  <div className="pt-2 text-[11px] text-amber-600 border-t border-gray-200/60 flex items-center justify-between">
                    <span>Opcionais inclusos ({selectedExtras.length}):</span>
                    <span className="font-sans font-bold tabular-nums">+ {formatBRL(extrasCost)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Payment Button & Gateway Status */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-gray-600 font-medium">
                  Status do Gateway:
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-none bg-[#2d3448] text-amber-600 text-xs font-semibold border border-[#af8d11]/40">
                  <span className="w-2 h-2 rounded-none bg-[#e9c349] animate-pulse" />
                  Pagamento indisponível
                </span>
              </div>

              {/* Disabled Checkout Button - Rectangular */}
              <button
                type="button"
                onClick={onOpenGatewayModal}
                className="w-full py-3.5 px-6 rounded-none bg-[#2d3448] text-gray-600 hover:text-gray-900 hover:bg-[#31394d] text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-2 transition-all cursor-pointer border border-[#31394d]"
              >
                <Lock className="w-4 h-4 text-gray-600" />
                <span>Pagar com Pagar.me</span>
              </button>

              {/* Primary Action: Direct Contact / Validation on WhatsApp - Rectangular */}
              <button
                type="button"
                disabled={!hasGuestsChosen}
                onClick={() =>
                  onOpenDirectValidation({
                    packageCode: currentPkg.code,
                    packageName: currentPkg.name,
                    guests: guests || currentPkg.people,
                    estimatedTotal: hasGuestsChosen ? formatBRL(totalPriceCalculated) : 'A definir',
                    extras: selectedExtras.map(
                      (id) => EXTRA_OPTIONS.find((e) => e.id === id)?.name || id
                    ),
                    termsConfirmed,
                  })
                }
                className={`w-full py-3.5 px-6 rounded-none font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all border ${
                  hasGuestsChosen
                    ? 'bg-[#e03131] hover:bg-[#bc121c] text-white border-[#e03131] shadow-[0_8px_24px_rgba(224,49,49,0.3)] cursor-pointer active:scale-98'
                    : 'bg-gray-100 text-gray-600 border-gray-200 cursor-not-allowed opacity-60'
                }`}
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>
                  {hasGuestsChosen
                    ? 'Alinhar Proposta com Restaurante'
                    : 'Escolha os Convidados para Avançar'}
                </span>
              </button>

              {/* Explanation Note */}
              <p className="text-[11px] text-gray-600 text-center leading-relaxed px-1">
                Nenhuma cobrança será realizada nesta página. Os links oficiais de checkout seguro Pagar.me serão ativados assim que a operação comercial for confirmada.
              </p>
            </div>

            {/* Architecture Reference Mock Box */}
            <div className="p-3 rounded-none bg-gray-100/80 text-[11px] font-mono text-gray-600/80 flex flex-col gap-1 border border-gray-200">
              <span className="text-red-600 font-bold">[INTEGRAÇÃO PAGAR.ME]</span>
              <span>payment-config.js: status = "awaiting_merchant_approval"</span>
              <span>packages.js: 8 SKUs sincronizados • Aniversários & 15 Anos agrupados</span>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
