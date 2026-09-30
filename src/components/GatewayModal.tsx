import React, { useState, useEffect } from 'react';
import { X, Lock, ShieldCheck, CreditCard, Receipt, ArrowLeft, CheckCircle, Loader2, QrCode } from 'lucide-react';
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
  
  // Customer Form State
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerDocument, setCustomerDocument] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit_card'>('pix');

  // Order Status State
  const [trackingToken, setTrackingToken] = useState<string | null>(null);
  const [orderStatus, setOrderStatus] = useState<any>(null);

  useEffect(() => {
    const token = sessionStorage.getItem('cg_tracking_token');
    if (token) {
      setTrackingToken(token);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!trackingToken || !isOpen) return;
    
    let interval: ReturnType<typeof setInterval>;
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/order-status', {
          headers: { 'Authorization': `Bearer ${trackingToken}` }
        });
        if (res.ok) {
          const data = await res.json();
          setOrderStatus(data);
          if (data.status === 'paid' || data.status === 'failed' || data.status === 'canceled') {
            clearInterval(interval);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    checkStatus();
    interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, [trackingToken, isOpen]);

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

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
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
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          customer_document: customerDocument,
          payment_method: paymentMethod
        }),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok || typeof result.url !== 'string') {
        throw new Error(result.error || 'Não foi possível iniciar o pagamento.');
      }

      if (result.trackingToken) {
        sessionStorage.setItem('cg_tracking_token', result.trackingToken);
        setTrackingToken(result.trackingToken);
      }

      window.location.assign(result.url);
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : 'Não foi possível iniciar o pagamento.');
      setIsRedirecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900 selection:bg-[#e03131] selection:text-white">
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

      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-12 items-start">
        <div className="w-full lg:flex-1 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold font-editorial tracking-tight text-gray-900 mb-2">
              Pagamento &amp; Pedido
            </h1>
            <p className="text-gray-600 text-sm">
              {trackingToken 
                ? 'Acompanhe o status do seu pedido.'
                : 'Finalize sua reserva preenchendo os dados abaixo com segurança.'}
            </p>
          </div>

          {trackingToken ? (
             <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-lg mb-4 text-center">Status do Pedido</h3>
                {orderStatus ? (
                  <div className="space-y-4 text-center">
                    <div className="text-xl font-semibold">
                      {orderStatus.status === 'pending' && <span className="text-amber-600 flex items-center justify-center gap-2"><Loader2 className="animate-spin w-5 h-5"/> Aguardando Pagamento</span>}
                      {orderStatus.status === 'paid' && <span className="text-green-600 flex items-center justify-center gap-2"><CheckCircle className="w-5 h-5"/> Pagamento Aprovado!</span>}
                      {orderStatus.status === 'failed' && <span className="text-red-600">Pagamento Recusado</span>}
                      {orderStatus.status === 'canceled' && <span className="text-gray-600">Pedido Cancelado</span>}
                    </div>
                    {orderStatus.status === 'pending' && orderStatus.paymentMethod === 'pix' && (
                       <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50 flex flex-col items-center">
                          <p className="text-sm text-gray-700 text-center">Complete o pagamento via PIX na aba da Pagar.me que foi aberta.</p>
                       </div>
                    )}
                  </div>
                ) : (
                  <div className="flex justify-center py-8 text-gray-500"><Loader2 className="animate-spin w-6 h-6" /></div>
                )}
             </div>
          ) : (
            <form onSubmit={handleCheckout} className="space-y-6">
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                <h3 className="font-bold text-lg border-b pb-2 mb-4">Dados do Titular</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nome Completo</label>
                  <input type="text" required value={customerName} onChange={e => setCustomerName(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">E-mail</label>
                  <input type="email" required value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Telefone (WhatsApp)</label>
                    <input type="tel" required value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm" placeholder="11999999999" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">CPF ou CNPJ</label>
                    <input type="text" value={customerDocument} onChange={e => setCustomerDocument(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm" placeholder="Opcional" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-4 mt-6">
                <h3 className="font-bold text-lg border-b pb-2 mb-4">Forma de Pagamento</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('pix')}
                    className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                      paymentMethod === 'pix' ? 'border-[#e03131] bg-red-50 text-[#e03131]' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    <QrCode className="w-8 h-8" />
                    <span className="font-bold text-sm">PIX</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('credit_card')}
                    className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                      paymentMethod === 'credit_card' ? 'border-[#e03131] bg-red-50 text-[#e03131]' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    <CreditCard className="w-8 h-8" />
                    <span className="font-bold text-sm">Cartão de Crédito</span>
                  </button>
                </div>
              </div>

              <div className="pt-4 space-y-4">
                <button
                  type="submit"
                  disabled={!cartItem || !hasGuestsChosen || isRedirecting}
                  className="w-full py-3.5 sm:py-4 px-4 sm:px-6 rounded-xl bg-[#e03131] hover:bg-[#bc121c] disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none text-white font-bold text-[11px] sm:text-sm uppercase tracking-wider shadow-[0_8px_24px_rgba(224,49,49,0.35)] hover:shadow-lg hover:-translate-y-0.5 disabled:hover:translate-y-0 transition-all flex items-center justify-center gap-1.5 sm:gap-2 active:scale-98"
                >
                  <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white shrink-0" />
                  <span className="truncate">
                    {isRedirecting ? 'Abrindo pagamento seguro...' : `Pagar com ${paymentMethod === 'pix' ? 'PIX' : 'Cartão'} — ${formatBRL(totalCalculated)}`}
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
            </form>
          )}
        </div>

        {/* Right Column: Order Summary */}
        <div className="w-full lg:w-[400px] shrink-0 sticky top-12 animate-in fade-in slide-in-from-right-8 duration-700 delay-100">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-6 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-amber-600" />
              Resumo do Pedido
            </h2>
            {cartItem && pkg ? (
              <div className="space-y-6">
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
