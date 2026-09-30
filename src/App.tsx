import React, { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { PackagesCatalog } from './components/PackagesCatalog';
import { TransparencyConditions } from './components/TransparencyConditions';
import { HowItWorks } from './components/HowItWorks';
import { EventSelection, EventSimulator } from './components/EventSimulator';
import { ProductPage } from './components/ProductPage';
import { QuoteModal } from './components/QuoteModal';
import { GatewayModal } from './components/GatewayModal';
import { Footer } from './components/Footer';
import { applyPackagePrices, PACKAGES, PackageItem, PackagePriceRecord } from './data/packages';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { supabase } from './lib/supabase';

type Route = 'home' | 'product' | 'checkout' | 'admin-login' | 'admin';

export default function App() {
  const [packages, setPackages] = useState<PackageItem[]>(PACKAGES);
  const [viewingProduct, setViewingProduct] = useState<PackageItem | null>(null);
  const [checkoutSelection, setCheckoutSelection] = useState<{ pkg: PackageItem; guests: number } | null>(null);
  const [eventSelection, setEventSelection] = useState<EventSelection>({ packageCode: 'CG03', guests: 50 });
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [currentRoute, setCurrentRoute] = useState<Route>('home');
  const [activeProposalDetails, setActiveProposalDetails] = useState<{
    packageCode: string; packageName: string; guests: number; estimatedTotal: string; extras: string[]; termsConfirmed: boolean;
  } | null>(null);

  useEffect(() => {
    fetch('/api/package-prices')
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('pricing unavailable')))
      .then((records: PackagePriceRecord[]) => setPackages(applyPackagePrices(PACKAGES, records)))
      .catch(() => setPackages(PACKAGES));
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#produto/')) {
        const code = hash.replace('#produto/', '').toUpperCase();
        const found = packages.find((pkg) => pkg.code === code);
        if (found) { setViewingProduct(found); setCurrentRoute('product'); }
      } else if (hash.startsWith('#checkout') && checkoutSelection) {
        setCurrentRoute('checkout');
      } else if (hash.startsWith('#paineladm/dashboard')) {
        setCurrentRoute('admin');
      } else if (hash.startsWith('#paineladm')) {
        setCurrentRoute('admin-login');
      } else {
        setCurrentRoute('home');
        setViewingProduct(null);
      }
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      if (session && window.location.hash === '#paineladm') window.location.hash = 'paineladm/dashboard';
      else if (!session && window.location.hash.startsWith('#paineladm/dashboard')) window.location.hash = 'paineladm';
    });
    return () => { window.removeEventListener('hashchange', handleHashChange); authListener.subscription.unsubscribe(); };
  }, [checkoutSelection, packages]);

  const navigateHome = (section: string) => {
    setCurrentRoute('home'); setViewingProduct(null); window.location.hash = section;
    setTimeout(() => document.getElementById(section || 'home')?.scrollIntoView({ behavior: 'smooth' }), 60);
    if (!section) window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openProduct = (pkg: PackageItem) => {
    setViewingProduct(pkg); setCurrentRoute('product'); window.location.hash = `produto/${pkg.code.toLowerCase()}`; window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const selectForEvent = (pkg: PackageItem, guests: number) => {
    setEventSelection({ packageCode: pkg.code, guests });
    navigateHome('meu-evento');
  };

  const openCheckout = (pkg: PackageItem, guests: number) => {
    setCheckoutSelection({ pkg, guests }); setCurrentRoute('checkout'); window.location.hash = 'checkout'; window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openQuote = () => {
    const pkg = viewingProduct ?? packages[0];
    const option = pkg.purchaseOptions[0];
    setActiveProposalDetails({ packageCode: pkg.code, packageName: pkg.name, guests: option.guests, estimatedTotal: option.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), extras: [], termsConfirmed: false });
    setIsQuoteModalOpen(true);
  };

  const isAdminRoute = currentRoute === 'admin-login' || currentRoute === 'admin';

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col selection:bg-[#e03131] selection:text-white">
      {!isAdminRoute && <Header onOpenQuoteModal={openQuote} onNavigateHome={navigateHome} />}
      <main className="w-full flex-1">
        {currentRoute === 'admin-login' ? <AdminLogin onLoginSuccess={() => { window.location.hash = 'paineladm/dashboard'; }} />
          : currentRoute === 'admin' ? <AdminDashboard onLogout={() => { window.location.hash = 'paineladm'; }} />
          : currentRoute === 'checkout' && checkoutSelection ? <GatewayModal pkg={checkoutSelection.pkg} guests={checkoutSelection.guests} onClose={() => navigateHome('meu-evento')} />
          : currentRoute === 'product' && viewingProduct ? <ProductPage pkg={viewingProduct} onBack={() => navigateHome('pacotes')} onSelectOtherProduct={openProduct} onCheckout={openCheckout} />
          : <>
              <Hero onScrollToPackages={() => navigateHome('pacotes')} />
              <PackagesCatalog packages={packages} onOpenDetails={openProduct} onSelectOption={selectForEvent} />
              <TransparencyConditions />
              <HowItWorks onScrollToPackages={() => navigateHome('pacotes')} onOpenDirectContact={openQuote} />
              <EventSimulator packages={packages} initialSelection={eventSelection} onCheckout={openCheckout} />
            </>}
      </main>
      {!isAdminRoute && <Footer onOpenQuoteModal={openQuote} />}
      {!isAdminRoute && <QuoteModal isOpen={isQuoteModalOpen} onClose={() => setIsQuoteModalOpen(false)} proposalDetails={activeProposalDetails} />}
    </div>
  );
}
