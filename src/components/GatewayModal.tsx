import React, { useState } from 'react';
import { X, Lock, ShieldCheck, CreditCard, Receipt, ArrowLeft, CheckCircle } from 'lucide-react';
import { CartItem } from './CartDrawer';
import { EXTRA_OPTIONS } from '../data/packages';

interface GatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDirectContact: () => void;
  cartItem?: CartItem | null;
}

export const GatewayModal: React.FC<GatewayModalProps> = ({
  isOpen,
  onClose,
  cartItem,
}) => {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  if (!isOpen) return null;

  // Calculate pricing
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

  const handleCheckout = async () => {
    if (!cartItem || !pkg || !hasGuestsChosen || isRedirecting) return;

    setIsRedirecting(true);
    setCheckoutError('');

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageCode: pkg.code,
          guests,
          selectedExtras: cartItem.selectedExtras,
        }),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok || typeof result.url !== 'string') {
        throw new Error(result.error || 'Não foi possível iniciar o pagamento.');
      }

      const checkoutUrl = new URL(result.url);
      const validHosts = new Set(['payment-link.pagar.me', 'checkout.pagar.me']);
      if (checkoutUrl.protocol !== 'https:' || !validHosts.has(checkoutUrl.hostname)) {
        throw new Error('O endereço retornado pelo gateway é inválido.');
      }

      window.location.assign(checkoutUrl.href);
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : 'Não foi possível iniciar o pagamento.');
      setIsRedirecting(false);
    }
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
            Voltar ao Carrinho
          </button>
          
          <div className="flex items-center gap-2 text-amber-600">
            <Lock className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Checkout Seguro</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-12 items-start">
        
        {/* Left Column: Checkout Form */}
        <div className="w-full lg:flex-1 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold font-editorial tracking-tight text-gray-900 mb-2">
              Pagamento &amp; Pedido
            </h1>
            <p className="text-gray-600 text-sm">
              Finalize sua reserva preenchendo os dados abaixo com segurança.
            </p>
          </div>

          <div className="space-y-6">
            {/* Payment methods available in the hosted checkout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative flex items-center justify-between p-4 rounded-xl border-2 border-green-200 bg-green-50/50">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <div className="font-bold flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-green-600" />
                    PIX
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                  Instantâneo
                </span>
              </div>

              <div className="relative flex flex-col p-4 rounded-xl border-2 border-blue-200 bg-blue-50/40">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <div className="font-bold flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    Cartão de Crédito
                  </div>
                </div>
              </div>
            </div>

            {/* Hosted payment explanation */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm min-h-[300px]">
              <div className="flex flex-col items-center justify-center text-center space-y-4 h-full py-8">
                <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mb-2">
                  <Lock className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-lg">Pagamento protegido pelo Pagar.me</h3>
                <p className="text-sm text-gray-600 max-w-md leading-relaxed">
                  Ao continuar, você será direcionado ao checkout seguro para escolher PIX ou cartão e informar os dados de pagamento diretamente no ambiente do Pagar.me.
                </p>
                <div className="text-[#e03131] font-bold pt-4 text-xl sm:text-2xl font-sans">
                  {formatBRL(totalCalculated)}
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-4 space-y-4">
              <button
                type="button"
                onClick={handleCheckout}
                disabled={!cartItem || !hasGuestsChosen || isRedirecting}
                className="w-full py-3.5 sm:py-4 px-4 sm:px-6 rounded-xl bg-[#e03131] hover:bg-[#bc121c] disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none text-white font-bold text-[11px] sm:text-sm uppercase tracking-wider shadow-[0_8px_24px_rgba(224,49,49,0.35)] hover:shadow-lg hover:-translate-y-0.5 disabled:hover:translate-y-0 transition-all flex items-center justify-center gap-1.5 sm:gap-2 active:scale-98"
              >
                <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white shrink-0" />
                <span className="truncate">
                  {isRedirecting ? 'Abrindo pagamento seguro...' : `Pagar com PIX ou cartão — ${formatBRL(totalCalculated)}`}
                </span>
              </button>
              {checkoutError && (
                <p role="alert" className="text-sm text-red-700 text-center font-medium bg-red-50 border border-red-100 rounded-xl p-3">
                  {checkoutError}
                </p>
              )}
              <div className="flex items-center justify-center gap-2 text-[11px] text-gray-500 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                Todas as transações são seguras e criptografadas.
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary (Sticky) */}
        <div className="w-full lg:w-[400px] shrink-0 sticky top-12 animate-in fade-in slide-in-from-right-8 duration-700 delay-100">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-6 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-amber-600" />
              Resumo do Pedido
            </h2>

            {cartItem && pkg ? (
              <div className="space-y-6">
                {/* Package Info */}
                <div className="flex gap-4 items-start">
                  <div className="w-16 h-16 rounded-xl bg-gray-100 shrink-0 overflow-hidden border border-gray-200">
                    <img src={pkg.image} alt={pkg.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
                      {pkg.categoryLabel}
                    </span>
                    <h3 className="text-lg font-bold font-editorial text-gray-900 truncate">
                      {pkg.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {guests} pessoas ({formatBRL(pkg.perPerson)}/un)
                    </p>
                  </div>
                </div>

                <div className="h-px bg-gray-100 w-full" />

                {/* Calculations */}
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center text-gray-600">
                    <span>Subtotal do Buffet</span>
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

                <div className="flex justify-between items-end gap-2">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-900 block">Total a Pagar</span>
                    <span className="text-[10px] text-gray-500 block">Em BRL (Real Brasileiro)</span>
                  </div>
                  <span className="text-xl sm:text-2xl font-bold font-sans text-[#e03131] tracking-tight shrink-0 tabular-nums">
                    {formatBRL(totalCalculated)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500 text-center py-8">
                Carrinho vazio
              </div>
            )}
          </div>
          
          <div className="mt-6 flex flex-col gap-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
              <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
              <p className="text-[11px] text-gray-600 font-medium">
                Garantia de atendimento e cardápio de primeira linha do <strong>Concórdia Grill</strong>.
              </p>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};
