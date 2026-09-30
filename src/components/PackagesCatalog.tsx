import React, { useState } from 'react';
import { BookOpen, ArrowRight, Star, ShoppingBag, Eye, ExternalLink, Check } from 'lucide-react';
import { PACKAGES, PackageItem } from '../data/packages';

interface PackagesCatalogProps {
  onSelectPackage: (pkgId: string) => void;
  onOpenDetails: (pkg: PackageItem) => void;
  onAddToCart: (pkg: PackageItem) => void;
  selectedPackageId: string;
}

export const PackagesCatalog: React.FC<PackagesCatalogProps> = ({
  onSelectPackage,
  onOpenDetails,
  onAddToCart,
  selectedPackageId,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'aniversario' | 'casamento' | '15anos' | 'outros'>('all');

  const filteredPackages = PACKAGES.filter((pkg) => {
    if (activeFilter === 'all') return true;
    return pkg.category === activeFilter;
  });

  return (
    <section className="w-full py-20 bg-white relative" id="pacotes">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-gray-200">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-red-600 text-xs uppercase tracking-widest font-bold">
              <BookOpen className="w-4 h-4 text-[#e03131]" />
              <span>Cardápios &amp; Pacotes de Celebração</span>
            </div>
            
            {/* Title in strictly two lines as requested */}
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-normal leading-[1.15] tracking-tight font-editorial text-gray-900">
              Seu motivo de celebrar.<br />
              <span className="italic text-[#e03131] font-normal">Nosso ponto de partida.</span>
            </h2>
            
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl">
              Clique em qualquer evento para ver todos os detalhes do produto e definir a quantidade de pessoas no carrinho.
            </p>
          </div>

          {/* Direct Anchor to My Event */}
          <a
            href="#meu-evento"
            className="inline-flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-gray-900 transition-colors shrink-0 group"
          >
            <span>Ir para simulador de evento</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </a>
        </div>

        {/* Category Filter Buttons - Rectangular styling (rounded-none) */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none" role="tablist">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-5 py-2.5 rounded-none text-xs font-semibold tracking-wider uppercase transition-all duration-200 flex items-center gap-1.5 cursor-pointer whitespace-nowrap border ${
              activeFilter === 'all'
                ? 'bg-[#e03131] text-white border-[#e03131] shadow-md'
                : 'bg-gray-50 text-gray-600 border-gray-200 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <span>Todos os pacotes</span>
            <span className="text-[11px] opacity-80">({PACKAGES.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('casamento')}
            className={`px-5 py-2.5 rounded-none text-xs font-semibold tracking-wider uppercase transition-all duration-200 flex items-center gap-1.5 cursor-pointer whitespace-nowrap border ${
              activeFilter === 'casamento'
                ? 'bg-[#e03131] text-white border-[#e03131] shadow-md'
                : 'bg-gray-50 text-gray-600 border-gray-200 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <span>Casamento</span>
            <span className="text-[11px] opacity-70">({PACKAGES.filter(p => p.category === 'casamento').length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('aniversario')}
            className={`px-5 py-2.5 rounded-none text-xs font-semibold tracking-wider uppercase transition-all duration-200 flex items-center gap-1.5 cursor-pointer whitespace-nowrap border ${
              activeFilter === 'aniversario'
                ? 'bg-[#e03131] text-white border-[#e03131] shadow-md'
                : 'bg-gray-50 text-gray-600 border-gray-200 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <span>Aniversário</span>
            <span className="text-[11px] opacity-70">({PACKAGES.filter(p => p.category === 'aniversario').length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('15anos')}
            className={`px-5 py-2.5 rounded-none text-xs font-semibold tracking-wider uppercase transition-all duration-200 flex items-center gap-1.5 cursor-pointer whitespace-nowrap border ${
              activeFilter === '15anos'
                ? 'bg-[#e03131] text-white border-[#e03131] shadow-md'
                : 'bg-gray-50 text-gray-600 border-gray-200 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <span>15 anos</span>
            <span className="text-[11px] opacity-70">({PACKAGES.filter(p => p.category === '15anos').length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('outros')}
            className={`px-5 py-2.5 rounded-none text-xs font-semibold tracking-wider uppercase transition-all duration-200 flex items-center gap-1.5 cursor-pointer whitespace-nowrap border ${
              activeFilter === 'outros'
                ? 'bg-[#e03131] text-white border-[#e03131] shadow-md'
                : 'bg-gray-50 text-gray-600 border-gray-200 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <span>Outros</span>
            <span className="text-[11px] opacity-70">({PACKAGES.filter(p => p.category === 'outros').length})</span>
          </button>
        </div>

        {/* Packages Grid (All 8 exact items) - Entire Card is Clickable to Open Product */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredPackages.map((pkg) => {
            const isSelected = selectedPackageId === pkg.id;

            return (
              <article
                key={pkg.id}
                onClick={() => onOpenDetails(pkg)}
                className={`flex flex-col bg-white rounded-[24px] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] border transition-all duration-500 transform hover:-translate-y-1 relative group cursor-pointer ${
                  isSelected 
                    ? 'border-red-500/30 ring-4 ring-red-500/10' 
                    : 'border-gray-100'
                }`}
                title={`Ver detalhes de ${pkg.name}`}
              >
                {/* Card Image */}
                <div className="relative w-full h-[220px] overflow-hidden bg-gray-100">
                  <img
                    alt={pkg.altText}
                    src={pkg.image}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Glassmorphism Category Pill */}
                  <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-md text-[10px] text-white font-bold tracking-wider uppercase border border-white/20">
                    {pkg.categoryLabel}
                  </div>
                  
                  {/* Highlight Badge or Code */}
                  {pkg.highlight ? (
                    <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-lg flex items-center gap-1.5 border border-amber-400/50">
                      <Star className="w-3 h-3 fill-white" />
                      <span>Destaque</span>
                    </div>
                  ) : (
                    <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-bold text-gray-900 border border-gray-200">
                      {pkg.code}
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Card Content */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-2xl font-medium font-editorial text-gray-900 group-hover:text-[#e03131] transition-colors leading-tight mb-4 pr-4">
                      {pkg.name}
                    </h3>

                    {/* Elegant List */}
                    <ul className="text-sm text-gray-600 space-y-2.5">
                      {pkg.highlights.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Minimalist Footer Action */}
                  <div className="mt-8 pt-5 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                        A partir de
                      </span>
                      <div className="flex items-baseline gap-1 text-gray-900">
                        <span className="text-lg font-bold font-sans tabular-nums text-gray-900">
                          R$ {pkg.perPerson.toFixed(2).replace('.', ',')}
                        </span>
                        <span className="text-xs text-gray-500">/pessoa</span>
                      </div>
                    </div>
                    
                    <div className="w-11 h-11 rounded-full bg-red-50 flex items-center justify-center group-hover:bg-[#e03131] transition-colors duration-500 shadow-sm">
                      <ArrowRight className="w-5 h-5 text-[#e03131] group-hover:text-white transition-colors duration-500" />
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
