import React from 'react';
import { MapPin, Phone, Mail, ChevronRight, ShieldCheck } from 'lucide-react';

interface FooterProps {
  onOpenQuoteModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenQuoteModal }) => {
  return (
    <footer id="contato" className="w-full bg-gray-100 text-gray-600 mt-20 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* 4 Columns Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 items-start">
          
          {/* Coluna 1: Marca & Apresentação */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <img
                alt="Logo Concórdia Grill"
                className="h-9 w-auto object-contain"
                src="/logo.png"
              />
            </div>
            
            <p className="text-sm text-gray-600 leading-relaxed">
              Concórdia Grill — Restaurante &amp; Buffet especializado em cortes nobres na brasa e estrutura gastronômica completa para aniversários, confraternizações e casamentos.
            </p>

            <div className="flex items-center gap-2 text-xs text-gray-500 pt-1">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Qualidade e excelência em celebrações.</span>
            </div>
          </div>

          {/* Coluna 2: Navegação */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 font-sans">
              Navegação
            </h3>
            <ul className="flex flex-col gap-2.5 text-xs">
              <li>
                <a
                  href="#pacotes"
                  className="flex items-center gap-1.5 text-gray-600 hover:text-red-600 transition-colors group"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-red-600 transition-colors" />
                  <span>Nossos pacotes</span>
                </a>
              </li>
              <li>
                <a
                  href="#como-funciona"
                  className="flex items-center gap-1.5 text-gray-600 hover:text-red-600 transition-colors group"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-red-600 transition-colors" />
                  <span>Como funciona</span>
                </a>
              </li>
              <li>
                <a
                  href="#meu-evento"
                  className="flex items-center gap-1.5 text-gray-600 hover:text-red-600 transition-colors group"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-red-600 transition-colors" />
                  <span>Meu evento</span>
                </a>
              </li>
              <li>
                <a
                  href="#contato"
                  className="flex items-center gap-1.5 text-gray-600 hover:text-red-600 transition-colors group"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-red-600 transition-colors" />
                  <span>Fale conosco</span>
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenQuoteModal}
                  className="flex items-center gap-1.5 text-amber-600 hover:text-amber-700 transition-colors text-left font-semibold cursor-pointer group"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-amber-500 group-hover:translate-x-0.5 transition-transform" />
                  <span>Solicitar Orçamento</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Coluna 3: Links Úteis / Transparência */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 font-sans">
              Links Úteis
            </h3>
            <ul className="flex flex-col gap-2.5 text-xs">
              <li>
                <a
                  href="#como-funciona"
                  className="flex items-center gap-1.5 text-gray-600 hover:text-red-600 transition-colors group"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-red-600 transition-colors" />
                  <span>Condições do Buffet</span>
                </a>
              </li>
              <li>
                <a
                  href="#meu-evento"
                  className="flex items-center gap-1.5 text-gray-600 hover:text-red-600 transition-colors group"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-red-600 transition-colors" />
                  <span>Dimensionamento por Pessoa</span>
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenQuoteModal}
                  className="flex items-center gap-1.5 text-gray-600 hover:text-red-600 transition-colors text-left group cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-red-600 transition-colors" />
                  <span>Validação Direta de Agenda</span>
                </button>
              </li>
              <li>
                <a
                  href="#carrinho"
                  className="flex items-center gap-1.5 text-gray-600 hover:text-red-600 transition-colors group"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-red-600 transition-colors" />
                  <span>Resumo do Pedido</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Coluna 4: Contato */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 font-sans">
              Contato
            </h3>
            <div className="flex flex-col gap-3.5 text-xs">
              {/* E-mail */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-blue-600 shrink-0 shadow-xs">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="flex flex-col pt-0.5">
                  <span className="text-[11px] text-gray-400 font-medium">E-mail</span>
                  <a
                    href="mailto:contato@churrascariaconcordiagrill.com.br"
                    className="font-semibold text-gray-900 hover:text-red-600 transition-colors break-all"
                  >
                    contato@churrascariaconcordiagrill.com.br
                  </a>
                </div>
              </div>

              {/* Endereço */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-red-600 shrink-0 shadow-xs">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="flex flex-col pt-0.5">
                  <span className="text-[11px] text-gray-400 font-medium">Endereço</span>
                  <span className="text-gray-700 leading-snug">
                    Rua 23 de Setembro, nº 29, Centro Norte, Várzea Grande – MT, CEP 78110-380, Brasil.
                  </span>
                </div>
              </div>

              {/* Telefone */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-amber-600 shrink-0 shadow-xs">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="flex flex-col pt-0.5">
                  <span className="text-[11px] text-gray-400 font-medium">Telefone</span>
                  <a
                    href="tel:+5547999012867"
                    className="font-bold text-gray-900 hover:text-red-600 transition-colors"
                  >
                    (47) 99901-2867
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p className="text-center sm:text-left">
            © 2025 Concórdia Grill • Restaurante &amp; Buffet. Todos os direitos reservados.
          </p>
          <p className="text-center sm:text-right">
            Estrutura gastronômica completa para celebrações inesquecíveis.
          </p>
        </div>

      </div>
    </footer>
  );
};
