import React from 'react';
import { Sparkles, MessageSquare, Lock, ArrowUp } from 'lucide-react';

interface HowItWorksProps {
  onScrollToPackages: () => void;
  onOpenDirectContact: () => void;
  onOpenGatewayInfo: () => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({
  onScrollToPackages,
  onOpenDirectContact,
  onOpenGatewayInfo,
}) => {
  return (
    <section className="w-full py-16 bg-white border-y border-gray-200" id="como-funciona">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-10">
        
        {/* Section Header */}
        <div className="flex flex-col gap-2 max-w-xl">
          <span className="text-xs text-red-600 uppercase tracking-widest font-bold">
            Fluxo Transparente
          </span>
          <h2 className="text-3xl sm:text-4xl text-gray-900 font-editorial font-normal">
            Como funciona a contratação
          </h2>
          <p className="text-sm text-gray-600">
            Três etapas claras e seguras para organizar seu buffet com precisão e tranquilidade.
          </p>
        </div>

        {/* 3 Step Cards - Rectangular styling */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Step 1 */}
          <div className="bg-gray-50 p-6 rounded-none flex flex-col gap-4 shadow-lg border border-gray-200 hover:border-gray-200 transition-colors relative overflow-hidden group">
            <div className="w-12 h-12 rounded-none bg-[#e03131]/20 border border-[#e03131]/40 flex items-center justify-center text-red-600 font-syne text-xl font-bold">
              01
            </div>
            
            <div className="flex flex-col gap-1.5">
              <h3 className="text-lg font-bold font-syne text-gray-900">
                Escolha o pacote ideal
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Navegue pelas 8 opções de cardápio criadas para aniversários, 15 anos, confraternizações empresariais ou casamentos e clique para ver os detalhes do produto.
              </p>
            </div>

            <div className="mt-auto pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onScrollToPackages}
                className="flex items-center gap-1.5 text-red-600 hover:text-gray-900 text-xs uppercase tracking-wider font-semibold group-hover:translate-x-0.5 transition-all cursor-pointer"
              >
                <span>Explore os pacotes acima</span>
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-gray-50 p-6 rounded-none flex flex-col gap-4 shadow-lg border border-gray-200 hover:border-gray-200 transition-colors relative overflow-hidden group">
            <div className="w-12 h-12 rounded-none bg-[#2d3448] border border-[#3b455c] flex items-center justify-center text-amber-600 font-syne text-xl font-bold">
              02
            </div>
            
            <div className="flex flex-col gap-1.5">
              <h3 className="text-lg font-bold font-syne text-gray-900">
                Confirme data e condições
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Entre em contato direto com nossa equipe para alinhar disponibilidade de agenda, local do evento, horários e detalhes dos cortes bovinos.
              </p>
            </div>

            <div className="mt-auto pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onOpenDirectContact}
                className="flex items-center gap-1.5 text-amber-600 hover:text-[#ffe088] text-xs uppercase tracking-wider font-semibold group-hover:translate-x-0.5 transition-all cursor-pointer"
              >
                <span>Alinhamento direto</span>
                <MessageSquare className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-gray-50 p-6 rounded-none flex flex-col gap-4 shadow-lg border border-gray-200 hover:border-gray-200 transition-colors relative overflow-hidden group">
            <div className="w-12 h-12 rounded-none bg-[#2d3448] border border-[#3b455c] flex items-center justify-center text-gray-600 font-syne text-xl font-bold">
              03
            </div>
            
            <div className="flex flex-col gap-1.5">
              <h3 className="text-lg font-bold font-syne text-gray-900">
                Finalize com Pagar.me
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Com a proposta comercial validada junto ao restaurante, o pagamento poderá ser feito de forma rápida e segura quando a funcionalidade for ativada.
              </p>
            </div>

            <div className="mt-auto pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onOpenGatewayInfo}
                className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 text-xs uppercase tracking-wider font-semibold group-hover:translate-x-0.5 transition-all cursor-pointer"
              >
                <span>Gateway Seguro</span>
                <Lock className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
