import React, { useState } from 'react';
import { Menu, X, User, Flame } from 'lucide-react';

interface HeaderProps {
  onOpenQuoteModal: () => void;
  onNavigateHome?: (hash: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenQuoteModal,
  onNavigateHome,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [conciergeOpen, setConciergeOpen] = useState(false);

  const handleNavClick = (e: React.MouseEvent, hash: string) => {
    if (onNavigateHome) {
      e.preventDefault();
      onNavigateHome(hash);
    }
  };

  return (
    <div className="fixed top-0 inset-x-0 z-50 flex flex-col">

      {/* Barra de Navegação Principal */}
      <header className="w-full bg-white/90 backdrop-blur-xl border-b border-gray-200/80 transition-colors duration-300">
        <div className="h-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <a
              href="#"
              onClick={(e) => handleNavClick(e, '')}
              aria-label="Concórdia Grill Início"
              className="flex items-center gap-3 group focus:outline-none cursor-pointer"
            >
              <img
                alt="Logo Concórdia Grill"
                className="h-9 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                src="/logo.png"
              />
            </a>
          </div>

          {/* Navegação Desktop */}
          <nav className="hidden md:flex items-center gap-8 lg:gap-10">
            <a
              href="#"
              onClick={(e) => handleNavClick(e, '')}
              className="text-gray-900 hover:text-red-600 font-semibold text-sm transition-colors duration-200 cursor-pointer"
            >
              Home
            </a>
            <a
              href="#pacotes"
              onClick={(e) => handleNavClick(e, 'pacotes')}
              className="text-gray-600 hover:text-red-600 font-semibold text-sm transition-colors duration-200 cursor-pointer"
            >
              Nossos pacotes
            </a>
            <a
              href="#como-funciona"
              onClick={(e) => handleNavClick(e, 'como-funciona')}
              className="text-gray-600 hover:text-red-600 font-semibold text-sm transition-colors duration-200 cursor-pointer"
            >
              Como funciona
            </a>
            <a
              href="#meu-evento"
              onClick={(e) => handleNavClick(e, 'meu-evento')}
              className="text-gray-600 hover:text-red-600 font-semibold text-sm transition-colors duration-200 cursor-pointer"
            >
              Meu evento
            </a>
            <a
              href="#contato"
              onClick={(e) => handleNavClick(e, 'contato')}
              className="text-gray-600 hover:text-red-600 font-semibold text-sm transition-colors duration-200 cursor-pointer"
            >
              Contato
            </a>
          </nav>

          {/* CTAs do Cabeçalho */}
          <div className="flex items-center gap-2.5 sm:gap-3">

            {/* Botão de Atendimento / Concierge */}
            <div className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => setConciergeOpen(!conciergeOpen)}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-red-600 flex items-center justify-center transition-colors cursor-pointer"
                title="Atendimento & Concórdia VIP"
                aria-label="Atendimento & Concórdia VIP"
              >
                <User className="w-4 h-4" />
              </button>

              {conciergeOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-gray-50 border border-gray-200 rounded-2xl shadow-2xl p-4 text-xs z-50">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                    <div className="w-7 h-7 rounded-full bg-[#af8d11]/20 flex items-center justify-center text-amber-600">
                      <Flame className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">Concórdia Eventos</p>
                      <p className="text-[11px] text-gray-600">Plantão Comercial &amp; Buffet</p>
                    </div>
                  </div>
                  <div className="py-2.5 space-y-1.5 text-gray-600">
                    <p className="text-gray-900 font-medium">Horário de Atendimento:</p>
                    <p>Segunda a Sábado, das 09h às 21h</p>
                    <p className="text-gray-700 pt-1">Rua 23 de Setembro, 29</p>
                  </div>
                  <button
                    onClick={() => {
                      setConciergeOpen(false);
                      onOpenQuoteModal();
                    }}
                    className="w-full mt-1 py-2 px-3 rounded-full bg-[#e03131] text-white font-semibold text-center hover:bg-[#bc121c] transition-colors cursor-pointer"
                  >
                    Iniciar Validação de Data
                  </button>
                </div>
              )}
            </div>

            {/* Botão Hamburguer Mobile */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-full text-gray-900 hover:bg-gray-50 cursor-pointer"
              aria-label="Abrir menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Menu Mobile */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white px-4 py-4 space-y-3">
            <a
              href="#"
              onClick={(e) => {
                setMobileMenuOpen(false);
                handleNavClick(e, '');
              }}
              className="block py-2 text-gray-900 hover:text-red-600 font-semibold text-sm cursor-pointer"
            >
              Home
            </a>
            <a
              href="#pacotes"
              onClick={(e) => {
                setMobileMenuOpen(false);
                handleNavClick(e, 'pacotes');
              }}
              className="block py-2 text-gray-600 hover:text-red-600 font-semibold text-sm cursor-pointer"
            >
              Nossos pacotes
            </a>
            <a
              href="#como-funciona"
              onClick={(e) => {
                setMobileMenuOpen(false);
                handleNavClick(e, 'como-funciona');
              }}
              className="block py-2 text-gray-600 hover:text-red-600 font-medium text-sm cursor-pointer"
            >
              Como funciona
            </a>
            <a
              href="#meu-evento"
              onClick={(e) => {
                setMobileMenuOpen(false);
                handleNavClick(e, 'meu-evento');
              }}
              className="block py-2 text-gray-600 hover:text-red-600 font-medium text-sm cursor-pointer"
            >
              Meu evento
            </a>
            <a
              href="#contato"
              onClick={(e) => {
                setMobileMenuOpen(false);
                handleNavClick(e, 'contato');
              }}
              className="block py-2 text-gray-600 hover:text-red-600 font-medium text-sm cursor-pointer"
            >
              Contato
            </a>
          </div>
        )}
      </header>
    </div>
  );
};
