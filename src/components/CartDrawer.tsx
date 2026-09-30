import React from 'react';
import { 
  X, 
  Trash2, 
  Users, 
  Lock, 
  CheckCircle,
  ShoppingBag,
  ArrowLeft,
  Receipt,
  Plus
} from 'lucide-react';
import { PackageItem, EXTRA_OPTIONS } from '../data/packages';

export interface CartItem {
  pkg: PackageItem;
  guests: number; // 0 means unchosen!
  selectedExtras: string[];
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItem: CartItem | null;
  onUpdateGuests: (guests: number) => void;
  onToggleExtra: (extraId: string) => void;
  onRemoveItem: () => void;
  onOpenDirectValidation: (details: {
    packageCode: string;
    packageName: string;
    guests: number;
    estimatedTotal: string;
    extras: string[];
    termsConfirmed: boolean;
  }) => void;
  onOpenGatewayModal: () => void;
  termsConfirmed: boolean;
  setTermsConfirmed: (confirmed: boolean) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItem,
  onUpdateGuests,
  onToggleExtra,
  onRemoveItem,
  onOpenGatewayModal,
  termsConfirmed,
  setTermsConfirmed,
}) => {
  if (!isOpen) return null;

  const pkg = cartItem?.pkg;
  const guests = cartItem?.guests || 0;
  const hasGuestsChosen = guests > 0;

  const isCustomGuests = hasGuestsChosen && pkg && guests !== pkg.people;
  const baseCost = hasGuestsChosen && pkg
    ? (isCustomGuests ? guests * pkg.perPerson : pkg.totalPrice)
    : 0;

  const extrasCost = (cartItem?.selectedExtras || []).reduce((sum, extraId) => {
    const extra = EXTRA_OPTIONS.find((e) => e.id === extraId);
    if (!extra) return sum;
    if (extra.fixedPrice) return sum + extra.fixedPrice;
    if (extra.pricePerPerson) return sum + extra.pricePerPerson * (guests || 1);
    return sum;
  }, 0);

  const totalCalculated = baseCost + extrasCost;

  const formatBRL = (val: number) => {
    return 'R$ ' + val.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900 selection:bg-[#e03131] selection:text-white">
      {/* Slim Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Continuar Explorando
          </button>
          
          <div className="flex items-center gap-2 text-[#e03131]">
            <ShoppingBag className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Seu Carrinho</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-12 items-start">
        
        {/* Left Column: Cart Details */}
        <div className="w-full lg:flex-1 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold font-editorial tracking-tight text-gray-900 mb-2">
              Detalhes do Pedido
            </h1>
            <p className="text-gray-600 text-sm">
              Configure a quantidade de convidados e adicione opcionais ao seu buffet.
            </p>
          </div>

          {!cartItem || !pkg ? (
            <div className="bg-white p-12 rounded-2xl border border-gray-200 shadow-sm text-center flex flex-col items-center justify-center">
              <ShoppingBag className="w-12 h-12 text-gray-300 mb-4" />
              <h3 className="text-xl font-bold font-editorial text-gray-900 mb-2">Seu carrinho está vazio</h3>
              <p className="text-sm text-gray-500 mb-6">Explore nossos pacotes e escolha o menu ideal para sua celebração.</p>
              <button
                onClick={onClose}
                className="py-3 px-6 rounded-xl bg-[#e03131] text-white font-bold text-sm uppercase tracking-wider hover:bg-[#bc121c] transition-colors"
              >
                Ver Pacotes Disponíveis
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Selected Package Card */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex items-start gap-5 relative overflow-hidden group transition-all hover:border-gray-300">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl bg-gray-100 shrink-0 overflow-hidden border border-gray-200">
                  <img src={pkg.image} alt={pkg.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                
                <div className="flex-1 min-w-0 flex flex-col pt-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                      {pkg.categoryLabel}
                    </span>
                    <button
                      type="button"
                      onClick={onRemoveItem}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                      title="Remover pacote"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <h3 className="text-xl sm:text-2xl font-bold font-editorial text-gray-900 mb-1 truncate">
                    {pkg.name}
                  </h3>
                  
                  <div className="text-sm text-gray-600 mb-2">
                    <span className="inline-block px-2 py-0.5 rounded-md bg-gray-100 font-sans font-semibold text-xs mr-2 border border-gray-200">
                      CÓDIGO: {pkg.code}
                    </span>
                  </div>
                  
                  <div className="text-xs text-gray-500 mt-auto">
                    Preço base unitário: <strong className="text-gray-900 font-sans font-bold tabular-nums">{formatBRL(pkg.perPerson)}</strong> / pessoa
                  </div>
                </div>
              </div>

              {/* Quantidade de Convidados Dropdown */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <label className="text-base font-bold font-editorial text-gray-900 flex items-center gap-2 mb-4">
                  <Users className="w-4 h-4 text-amber-600" />
                  Quantidade de Convidados
                </label>
                <div className="relative max-w-sm">
                  <select
                    value={guests}
                    onChange={(e) => onUpdateGuests(parseInt(e.target.value, 10))}
                    className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-900 text-base font-semibold font-sans rounded-xl px-5 py-4 pr-12 focus:outline-none focus:ring-2 focus:ring-[#e03131]/20 focus:border-[#e03131] transition-colors cursor-pointer tabular-nums"
                  >
                    {[25, 50, 75, 100, 150, 200, 250, 300].map(num => (
                      <option key={num} value={num}>{num} pessoas — {formatBRL(num * pkg.perPerson)}</option>
                    ))}
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Selecione o tamanho aproximado do seu evento. O valor base será ajustado automaticamente.
                </p>
              </div>

              {/* Extras Section */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <label className="text-base font-bold font-editorial text-gray-900 flex items-center gap-2">
                    <Plus className="w-4 h-4 text-amber-600" />
                    Adicionar Opcionais
                  </label>
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Sob Demanda</span>
                </div>

                <div className="space-y-3">
                  {EXTRA_OPTIONS.map((extra) => {
                    const isSelected = (cartItem.selectedExtras || []).includes(extra.id);
                    return (
                      <label
                        key={extra.id}
                        className={`flex items-start sm:items-center justify-between gap-4 p-4 rounded-xl cursor-pointer transition-all border-2 ${
                          isSelected
                            ? 'border-amber-400 bg-amber-50/30'
                            : 'border-gray-100 bg-gray-50/50 hover:bg-gray-100 hover:border-gray-200'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => onToggleExtra(extra.id)}
                            className="mt-1 sm:mt-0 w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                          />
                          <span className="text-sm font-semibold text-gray-900">{extra.name}</span>
                        </div>
                        <span className="text-sm font-bold text-amber-600 shrink-0 font-sans tabular-nums bg-white px-2.5 py-1 rounded-md border border-amber-100 shadow-sm">
                          {extra.fixedPrice
                            ? `+ ${formatBRL(extra.fixedPrice)}`
                            : `+ ${formatBRL(extra.pricePerPerson)}/p`}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Right Column: Order Summary (Sticky) */}
        {cartItem && pkg && (
          <div className="w-full lg:w-[400px] shrink-0 sticky top-12 animate-in fade-in slide-in-from-right-8 duration-700 delay-100">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
              
              <h2 className="text-lg font-bold font-editorial text-gray-900 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-amber-600" />
                Resumo do Pedido
              </h2>

              {/* Calculations */}
              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center text-gray-600">
                  <span>Buffet Base ({guests} pessoas)</span>
                  <span className="font-bold font-sans text-gray-900 tabular-nums">{formatBRL(baseCost)}</span>
                </div>
                
                {cartItem.selectedExtras && cartItem.selectedExtras.length > 0 && (
                  <div className="flex justify-between items-start text-amber-600">
                    <div className="flex flex-col gap-1">
                      <span>Opcionais Adicionais ({cartItem.selectedExtras.length})</span>
                    </div>
                    <span className="font-bold font-sans tabular-nums">{formatBRL(extrasCost)}</span>
                  </div>
                )}
              </div>

              <div className="h-px bg-gray-100 w-full" />

              <div className="flex justify-between items-end">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-900">Total Previsto</span>
                  <span className="text-[10px] text-gray-500">Em BRL (Real Brasileiro)</span>
                </div>
                <span className="text-3xl font-bold font-sans text-[#e03131] tracking-tight tabular-nums">
                  {formatBRL(totalCalculated)}
                </span>
              </div>

              {/* Term Confirmation */}
              <label className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 border border-gray-200 cursor-pointer transition-colors hover:bg-gray-100">
                <input
                  type="checkbox"
                  checked={termsConfirmed}
                  onChange={(e) => setTermsConfirmed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-gray-300 text-[#e03131] focus:ring-[#e03131] cursor-pointer shrink-0"
                />
                <span className="text-xs text-gray-600 leading-relaxed font-medium">
                  Confirmo que alinharei a data, o local e o cardápio com a equipe do <strong>Concórdia Grill</strong> após reservar.
                </span>
              </label>

              {/* Action Button */}
              <button
                type="button"
                disabled={!termsConfirmed}
                onClick={onOpenGatewayModal}
                className={`w-full py-4 px-6 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(224,49,49,0.35)] hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-98 ${
                  termsConfirmed
                    ? 'bg-[#e03131] hover:bg-[#bc121c] text-white border border-[#e03131]'
                    : 'bg-gray-200 text-gray-400 border border-gray-200 cursor-not-allowed shadow-none hover:shadow-none hover:-translate-y-0'
                }`}
              >
                <Lock className="w-4 h-4" />
                Ir para Pagamento
              </button>

            </div>
          </div>
        )}
      </main>
    </div>
  );
};
