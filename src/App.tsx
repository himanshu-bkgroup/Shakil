import React, { useState, useEffect } from 'react';
import type { BusinessSettings, Service, GalleryItem, FAQItem } from './types';
import {
  fetchBusinessSettings,
  fetchServices,
  fetchGallery,
  fetchFAQs,
  trackAnalyticsEvent,
  isAdminAuthenticated,
  setAdminAuthenticated,
} from './lib/supabase';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { MobileStickyBar } from './components/MobileStickyBar';
import { UniversalRequirementForm } from './components/UniversalRequirementForm';
import { HomePage } from './pages/HomePage';
import { ServiceDetailPage } from './pages/ServiceDetailPage';
import { GalleryPage } from './pages/GalleryPage';
import { FAQPage } from './pages/FAQPage';
import { ContactPage } from './pages/ContactPage';
import { AboutPage } from './pages/AboutPage';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname || '/');
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Global modal for quick requirement submissions
  const [requirementModalOpen, setRequirementModalOpen] = useState(false);
  const [modalServiceCategory, setModalServiceCategory] = useState<string>('Trolley Wheels');

  // Admin authentication state
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(isAdminAuthenticated());

  // Listen for browser popstate
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Fetch initial business data
  useEffect(() => {
    async function loadData() {
      try {
        const [sett, srvs, gal, faqList] = await Promise.all([
          fetchBusinessSettings(),
          fetchServices(),
          fetchGallery(),
          fetchFAQs(),
        ]);
        setSettings(sett);
        setServices(srvs);
        setGallery(gal);
        setFaqs(faqList);
      } catch (err) {
        console.error('Failed to load initial data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Update document title and meta description dynamically based on current path
  useEffect(() => {
    if (!settings) return;

    let title = `${settings.business_name} - Trolley Bag Repair & Parts Specialist Noida`;
    let desc = `Professional trolley bag repair, trolley wheels replacement, handles, locks, luggage repair and customized bags in Sector 22, Noida. Run by Mohd Shakil.`;

    if (currentPath.includes('trolley-wheel-repair-noida')) {
      title = `Trolley Wheel Repair & Replacement in Noida | Sakil Bag Store`;
      desc = `Broken trolley wheels? We provide precision 360-degree dual spinner wheels, 40mm-70mm PU wheels & axles in Sector 22, Noida. Run by Mohd Shakil.`;
    } else if (currentPath.includes('trolley-handle-repair-noida')) {
      title = `Trolley Handle Repair & Replacement in Noida | Sakil Bag Store`;
      desc = `Telescopic pull-up trolley handle repairs, internal aluminum tubes, top and side handles in Sector 22, Noida.`;
    } else if (currentPath.includes('trolley-bag-repair-noida')) {
      title = `Trolley Bag Repair in Noida | Sakil Bag Store`;
      desc = `Complete trolley bag repair in Sector 22, Noida: broken wheels, jammed telescopic handles, luggage locks, and zip track repair.`;
    } else if (currentPath.includes('trolley-bag-locks-noida')) {
      title = `Trolley & Luggage Locks in Noida | Sakil Bag Store`;
      desc = `Replacement 3-digit combination locks, TSA-type luggage hardware, zipper lock clasps in Sector 22, Noida.`;
    } else if (currentPath.includes('trolley-parts-supplier-noida')) {
      title = `Trolley Parts Supplier in Noida | Sakil Bag Store`;
      desc = `Supplier of replacement trolley wheels, telescopic handles, locks, luggage hardware and spare parts in Noida.`;
    } else if (currentPath.includes('bag-repair-noida')) {
      title = `Bag Repair in Noida | Sakil Bag Store`;
      desc = `Backpack repair, travel bag repair, zip slider replacement, and heavy-duty seam stitching in Sector 22, Noida.`;
    } else if (currentPath.includes('luggage-repair-noida')) {
      title = `Luggage Repair in Noida | Sakil Bag Store`;
      desc = `Hard-shell suitcase repair, luggage spinners, corner bumpers, and trolley repairs in Sector 22, Noida.`;
    } else if (currentPath.includes('customized-bag-maker-noida')) {
      title = `Customized Bag Maker in Noida | Sakil Bag Store`;
      desc = `Customized travel bags, corporate backpacks, promotional bags, and utility bag maker in Sector 22, Noida.`;
    } else if (currentPath === '/gallery') {
      title = `Parts & Workshop Gallery | Sakil Bag Store Noida`;
      desc = `Genuine photos of replacement trolley wheels, telescopic handles, luggage hardware, and repairs at Sakil Bag Store.`;
    } else if (currentPath === '/faq') {
      title = `Frequently Asked Questions | Sakil Bag Store Noida`;
      desc = `Clear answers on trolley wheel replacement, sizing, luggage repairs, and store visits in Sector 22, Noida.`;
    } else if (currentPath === '/contact') {
      title = `Contact & Location | Sakil Bag Store Sector 22 Noida`;
      desc = `Visit Mohd Shakil at Chaura Raghunathpur, Sector 22, Noida. Phone: 083838 04752. Get directions on Google Maps.`;
    } else if (currentPath === '/about') {
      title = `About Sakil Bag Store | Mohd Shakil Sector 22 Noida`;
      desc = `Specialist luggage repair, trolley parts, wheels, and customized bag maker located in Sector 22, Noida.`;
    } else if (currentPath === '/admin') {
      title = `Staff Admin Portal | Sakil Bag Store`;
    }

    document.title = title;

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', desc);
    }

    // Track page view
    trackAnalyticsEvent({
      event_name: 'page_view',
      page_url: currentPath,
      session_id: 'app-sess',
    });
  }, [currentPath, settings]);

  const handleNavigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenRequirementModal = (serviceType = 'Trolley Wheels') => {
    setModalServiceCategory(serviceType);
    setRequirementModalOpen(true);
  };

  if (loading || !settings) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-2 border-orange-500 border-t-transparent animate-spin rounded-full" />
          <span className="font-heading text-sm text-neutral-300">Loading SAKIL BAG STORE...</span>
        </div>
      </div>
    );
  }

  // 1. ADMIN ROUTE
  if (currentPath === '/admin') {
    if (!isAdminLoggedIn) {
      return (
        <AdminLogin
          onSuccess={() => setIsAdminLoggedIn(true)}
          onBackToSite={() => handleNavigate('/')}
        />
      );
    }
    return (
      <AdminDashboard
        onLogout={() => {
          setAdminAuthenticated(false);
          setIsAdminLoggedIn(false);
          handleNavigate('/');
        }}
        onViewWebsite={() => handleNavigate('/')}
      />
    );
  }

  // Helper to match service detail routes
  const cleanPath = currentPath.replace(/^\//, '').split('#')[0];
  const serviceDetailSlugs = [
    'trolley-wheel-repair-noida',
    'trolley-handle-repair-noida',
    'trolley-bag-repair-noida',
    'trolley-bag-locks-noida',
    'trolley-parts-supplier-noida',
    'bag-repair-noida',
    'luggage-repair-noida',
    'customized-bag-maker-noida',
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      {/* Global Responsive Navigation Header */}
      <Header
        settings={settings}
        services={services}
        currentPath={currentPath}
        onNavigate={handleNavigate}
        onOpenRequirementModal={handleOpenRequirementModal}
      />

      {/* Main Page Rendering */}
      <main className="flex-1">
        {cleanPath === '' || cleanPath === 'home' ? (
          <HomePage
            settings={settings}
            services={services}
            onNavigate={handleNavigate}
            onOpenRequirementModal={handleOpenRequirementModal}
          />
        ) : serviceDetailSlugs.includes(cleanPath) ? (
          <ServiceDetailPage
            slug={cleanPath}
            settings={settings}
            onNavigate={handleNavigate}
          />
        ) : cleanPath === 'gallery' ? (
          <GalleryPage
            gallery={gallery}
            settings={settings}
            onNavigate={handleNavigate}
            onOpenRequirementModal={handleOpenRequirementModal}
          />
        ) : cleanPath === 'faq' ? (
          <FAQPage
            faqs={faqs}
            settings={settings}
            onNavigate={handleNavigate}
            onOpenRequirementModal={handleOpenRequirementModal}
          />
        ) : cleanPath === 'contact' ? (
          <ContactPage
            settings={settings}
            onNavigate={handleNavigate}
            onOpenRequirementModal={handleOpenRequirementModal}
          />
        ) : cleanPath === 'about' ? (
          <AboutPage
            settings={settings}
            onNavigate={handleNavigate}
            onOpenRequirementModal={handleOpenRequirementModal}
          />
        ) : (
          <HomePage
            settings={settings}
            services={services}
            onNavigate={handleNavigate}
            onOpenRequirementModal={handleOpenRequirementModal}
          />
        )}
      </main>

      {/* Global Comprehensive Footer */}
      <Footer
        settings={settings}
        onNavigate={handleNavigate}
      />

      {/* Mobile Sticky Action Bar: CALL | WHATSAPP | DIRECTIONS */}
      <MobileStickyBar settings={settings} />

      {/* Universal Requirement Modal Dialog */}
      {requirementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <UniversalRequirementForm
            settings={settings}
            initialServiceType={modalServiceCategory}
            sourcePage={currentPath}
            isModal={true}
            onClose={() => setRequirementModalOpen(false)}
          />
        </div>
      )}
    </div>
  );
}
