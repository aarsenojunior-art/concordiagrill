import React, { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { PackagesCatalog } from './components/PackagesCatalog';
import { TransparencyConditions } from './components/TransparencyConditions';
import { HowItWorks } from './components/HowItWorks';
import { EventSelection, EventSimulator } from './components/EventSimulator';
import { ProductPage } from './components/ProductPage';
import { QuoteModal } from './components/QuoteModal';
import { Footer } from './components/Footer';
import { PACKAGES, PackageItem } from './data/packages';
import { getExternalPaymentUrl } from '../packages.config.js';

type Route = 'home' | 'product';

export default function App() {
  const packages = PACKAGES;
  const [viewingProduct, setViewingProduct] = useState<PackageItem | null>(null);
  const [eventSelection, setEventSelection] = useState<EventSelection>({ packageCode: 'CG03', guests: 50 });
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [currentRoute, setCurrentRoute] = useState<Route>('home');
  const [activeProposalDetails, setActiveProposalDetails] = useState<{
    packageCode: string; packageName: string; guests: number; estimatedTotal: string; extras: string[]; termsConfirmed: boolean;
  } | null>(null);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#produto/')) {
        const code = hash.replace('#produto/', '').toUpperCase();
        const found = packages.find((pkg) => pkg.code === code);
        if (found) { setViewingProduct(found); setCurrentRoute('product'); }
      } else {
        setCurrentRoute('home');
        setViewingProduct(null);
      }
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => { window.removeEventListener('hashchange', handleHashChange); };
  }, [packages]);

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

  const handleExternalPayment = (pkg: PackageItem, guests: number) => {
    const externalUrl = getExternalPaymentUrl(pkg.code, guests);
    window.location.assign(externalUrl);
  };

  const openQuote = () => {
    const pkg = viewingProduct ?? packages[0];
    const option = pkg.purchaseOptions[0];
    setActiveProposalDetails({ packageCode: pkg.code, packageName: pkg.name, guests: option.guests, estimatedTotal: option.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), extras: [], termsConfirmed: false });
    setIsQuoteModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col selection:bg-[#e03131] selection:text-white">
      <Header onOpenQuoteModal={openQuote} onNavigateHome={navigateHome} />
      <main className="w-full flex-1">
        {currentRoute === 'product' && viewingProduct ? (
          <ProductPage pkg={viewingProduct} onBack={() => navigateHome('pacotes')} onSelectOtherProduct={openProduct} onPayment={handleExternalPayment} />
        ) : (
          <>
            <Hero onScrollToPackages={() => navigateHome('pacotes')} />
            <PackagesCatalog packages={packages} onOpenDetails={openProduct} onSelectOption={selectForEvent} onPayment={handleExternalPayment} />
            <TransparencyConditions />
            <HowItWorks onScrollToPackages={() => navigateHome('pacotes')} onOpenDirectContact={openQuote} />
            <EventSimulator packages={packages} initialSelection={eventSelection} onPayment={handleExternalPayment} />
          </>
        )}
      </main>
      <Footer onOpenQuoteModal={openQuote} />
      <QuoteModal isOpen={isQuoteModalOpen} onClose={() => setIsQuoteModalOpen(false)} proposalDetails={activeProposalDetails} />
    </div>
  );
}
