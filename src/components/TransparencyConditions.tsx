import React from 'react';
import { Scale, UtensilsCrossed, Ban, Users, ShieldAlert } from 'lucide-react';

export const TransparencyConditions: React.FC = () => {
  return (
    <section className="w-full py-16 bg-gray-100 border-y border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-100 rounded-none p-6 sm:p-8 lg:p-10 shadow-2xl relative overflow-hidden border border-gray-200">
          
          {/* Subtle Ambient Glow */}
          <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-[#e03131]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start relative z-10">
            
            {/* Left Header Column */}
            <div className="lg:col-span-4 flex flex-col gap-3">
              <div className="inline-flex items-center gap-2 text-amber-600 text-xs uppercase tracking-wider font-bold">
                <Scale className="w-4 h-4" />
                <span>Transparência Comercial</span>
              </div>
              <h3 className="text-2xl sm:text-3xl text-gray-900 font-editorial font-normal">
                Condições Claras &amp; Escopo dos Pacotes
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Tratamos celebrações com a seriedade e o respeito que cada momento merece. Conheça as diretrizes de atendimento antes de formalizar sua proposta.
              </p>
            </div>

            {/* Right 4 Grid Cards - Rectangular styling */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Item 1 */}
              <div className="p-4 rounded-none bg-gray-50 border border-gray-200 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-red-600 font-bold text-xs uppercase tracking-wider">
                  <UtensilsCrossed className="w-4 h-4 text-[#e03131]" />
                  <span>Escopo Proposto</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Alimentos selecionados, preparo e equipe especializada para o serviço de buffet pelo período de 4 horas de duração.
                </p>
              </div>

              {/* Item 2 */}
              <div className="p-4 rounded-none bg-gray-50 border border-gray-200 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-wider">
                  <Ban className="w-4 h-4 text-amber-600" />
                  <span>Não Incluído nos Valores</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Bebidas, locação de espaço físico, decoração, bolo e doces de festa, sonorização/música, mobiliário, louças e talheres especiais, transporte fora da área base e horas adicionais.
                </p>
              </div>

              {/* Item 3 */}
              <div className="p-4 rounded-none bg-gray-50 border border-gray-200 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-[#ffdad6] font-bold text-xs uppercase tracking-wider">
                  <Users className="w-4 h-4 text-red-600" />
                  <span>Capacidade Técnica</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Atendemos eventos de 50 a 250 convidados (ou a partir de 30 convidados sob consulta prévia).
                </p>
              </div>

              {/* Item 4 */}
              <div className="p-4 rounded-none bg-gray-50 border border-gray-200 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-[#ffe088] font-bold text-xs uppercase tracking-wider">
                  <ShieldAlert className="w-4 h-4 text-[#af8d11]" />
                  <span>Disponibilidade &amp; Pagamentos</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Valores válidos mediante confirmação de data. Checkout online temporariamente suspenso para garantir alinhamento prévio da agenda do restaurante.
                </p>
              </div>

            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
