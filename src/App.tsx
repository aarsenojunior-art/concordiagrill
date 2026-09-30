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
import { GatewayModal } from './components/GatewayModal';
import { CartDrawer, CartItem } from './components/CartDrawer';
import { Footer } from './components/Footer';
import { PACKAGES, PackageItem } from './data/packages';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { supabase } from './lib/supabase';

export default function App() {
  const [selectedPackageId, setSelectedPackageId] = useState<string>('CG03');
  
  // Individual page navigation: when set, renders individual ProductPage instead of modal/popup!
  const [viewingProduct, setViewingProduct] = useState<PackageItem | null>(null);

  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState<boolean>(false);
  const [isGatewayModalOpen, setIsGatewayModalOpen] = useState<boolean>(false);
  
  // Cart state
  const [cartItem, setCartItem] = useState<CartItem | null>(null);
  const [termsConfirmed, setTermsConfirmed] = useState<boolean>(false);
  const [currentRoute, setCurrentRoute] = useState<'home' | 'product' | 'cart' | 'checkout' | 'admin-login' | 'admin'>('home');

  const [activeProposalDetails, setActiveProposalDetails] = useState<{
    packageCode: string;
    packageName: string;
    guests: number;
    estimatedTotal: string;
    extras: string[];
    termsConfirmed: boolean;
  } | null>(null);

  // Sync hash routing so back button works and links are shareable
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#produto/')) {
        const code = hash.replace('#produto/', '').toUpperCase();
        const found = PACKAGES.find((p) => p.code.toUpperCase() === code || p.id.toUpperCase() === code);
        if (found) {
          setViewingProduct(found);
          return;
        }
      } else if (hash.startsWith('#carrinho')) {
        setCurrentRoute('cart');
      } else if (hash.startsWith('#checkout')) {
        setCurrentRoute('checkout');
      } else if (hash.startsWith('#admin/login')) {
        setCurrentRoute('admin-login');
      } else if (hash.startsWith('#admin')) {
        setCurrentRoute('admin');
      } else if (!hash || hash === '#' || hash === '#home' || hash === '#pacotes' || hash === '#meu-evento' || hash === '#como-funciona' || hash === '#contato') {
        setCurrentRoute('home');
        setViewingProduct(null);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    
    // Check auth state
    supabase.auth.onAuthStateChange((event, session) => {
      if (session && window.location.hash.startsWith('#admin/login')) {
        window.location.hash = '#admin';
      } else if (!session && window.location.hash.startsWith('#admin') && window.location.hash !== '#admin/login') {
        window.location.hash = '#admin/login';
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

  // Navigates directly to INDIVIDUAL PRODUCT PAGE (No popup!)
  const handleOpenProductPage = (pkg: PackageItem) => {
    setCurrentRoute('product');
    setViewingProduct(pkg);
    window.location.hash = `produto/${pkg.code.toLowerCase()}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToHome = () => {
    setViewingProduct(null);
    window.location.hash = 'pacotes';
    setTimeout(() => {
      const el = document.getElementById('pacotes');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 60);
  };

  // Add package to cart and open drawer
  const handleAddToCart = (pkg: PackageItem, customGuests?: number) => {
    setSelectedPackageId(pkg.id);
    setCartItem({
      pkg,
      guests: customGuests && customGuests > 0 ? customGuests : pkg.people,
      selectedExtras: [],
    });
    window.location.hash = 'carrinho';
  };

  const handleOpenCartWithPkg = (pkgId: string) => {
    const found = PACKAGES.find((p) => p.id === pkgId) || PACKAGES[2];
    setSelectedPackageId(found.id);
    if (!cartItem || cartItem.pkg.id !== found.id) {
      setCartItem({
        pkg: found,
        guests: found.people,
        selectedExtras: [],
      });
    }
    window.location.hash = 'carrinho';
  };

  const handleUpdateCartGuests = (guests: number) => {
    if (!cartItem) return;
    setCartItem({
      ...cartItem,
      guests,
    });
  };

  const handleToggleCartExtra = (extraId: string) => {
    if (!cartItem) return;
    const exists = cartItem.selectedExtras.includes(extraId);
    setCartItem({
      ...cartItem,
      selectedExtras: exists
        ? cartItem.selectedExtras.filter((id) => id !== extraId)
        : [...cartItem.selectedExtras, extraId],
    });
  };

  const handleOpenProposalDirectValidation = (details: {
    packageCode: string;
    packageName: string;
    guests: number;
    estimatedTotal: string;
    extras: string[];
    termsConfirmed: boolean;
  }) => {
    setActiveProposalDetails(details);
    setIsQuoteModalOpen(true);
  };

  const handleOpenGeneralQuote = () => {
    const defaultPkg = viewingProduct || PACKAGES.find((p) => p.id === selectedPackageId) || PACKAGES[2];
    setActiveProposalDetails({
      packageCode: defaultPkg.code,
      packageName: defaultPkg.name,
      guests: defaultPkg.people,
      estimatedTotal: `R$ ${defaultPkg.totalPrice.toLocaleString('pt-BR')}`,
      extras: [],
      termsConfirmed: false,
    });
    setIsQuoteModalOpen(true);
  };

  const isAdminRoute = currentRoute === 'admin-login' || currentRoute === 'admin';

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col selection:bg-[#e03131] selection:text-white">
      {/* Fixed Sticky Header with Notice Banner and Cart Trigger */}
      {!isAdminRoute && (
        <Header
          onOpenQuoteModal={handleOpenGeneralQuote}
          onSelectPackageNav={handleScrollToSimulator}
          onOpenCart={() => window.location.hash = 'carrinho'}
          cartCount={cartItem ? 1 : 0}
          onNavigateHome={handleNavigateHomeSection}
        />
      )}

      <main className="w-full flex-1">
        {currentRoute === 'admin-login' ? (
          <AdminLogin onLoginSuccess={() => window.location.hash = 'admin'} />
        ) : currentRoute === 'admin' ? (
          <AdminDashboard onLogout={() => window.location.hash = 'admin/login'} />
        ) : currentRoute === 'cart' ? (
          <CartDrawer
            isOpen={true}
            onClose={() => window.location.hash = 'pacotes'}
            cartItem={cartItem}
            onUpdateGuests={handleUpdateCartGuests}
            onToggleExtra={handleToggleCartExtra}
            onRemoveItem={() => setCartItem(null)}
            onOpenDirectValidation={handleOpenProposalDirectValidation}
            onOpenGatewayModal={() => window.location.hash = 'checkout'}
            termsConfirmed={termsConfirmed}
            setTermsConfirmed={setTermsConfirmed}
          />
        ) : currentRoute === 'checkout' ? (
          <GatewayModal
            isOpen={true}
            cartItem={cartItem}
            onClose={() => window.location.hash = 'carrinho'}
            onOpenDirectContact={() => {
              handleOpenGeneralQuote();
            }}
          />
        ) : currentRoute === 'product' && viewingProduct ? (
          <ProductPage
            pkg={viewingProduct}
            onBack={handleBackToHome}
            onSelectOtherProduct={handleOpenProductPage}
            onAddToCart={handleAddToCart}
            onOpenDirectValidation={handleOpenProposalDirectValidation}
          />
        ) : (
          <>
            {/* Hero Section */}
            <Hero onScrollToPackages={handleScrollToPackages} />

            {/* Packages Catalog */}
            <PackagesCatalog
              selectedPackageId={selectedPackageId}
              onSelectPackage={(id) => {
                setSelectedPackageId(id);
                handleScrollToSimulator();
              }}
              onOpenDetails={handleOpenProductPage}
              onAddToCart={handleAddToCart}
            />

            {/* Transparency & Commercial Scope */}
            <TransparencyConditions />

            {/* 3 Steps Guide */}
            <HowItWorks
              onScrollToPackages={handleScrollToPackages}
              onOpenDirectContact={handleOpenGeneralQuote}
              onOpenGatewayInfo={() => window.location.hash = 'checkout'}
            />
          </>
        )}
      </main>

      {/* Institutional Footer */}
      {!isAdminRoute && <Footer onOpenQuoteModal={handleOpenGeneralQuote} />}

      {/* Direct Quote / WhatsApp Alignment Modal */}
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
