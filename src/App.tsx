/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { PackagesCatalog } from './components/PackagesCatalog';
import { TransparencyConditions } from './components/TransparencyConditions';
import { HowItWorks } from './components/HowItWorks';
import { EventSimulator } from './components/EventSimulator';
import { ProductPage } from './components/ProductPage';
import { QuoteModal } from './components/QuoteModal';
import { Footer } from './components/Footer';
import { PACKAGES, PackageItem } from './data/packages';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { supabase } from './lib/supabase';

export default function App() {
  // Página individual de produto: quando definido, renderiza ProductPage
  const [viewingProduct, setViewingProduct] = useState<PackageItem | null>(null);

  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState<boolean>(false);
  const [currentRoute, setCurrentRoute] = useState<'home' | 'product' | 'admin-login' | 'admin'>('home');

  const [activeProposalDetails, setActiveProposalDetails] = useState<{
    packageCode: string;
    packageName: string;
    guests: number;
    estimatedTotal: string;
    extras: string[];
    termsConfirmed: boolean;
  } | null>(null);

  // Roteamento via hash — mantém links compartilháveis
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#produto/')) {
        const code = hash.replace('#produto/', '').toUpperCase();
        const found = PACKAGES.find((p) => p.code.toUpperCase() === code || p.id.toUpperCase() === code);
        if (found) {
          setCurrentRoute('product');
          setViewingProduct(found);
          return;
        }
      } else if (hash.startsWith('#paineladm/dashboard')) {
        setCurrentRoute('admin');
      } else if (hash.startsWith('#paineladm')) {
        setCurrentRoute('admin-login');
      } else if (
        !hash ||
        hash === '#' ||
        hash === '#home' ||
        hash === '#pacotes' ||
        hash === '#meu-evento' ||
        hash === '#como-funciona' ||
        hash === '#contato'
      ) {
        setCurrentRoute('home');
        setViewingProduct(null);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);

    // Controle de autenticação do painel admin
    supabase.auth.onAuthStateChange((_, session) => {
      if (session && window.location.hash === '#paineladm') {
        window.location.hash = '#paineladm/dashboard';
      } else if (!session && window.location.hash.startsWith('#paineladm/dashboard')) {
        window.location.hash = '#paineladm';
      }
    });

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigateHomeSection = (section: string) => {
    setCurrentRoute('home');
    setViewingProduct(null);
    if (!section || section === 'home') {
      try {
        window.history.pushState(null, '', window.location.pathname);
      } catch {
        window.location.hash = '';
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 50);
      return;
    }
    window.location.hash = section;
    setTimeout(() => {
      const el = document.getElementById(section);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 60);
  };

  const handleScrollToPackages = () => {
    handleNavigateHomeSection('pacotes');
  };

  const handleScrollToSimulator = () => {
    handleNavigateHomeSection('meu-evento');
  };

  // Navega para a página individual de um produto
  const handleOpenProductPage = (pkg: PackageItem) => {
    setCurrentRoute('product');
    setViewingProduct(pkg);
    window.location.hash = `produto/${pkg.code.toLowerCase()}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToHome = () => {
    setViewingProduct(null);
    setCurrentRoute('home');
    window.location.hash = 'pacotes';
    setTimeout(() => {
      const el = document.getElementById('pacotes');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 60);
  };

  const handleOpenGeneralQuote = () => {
    const defaultPkg = viewingProduct || PACKAGES[0];
    setActiveProposalDetails({
      packageCode: defaultPkg.code,
      packageName: defaultPkg.name,
      guests: defaultPkg.people,
      estimatedTotal: `R$ ${(defaultPkg.people * defaultPkg.perPerson).toLocaleString('pt-BR')}`,
      extras: [],
      termsConfirmed: false,
    });
    setIsQuoteModalOpen(true);
  };

  const isAdminRoute = currentRoute === 'admin-login' || currentRoute === 'admin';

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col selection:bg-[#e03131] selection:text-white">

      {/* Cabeçalho fixo — sem carrinho */}
      {!isAdminRoute && (
        <Header
          onOpenQuoteModal={handleOpenGeneralQuote}
          onNavigateHome={handleNavigateHomeSection}
        />
      )}

      <main className="w-full flex-1">
        {currentRoute === 'admin-login' ? (
          <AdminLogin onLoginSuccess={() => (window.location.hash = 'paineladm/dashboard')} />
        ) : currentRoute === 'admin' ? (
          <AdminDashboard onLogout={() => (window.location.hash = 'paineladm')} />
        ) : currentRoute === 'product' && viewingProduct ? (
          <ProductPage
            pkg={viewingProduct}
            onBack={handleBackToHome}
            onSelectOtherProduct={handleOpenProductPage}
          />
        ) : (
          <>
            {/* Seção Hero */}
            <Hero onScrollToPackages={handleScrollToPackages} />

            {/* Catálogo de Pacotes */}
            <PackagesCatalog
              onOpenDetails={handleOpenProductPage}
            />

            {/* Transparência & Escopo Comercial */}
            <TransparencyConditions />

            {/* Guia de 3 Etapas */}
            <HowItWorks
              onScrollToPackages={handleScrollToPackages}
              onOpenDirectContact={handleOpenGeneralQuote}
            />

            {/* Simulador de Evento */}
            <EventSimulator />
          </>
        )}
      </main>

      {/* Rodapé institucional */}
      {!isAdminRoute && <Footer onOpenQuoteModal={handleOpenGeneralQuote} />}

      {/* Modal de Orçamento / WhatsApp */}
      {!isAdminRoute && (
        <QuoteModal
          isOpen={isQuoteModalOpen}
          onClose={() => setIsQuoteModalOpen(false)}
          proposalDetails={activeProposalDetails}
        />
      )}
    </div>
  );
}
