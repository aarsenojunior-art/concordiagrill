import React, { useState } from 'react';
import { BookOpen, ArrowRight, Check, Users } from 'lucide-react';
import { formatBRL, PackageItem } from '../data/packages';

interface PackagesCatalogProps {
  packages: PackageItem[];
  onOpenDetails: (pkg: PackageItem) => void;
  onSelectOption: (pkg: PackageItem, guests: number) => void;
  onCheckout?: (pkg: PackageItem, guests: number) => void;
}

export const PackagesCatalog: React.FC<PackagesCatalogProps> = ({ packages, onOpenDetails, onSelectOption, onCheckout }) => {
  const [activeFilter, setActiveFilter] = useState<'all' | PackageItem['category']>('all');
  const [selectedGuests, setSelectedGuests] = useState<Record<string, number>>({});
  const filteredPackages = packages.filter((pkg) => activeFilter === 'all' || pkg.category === activeFilter);
  const filters: Array<{ value: 'all' | PackageItem['category']; label: string }> = [
    { value: 'all', label: 'Todos os pacotes' }, { value: 'casamento', label: 'Casamento' },
    { value: 'aniversario', label: 'Aniversário' }, { value: '15anos', label: '15 anos' }, { value: 'outros', label: 'Outros' },
  ];

  return (
    <section className="w-full py-20 bg-white relative" id="pacotes">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-10">
        <div className="flex flex-col gap-6 pb-2 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-red-600 text-xs uppercase tracking-widest font-bold"><BookOpen className="w-4 h-4" /><span>Cardápios &amp; Pacotes de Celebração</span></div>
              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-normal leading-[1.15] tracking-tight font-editorial text-gray-900">Seu motivo de celebrar.<br /><span className="italic text-[#e03131]">Nosso ponto de partida.</span></h2>
              <p className="text-sm sm:text-base text-gray-600 max-w-2xl">Escolha a quantidade em cada pacote para ver o valor e levar a seleção até o seu evento.</p>
            </div>
            <a href="#como-funciona" className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-gray-900"><span>Como funciona</span><ArrowRight className="w-4 h-4" /></a>
          </div>
        </div>

        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none" role="tablist">
          {filters.map((filter) => {
            const count = filter.value === 'all' ? packages.length : packages.filter((pkg) => pkg.category === filter.value).length;
            return <button key={filter.value} type="button" onClick={() => setActiveFilter(filter.value)} className={`px-5 py-2.5 text-xs font-semibold tracking-wider uppercase whitespace-nowrap border transition-all ${activeFilter === filter.value ? 'bg-[#e03131] text-white border-[#e03131]' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}>{filter.label} <span className="text-[11px] opacity-75">({count})</span></button>;
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredPackages.map((pkg) => {
            const guests = selectedGuests[pkg.id] ?? 50;
            const selectedOption = pkg.purchaseOptions.find((option) => option.guests === guests) ?? pkg.purchaseOptions[0];
            const startingOption = pkg.purchaseOptions[0];
            return (
              <article key={pkg.id} className="flex flex-col bg-white rounded-[24px] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] border border-gray-100 transition-all duration-500 relative group">
                <button type="button" onClick={() => onOpenDetails(pkg)} className="relative w-full h-[220px] overflow-hidden bg-gray-100 text-left cursor-pointer">
                  <img alt={pkg.altText} src={pkg.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" referrerPolicy="no-referrer" />
                  <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-md text-[10px] text-white font-bold tracking-wider uppercase border border-white/20">{pkg.categoryLabel}</div>
                  {pkg.highlight ? <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-lg">★ Destaque</div> : <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-white/90 text-[10px] font-bold text-gray-900">{pkg.code}</div>}
                </button>
                <div className="p-6 flex-1 flex flex-col">
                  <button type="button" onClick={() => onOpenDetails(pkg)} className="text-left cursor-pointer"><h3 className="text-2xl font-medium font-editorial text-gray-900 group-hover:text-[#e03131] transition-colors leading-tight mb-4">{pkg.name}</h3></button>
                  <ul className="text-sm text-gray-600 space-y-2.5">{pkg.highlights.map((item, idx) => <li key={idx} className="flex items-start gap-3"><Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" /><span>{item}</span></li>)}</ul>
                  <div className="mt-auto pt-6 space-y-3">
                    <p className="text-sm font-semibold text-gray-900">A partir de {formatBRL(startingOption.price)} <span className="font-normal text-gray-500">(50 pessoas)</span></p>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold" htmlFor={`guests-${pkg.id}`}>Quantidade de convidados</label>
                    <div className="relative"><Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" /><select id={`guests-${pkg.id}`} value={guests} onChange={(event) => setSelectedGuests((current) => ({ ...current, [pkg.id]: Number(event.target.value) }))} className="w-full h-11 pl-10 pr-4 rounded-xl bg-gray-50 border border-gray-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-500">{pkg.purchaseOptions.map((option) => <option key={option.guests} value={option.guests}>{option.guests} pessoas</option>)}</select></div>
                    <div className="text-2xl font-bold text-[#e03131] tabular-nums">{formatBRL(selectedOption.price)}</div>
                    <div className="grid grid-cols-2 gap-2">
                      <button type="button" onClick={() => onOpenDetails(pkg)} className="h-11 rounded-xl border border-gray-200 text-xs font-bold uppercase text-gray-700 hover:bg-gray-50 cursor-pointer">Detalhes</button>
                      <button type="button" onClick={() => (onCheckout ? onCheckout(pkg, guests) : onSelectOption(pkg, guests))} className="h-11 rounded-xl bg-[#e03131] text-white text-xs font-bold uppercase hover:bg-[#bc121c] cursor-pointer transition-colors">Contratar</button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
