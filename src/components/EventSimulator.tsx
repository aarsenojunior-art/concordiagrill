import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, Users, Utensils } from 'lucide-react';
import { formatBRL, PackageItem } from '../data/packages';

export interface EventSelection {
  packageCode: string;
  guests: number;
}

interface EventSimulatorProps {
  packages: PackageItem[];
  initialSelection: EventSelection;
  onCheckout: (pkg: PackageItem, guests: number) => void;
}

export const EventSimulator: React.FC<EventSimulatorProps> = ({ packages, initialSelection, onCheckout }) => {
  const [packageCode, setPackageCode] = useState(initialSelection.packageCode);
  const [guests, setGuests] = useState(initialSelection.guests);

  useEffect(() => {
    setPackageCode(initialSelection.packageCode);
    setGuests(initialSelection.guests);
  }, [initialSelection]);

  const currentPkg = useMemo(
    () => packages.find((pkg) => pkg.code === packageCode) ?? packages[0],
    [packageCode, packages],
  );
  const selectedOption = currentPkg.purchaseOptions.find((option) => option.guests === guests) ?? currentPkg.purchaseOptions[0];

  const changePackage = (code: string) => {
    const nextPackage = packages.find((pkg) => pkg.code === code) ?? packages[0];
    setPackageCode(nextPackage.code);
    setGuests(nextPackage.purchaseOptions[0].guests);
  };

  return (
    <section className="w-full py-20 bg-gray-100 relative" id="meu-evento">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-10">
        <div className="flex flex-col gap-2">
          <span className="text-xs text-red-600 uppercase tracking-widest font-bold">Meu evento</span>
          <h2 className="text-3xl sm:text-4xl text-gray-900 font-editorial font-normal">Revise sua escolha</h2>
          <p className="text-sm text-gray-600 max-w-2xl">A quantidade e o valor selecionados no catálogo aparecem aqui. Você também pode ajustá-los antes de seguir para o pagamento.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 shadow-xl border border-gray-200 space-y-6">
            <div className="space-y-2">
              <label htmlFor="event-package" className="text-xs font-semibold uppercase tracking-wider flex items-center gap-2"><Utensils className="w-4 h-4 text-red-600" />Pacote</label>
              <select id="event-package" value={currentPkg.code} onChange={(event) => changePackage(event.target.value)} className="w-full h-12 px-4 bg-gray-50 border border-gray-200 font-semibold focus:outline-none focus:ring-2 focus:ring-red-500">
                {packages.map((pkg) => <option key={pkg.code} value={pkg.code}>{pkg.code} — {pkg.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="event-guests" className="text-xs font-semibold uppercase tracking-wider flex items-center gap-2"><Users className="w-4 h-4 text-amber-600" />Quantidade de convidados</label>
              <select id="event-guests" value={guests} onChange={(event) => setGuests(Number(event.target.value))} className="w-full h-12 px-4 bg-gray-50 border border-gray-200 font-semibold focus:outline-none focus:ring-2 focus:ring-red-500">
                {currentPkg.purchaseOptions.map((option) => <option key={option.guests} value={option.guests}>{option.guests} pessoas</option>)}
              </select>
            </div>
          </div>

          <div className="lg:col-span-5 bg-white p-6 sm:p-8 shadow-xl border border-gray-200 space-y-5">
            <div className="flex items-start gap-4">
              <img src={currentPkg.image} alt={currentPkg.name} className="w-20 h-20 object-cover rounded-xl" />
              <div><span className="text-xs text-red-600 font-bold uppercase">{currentPkg.categoryLabel}</span><h3 className="text-2xl font-editorial font-bold">{currentPkg.name}</h3><p className="text-sm text-gray-500">{guests} convidados</p></div>
            </div>
            <div className="border-t border-gray-200 pt-5">
              <span className="text-xs uppercase tracking-wider text-gray-500">Total do pacote</span>
              <div className="text-4xl font-bold text-[#e03131] tabular-nums mt-1">{formatBRL(selectedOption.price)}</div>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600"><CheckCircle2 className="w-4 h-4 text-green-600" />Preço confirmado para a quantidade selecionada.</div>
            <button type="button" onClick={() => onCheckout(currentPkg, guests)} className="w-full h-14 bg-[#e03131] hover:bg-[#bc121c] text-white font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors">Ir para o pagamento <ArrowRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    </section>
  );
};
