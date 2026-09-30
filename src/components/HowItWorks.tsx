import React from 'react';
import { Sparkles, MessageSquare, ExternalLink, ArrowUp } from 'lucide-react';

interface HowItWorksProps {
  onScrollToPackages: () => void;
  onOpenDirectContact: () => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({
  onScrollToPackages,
  onOpenDirectContact,
}) => {
  return (
    <section className="w-full py-16 bg-white border-y border-gray-200" id="como-funciona">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-10">

        {/* Cabeçalho da seção */}
        <div className="flex flex-col gap-2 max-w-xl">
          <span className="text-xs text-red-600 uppercase tracking-widest font-bold">
            Fluxo Transparente
          </span>
          <h2 className="text-3xl sm:text-4xl text-gray-900 font-editorial font-normal">
            Como funciona a contratação
          </h2>
          <p className="text-sm text-gray-600">
            Três etapas simples e diretas para organizar seu buffet com tranquilidade.
          </p>
        </div>

        {/* 3 Cards de Etapa */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Etapa 1 */}
          <div className="bg-gray-50 p-6 rounded-none flex flex-col gap-4 shadow-lg border border-gray-200 hover:border-gray-300 transition-colors relative overflow-hidden group">
            <div className="w-12 h-12 rounded-none bg-[#e03131]/20 border border-[#e03131]/40 flex items-center justify-center text-red-600 font-syne text-xl font-bold">
              01
            </div>

            <div className="flex flex-col gap-1.5">
              <h3 className="text-lg font-bold font-syne text-gray-900">
                Escolha o pacote ideal
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Navegue pelas opções de cardápio criadas para aniversários, 15 anos, confraternizações empresariais ou casamentos. Clique em qualquer pacote para ver todos os detalhes.
              </p>
            </div>

            <div className="mt-auto pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onScrollToPackages}
                className="flex items-center gap-1.5 text-red-600 hover:text-gray-900 text-xs uppercase tracking-wider font-semibold group-hover:translate-x-0.5 transition-all cursor-pointer"
              >
                <span>Explorar os pacotes</span>
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Etapa 2 */}
          <div className="bg-gray-50 p-6 rounded-none flex flex-col gap-4 shadow-lg border border-gray-200 hover:border-gray-300 transition-colors relative overflow-hidden group">
            <div className="w-12 h-12 rounded-none bg-[#2d3448] border border-[#3b455c] flex items-center justify-center text-amber-600 font-syne text-xl font-bold">
              02
            </div>

            <div className="flex flex-col gap-1.5">
              <h3 className="text-lg font-bold font-syne text-gray-900">
                Escolha a quantidade e compre
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Na página do pacote, selecione o número de pessoas (10, 200, 500, 1.000 ou outro), veja o valor correspondente, confirme as condições e clique em <strong>IR PARA O PAGAMENTO</strong>.
              </p>
            </div>

            <div className="mt-auto pt-4 border-t border-gray-200">
              <div className="flex items-center gap-1.5 text-amber-600 text-xs uppercase tracking-wider font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Simples e direto</span>
              </div>
            </div>
          </div>

          {/* Etapa 3 */}
          <div className="bg-gray-50 p-6 rounded-none flex flex-col gap-4 shadow-lg border border-gray-200 hover:border-gray-300 transition-colors relative overflow-hidden group">
            <div className="w-12 h-12 rounded-none bg-[#2d3448] border border-[#3b455c] flex items-center justify-center text-gray-600 font-syne text-xl font-bold">
              03
            </div>

            <div className="flex flex-col gap-1.5">
              <h3 className="text-lg font-bold font-syne text-gray-900">
                Confirme com nossa equipe
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Após a compra, nossa equipe entrará em contato para alinhar data, local e detalhes finais do evento. Disponibilidade e detalhes são confirmados diretamente com o restaurante.
              </p>
            </div>

            <div className="mt-auto pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onOpenDirectContact}
                className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 text-xs uppercase tracking-wider font-semibold group-hover:translate-x-0.5 transition-all cursor-pointer"
              >
                <span>Falar com a equipe</span>
                <MessageSquare className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
