import React, { useState } from 'react';
import {
  Utensils,
  Users,
  AlertTriangle,
  RotateCcw,
  Plus,
  Minus,
  CheckCircle2
} from 'lucide-react';
import { PACKAGES } from '../data/packages';

/**
 * Simulador de evento — ferramenta de estimativa de valor por pessoa.
 * Não realiza compra nem adiciona ao carrinho.
 * A contratação ocorre na página individual de cada produto.
 */
export const EventSimulator: React.FC = () => {
  const [selectedPackageId, setSelectedPackageId] = useState<string>(PACKAGES[0].id);
  const [guests, setGuests] = useState<number | null>(null);

  const currentPkg = PACKAGES.find((p) => p.id === selectedPackageId) || PACKAGES[0];

  const hasGuestsChosen = guests !== null && guests > 0;
  const isCustomGuests = hasGuestsChosen && guests !== currentPkg.people;

  const baseCost = hasGuestsChosen ? guests * currentPkg.perPerson : 0;

  const formatBRL = (val: number) => {
    return 'R$ ' + val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handlePackageChange = (newId: string) => {
    setSelectedPackageId(newId);
    setGuests(null);
  };

  const handleSelectDefaultGuests = () => {
    setGuests(currentPkg.people);
  };

  return (
    <section className="w-full py-20 bg-gray-100 relative" id="meu-evento">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-10">

        {/* Cabeçalho da seção */}
        <div className="flex flex-col gap-2">
          <span className="text-xs text-red-600 uppercase tracking-widest font-bold">
            Simulador de Celebração
          </span>
          <h2 className="text-3xl sm:text-4xl text-gray-900 font-editorial font-normal">
            Meu Evento: Estimativa de Valor
          </h2>
          <p className="text-sm text-gray-600 max-w-2xl">
            Escolha um pacote e informe o número de convidados para visualizar uma estimativa de valor. Para contratar, acesse a página individual do pacote desejado.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Coluna Esquerda: Controles */}
          <div className="lg:col-span-7 flex flex-col gap-6 bg-gray-50 p-6 sm:p-8 rounded-none shadow-xl border border-gray-200">

            {/* Passo 1: Selecionar pacote */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="simulator-package-select"
                className="text-xs font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-2"
              >
                <div className="w-5 h-5 rounded-none bg-[#e03131] text-white flex items-center justify-center text-[10px] font-bold">
                  1
                </div>
                <span>Selecione o pacote gastronômico:</span>
              </label>

              <select
                id="simulator-package-select"
                value={currentPkg.id}
                onChange={(e) => handlePackageChange(e.target.value)}
                className="w-full h-12 px-4 rounded-none bg-gray-100 text-gray-900 text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#e03131] transition-all cursor-pointer font-medium"
              >
                <optgroup label="Aniversários &amp; Festas de 15 Anos">
                  {PACKAGES.filter((p) => p.category === 'aniversario' || p.category === '15anos').map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.code} — {pkg.name} ({pkg.tag})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Casamentos">
                  {PACKAGES.filter((p) => p.category === 'casamento').map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.code} — {pkg.name} ({pkg.tag})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Outros (Confraternizações)">
                  {PACKAGES.filter((p) => p.category === 'outros').map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.code} — {pkg.name} ({pkg.tag})
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Passo 2: Quantidade de convidados */}
            <div className="flex flex-col gap-3 p-5 rounded-none bg-gray-100/80 border border-gray-200">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="simulator-guests-input"
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
                    <span>Sugerido ({currentPkg.people}p)</span>
                  </button>
                )}
              </div>

              <p className="text-xs text-gray-600">
                A estimativa de valor será exibida somente após informar o número de convidados.
              </p>

              {/* Presets de quantidade */}
              <div className="flex flex-wrap gap-2 pt-1">
                {[50, 100, 150, 200, 300, 500, 1000].map((preset) => (
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
                    {preset.toLocaleString('pt-BR')}p
                  </button>
                ))}
              </div>

              {/* Stepper de quantidade */}
              <div className="flex items-center gap-3 pt-2">
                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-none overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setGuests((g) => Math.max(10, (g || currentPkg.people) - 10))}
                    className="p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
                    aria-label="Diminuir 10 convidados"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <input
                    id="simulator-guests-input"
                    type="number"
                    min={10}
                    step={10}
                    placeholder="Ex: 100"
                    value={guests ?? ''}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setGuests(isNaN(val) ? null : Math.max(0, val));
                    }}
                    className="w-24 h-12 text-center bg-transparent text-gray-900 font-sans text-xl font-bold focus:outline-none placeholder:text-gray-400 placeholder:text-sm tabular-nums"
                  />

                  <button
                    type="button"
                    onClick={() => setGuests((g) => (g ? g + 10 : currentPkg.people))}
                    className="p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
                    aria-label="Aumentar 10 convidados"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-xs text-gray-600">
                  {hasGuestsChosen ? (
                    <span className="text-amber-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {guests} pessoas
                    </span>
                  ) : (
                    <span className="text-red-600 font-medium animate-pulse">
                      Aguardando seleção...
                    </span>
                  )}
                </div>
              </div>

              {/* Aviso de quantidade personalizada */}
              {isCustomGuests && (
                <div className="mt-1 p-3 rounded-none bg-[#af8d11]/10 border border-[#af8d11]/40 text-amber-700 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    Quantidade personalizada: estimativa proporcional a R$ {currentPkg.perPerson.toFixed(2).replace('.', ',')}/pessoa.
                    Para valor oficial, consulte a página do pacote.
                  </span>
                </div>
              )}
            </div>

            {/* Resumo técnico do produto */}
            <div className="p-4 rounded-none bg-gray-100/90 border border-gray-200 flex flex-col gap-2">
              <div className="flex items-center justify-between text-gray-600 text-[11px] font-mono">
                <span className="font-bold flex items-center gap-1.5">
                  <Utensils className="w-3.5 h-3.5 text-[#e03131]" />
                  CARDÁPIO {currentPkg.code}
                </span>
                <span className="text-amber-600">{currentPkg.categoryLabel}</span>
              </div>
              <div className="flex flex-col gap-1 text-xs">
                <p>
                  <strong className="text-gray-900">Destaques:</strong>{' '}
                  <span className="text-gray-600">
                    {currentPkg.highlights.join(' ')}
                  </span>
                </p>
                <p>
                  <strong className="text-gray-900">Duração:</strong>{' '}
                  <span className="text-gray-600">{currentPkg.durationHours} horas contínuas de buffet</span>
                </p>
              </div>
            </div>

          </div>

          {/* Coluna Direita: Card de Resumo */}
          <div className="lg:col-span-5 bg-gray-50 p-6 sm:p-8 rounded-none shadow-2xl border border-gray-200 flex flex-col gap-6 lg:sticky lg:top-28">

            <div className="flex items-center justify-between pb-2 border-b border-gray-200">
              <span className="text-xs uppercase tracking-wider text-amber-600 font-bold">
                {currentPkg.categoryLabel}
              </span>
              <span className="px-3 py-1 rounded-none bg-[#2d3448] text-gray-300 text-xs font-semibold uppercase tracking-wider border border-[#3b455c]">
                {hasGuestsChosen
                  ? `${guests} convidados`
                  : 'Escolha a quantidade'}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <h3 className="text-2xl sm:text-3xl font-bold font-editorial text-gray-900">
                {currentPkg.name}
              </h3>
              <p className="text-xs text-gray-600">
                Estimativa — valores oficiais na página do pacote
              </p>
            </div>

            {/* Estimativa de valor */}
            {!hasGuestsChosen ? (
              <div className="p-6 rounded-none bg-gray-100 border border-gray-200 flex flex-col items-center justify-center text-center gap-3">
                <div className="w-12 h-12 rounded-none bg-[#e9c349]/15 border border-[#e9c349]/40 flex items-center justify-center text-amber-600">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">
                    Selecione a quantidade de pessoas
                  </h4>
                  <p className="text-xs text-gray-600 mt-1 max-w-xs">
                    Informe o número de convidados para visualizar a estimativa de valor do pacote {currentPkg.name}.
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
              <div className="p-4 rounded-none bg-gray-100 border border-gray-200 flex flex-col gap-3">
                <span className="text-xs text-gray-600 uppercase tracking-wider font-semibold">
                  Estimativa de valor
                </span>

                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-bold text-red-600 font-sans tabular-nums">
                    {formatBRL(baseCost)}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-200 text-xs text-gray-600">
                  <span>Por pessoa (referência):</span>
                  <span className="text-gray-900 font-bold font-sans tabular-nums">
                    R$ {currentPkg.perPerson.toFixed(2).replace('.', ',')}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>Para {guests} convidados:</span>
                  <span className="text-gray-700 font-semibold">{guests} × R$ {currentPkg.perPerson.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>
            )}

            {/* Aviso importante */}
            <div className="p-3 rounded-none bg-amber-50 border border-amber-200 text-xs text-amber-800 leading-relaxed">
              <strong>Estimativa de referência.</strong> Os valores oficiais por quantidade (10, 200, 500 e 1.000 pessoas) estão disponíveis na página de cada pacote, junto ao botão de compra.
            </div>

            {/* Link para os pacotes */}
            <a
              href="#pacotes"
              className="w-full py-3.5 px-6 rounded-none bg-[#e03131] hover:bg-[#bc121c] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all border border-[#e03131] shadow-[0_8px_24px_rgba(224,49,49,0.3)] cursor-pointer text-center"
            >
              <span>Ver todos os pacotes e contratar</span>
            </a>

          </div>

        </div>

      </div>
    </section>
  );
};
