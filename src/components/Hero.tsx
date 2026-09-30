import React from 'react';
import { ArrowDown, Flame, CheckCircle, ShieldCheck } from 'lucide-react';

interface HeroProps {
  onScrollToPackages: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onScrollToPackages }) => {
  return (
    <section className="relative w-full min-h-[600px] md:min-h-[80vh] flex items-center bg-gray-900 overflow-hidden pt-20">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/hero-bg.jpg')" }}
      />
      {/* Gradient Overlay for Text Readability (Left side dark, Right side clear for the meat) */}
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />
      {/* Subtle bottom gradient to ensure scrolling text isn't lost */}
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-black/50 to-transparent h-1/2 mt-auto" />

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full py-20">
        <div className="max-w-3xl flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-6 duration-1000">
          
          {/* Overline Tag */}
          <div className="inline-flex items-center gap-3">
            <span className="w-8 h-[2px] bg-[#e03131] shrink-0" />
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[#ffdad6] font-bold whitespace-nowrap">
              RESTAURANTE • BUFFET • CELEBRAÇÕES
            </span>
          </div>

          {/* Main Title with Playfair Display Editorial Twist */}
          <h1 className="text-white text-4xl sm:text-5xl lg:text-7xl font-normal leading-[1.1] tracking-tight font-editorial drop-shadow-lg">
            Boa comida.<br/>
            <span className="italic text-[#e03131] font-normal">Gente querida.</span><br />
            Um grande encontro.
          </h1>

          <p className="text-base sm:text-lg lg:text-xl text-gray-200 max-w-xl leading-relaxed font-light drop-shadow">
            Do aniversário em família ao dia do sim: encontre uma proposta de buffet para reunir quem faz parte da sua história.
          </p>

          {/* Badges & Action CTA */}
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button
              type="button"
              onClick={onScrollToPackages}
              className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-[#e03131] text-white font-bold text-sm uppercase tracking-wider shadow-[0_8px_24px_rgba(224,49,49,0.5)] hover:bg-[#bc121c] transition-all duration-300 transform hover:-translate-y-1 cursor-pointer active:scale-95 border border-[#e03131]"
            >
              <span>Escolher Pacote</span>
              <ArrowDown className="w-4 h-4 animate-bounce" />
            </button>

            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/10 backdrop-blur-md text-white border border-white/20">
              <Flame className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold tracking-wider uppercase">
                Ponto &amp; Brasa
              </span>
            </div>
          </div>

          {/* Trust Sub-badge */}
          <div className="pt-4 flex items-center gap-2.5 text-gray-300 text-sm font-medium">
            <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0" />
            <span>Atendimento sob medida com a tradição do churrasco brasileiro.</span>
          </div>
        </div>
      </div>
    </section>
  );
};
