import React, { useState } from 'react';
import { ArrowLeft, CreditCard, Lock, QrCode, Receipt, ShieldCheck } from 'lucide-react';
import { formatBRL, PackageItem } from '../data/packages';

interface GatewayModalProps {
  pkg: PackageItem;
  guests: number;
  onClose: () => void;
}

export const GatewayModal: React.FC<GatewayModalProps> = ({ pkg, guests, onClose }) => {
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerDocument, setCustomerDocument] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit_card'>('pix');
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const option = pkg.purchaseOptions.find((item) => item.guests === guests) ?? pkg.purchaseOptions[0];

  const handleCheckout = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isRedirecting) return;
    setIsRedirecting(true);
    setCheckoutError('');
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageCode: pkg.code,
          guests,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          customer_document: customerDocument,
          payment_method: paymentMethod,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || typeof result.url !== 'string') throw new Error(result.error || 'Não foi possível iniciar o pagamento.');
      window.location.assign(result.url);
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : 'Não foi possível iniciar o pagamento.');
      setIsRedirecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pt-28 pb-16">
      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10 items-start">
        <div className="space-y-6">
          <button type="button" onClick={onClose} className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-red-600"><ArrowLeft className="w-4 h-4" />Voltar ao meu evento</button>
          <div><h1 className="text-3xl sm:text-4xl font-bold font-editorial">Pagamento &amp; Pedido</h1><p className="text-gray-600 text-sm mt-1">Preencha seus dados para abrir o checkout seguro Pagar.me.</p></div>
          <form onSubmit={handleCheckout} className="space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-4">
              <h2 className="font-bold text-lg border-b pb-3">Dados do titular</h2>
              <div><label className="block text-sm font-medium text-gray-700">Nome completo</label><input required value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="mt-1 w-full border border-gray-300 rounded-lg py-3 px-4 focus:ring-2 focus:ring-red-500 outline-none" /></div>
              <div><label className="block text-sm font-medium text-gray-700">E-mail</label><input type="email" required value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} className="mt-1 w-full border border-gray-300 rounded-lg py-3 px-4 focus:ring-2 focus:ring-red-500 outline-none" /></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700">Telefone</label><input type="tel" required value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="mt-1 w-full border border-gray-300 rounded-lg py-3 px-4 focus:ring-2 focus:ring-red-500 outline-none" /></div>
                <div><label className="block text-sm font-medium text-gray-700">CPF ou CNPJ</label><input value={customerDocument} onChange={(e) => setCustomerDocument(e.target.value)} className="mt-1 w-full border border-gray-300 rounded-lg py-3 px-4 focus:ring-2 focus:ring-red-500 outline-none" /></div>
              </div>
            </div>
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-4">
              <h2 className="font-bold text-lg border-b pb-3">Forma de pagamento</h2>
              <div className="grid grid-cols-2 gap-4">
                <button type="button" onClick={() => setPaymentMethod('pix')} className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 ${paymentMethod === 'pix' ? 'border-red-600 bg-red-50 text-red-600' : 'border-gray-200 text-gray-500'}`}><QrCode className="w-7 h-7" /><span className="font-bold text-sm">PIX</span></button>
                <button type="button" onClick={() => setPaymentMethod('credit_card')} className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 ${paymentMethod === 'credit_card' ? 'border-red-600 bg-red-50 text-red-600' : 'border-gray-200 text-gray-500'}`}><CreditCard className="w-7 h-7" /><span className="font-bold text-sm">Cartão</span></button>
              </div>
            </div>
            {checkoutError && <p role="alert" className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm font-medium">{checkoutError}</p>}
            <button type="submit" disabled={isRedirecting} className="w-full h-14 rounded-xl bg-[#e03131] hover:bg-[#bc121c] disabled:bg-gray-300 text-white font-bold uppercase tracking-wider flex items-center justify-center gap-2"><Lock className="w-4 h-4" />{isRedirecting ? 'Abrindo pagamento seguro...' : `Pagar ${formatBRL(option.price)}`}</button>
            <p className="flex items-center justify-center gap-2 text-xs text-gray-500"><ShieldCheck className="w-4 h-4 text-green-600" />O valor final é validado novamente no servidor.</p>
          </form>
        </div>

        <aside className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm lg:sticky lg:top-28">
          <h2 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 mb-5"><Receipt className="w-4 h-4 text-amber-600" />Resumo do pedido</h2>
          <div className="flex gap-4"><img src={pkg.image} alt={pkg.name} className="w-20 h-20 object-cover rounded-xl" /><div><span className="text-xs text-red-600 font-bold">{pkg.code}</span><h3 className="font-bold text-lg">{pkg.name}</h3><p className="text-sm text-gray-500">{guests} pessoas</p></div></div>
          <div className="border-t border-gray-200 mt-5 pt-5 flex justify-between items-end"><span className="text-sm font-semibold">Total</span><span className="text-2xl font-bold text-red-600">{formatBRL(option.price)}</span></div>
        </aside>
      </main>
    </div>
  );
};
