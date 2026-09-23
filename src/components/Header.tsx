import React, { useState } from 'react';
import { Phone, MessageSquare, Menu, X, MapPin, Search } from 'lucide-react';
import type { BusinessSettings, Service } from '../types';
import { buildWhatsAppUrl } from '../lib/whatsapp';
import { HeaderSearchBar } from './HeaderSearchBar';

interface HeaderProps {
  settings: BusinessSettings;
  services?: Service[];
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenRequirementModal: (serviceType?: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  services = [],
  currentPath,
  onNavigate,
  onOpenRequirementModal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Services', path: '/#services' },
    { label: 'Trolley Wheels', path: '/trolley-wheel-repair-noida' },
    { label: 'Trolley Parts', path: '/trolley-parts-supplier-noida' },
    { label: 'Bag Repair', path: '/bag-repair-noida' },
    { label: 'Custom Bags', path: '/customized-bag-maker-noida' },
    { label: 'Gallery', path: '/gallery' },
    { label: 'FAQ', path: '/faq' },
    { label: 'Contact', path: '/contact' },
  ];

  const handleLinkClick = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    setMobileSearchOpen(false);
    onNavigate(path);
  };

  const whatsappHref = buildWhatsAppUrl(
    settings.whatsapp_number,
    'Hello Sakil Bag Store, I would like to enquire about your bag and trolley repair services in Noida.'
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800/80 bg-neutral-950/90 backdrop-blur-md transition-all">
      {/* Top Bar Contract: 3 zones */}
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-2 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single text wordmark */}
        <a
          href="/"
          onClick={(e) => handleLinkClick(e, '/')}
          className="group flex flex-col items-start focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded shrink-0"
        >
          <span className="font-heading text-lg sm:text-xl font-bold tracking-tight text-white transition-colors group-hover:text-orange-400">
            SAKIL BAG STORE
          </span>
          <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-medium">
            Mohd Shakil · Sector 22 Noida
          </span>
        </a>

        {/* Zone 1.5: Desktop Search Bar (wheels, handles, locks) */}
        <div className="hidden md:block flex-shrink-0">
          <HeaderSearchBar
            services={services}
            settings={settings}
            onNavigate={onNavigate}
            onOpenRequirementModal={onOpenRequirementModal}
          />
        </div>

        {/* Zone 2: Clean text navigation links */}
        <nav className="hidden 2xl:flex items-center gap-5 text-sm font-medium text-neutral-300">
          {navLinks.slice(0, 6).map((item) => (
            <a
              key={item.path}
              href={item.path}
              onClick={(e) => handleLinkClick(e, item.path)}
              className={`transition-colors hover:text-orange-400 py-1 ${
                currentPath === item.path ? 'text-orange-400 border-b-2 border-orange-500' : 'text-neutral-300'
              }`}
            >
              {item.label}
            </a>
          ))}
          <a
            href="/faq"
            onClick={(e) => handleLinkClick(e, '/faq')}
            className={`transition-colors hover:text-orange-400 py-1 ${
              currentPath === '/faq' ? 'text-orange-400 border-b-2 border-orange-500' : 'text-neutral-300'
            }`}
          >
            FAQ
          </a>
          <a
            href="/contact"
            onClick={(e) => handleLinkClick(e, '/contact')}
            className={`transition-colors hover:text-orange-400 py-1 ${
              currentPath === '/contact' ? 'text-orange-400 border-b-2 border-orange-500' : 'text-neutral-300'
            }`}
          >
            Contact
          </a>
        </nav>

        {/* Zone 3: Primary actions & Mobile controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Mobile Search Button (visible below md) */}
          <button
            type="button"
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className="md:hidden p-2 text-neutral-300 hover:text-white hover:bg-neutral-900 rounded-lg transition-colors focus:outline-none focus:ring-1 focus:ring-orange-500"
            aria-label="Search services"
            title="Search wheels, handles, locks..."
          >
            <Search className="h-5 w-5 text-neutral-300" />
          </button>

          <a
            href={`tel:${settings.phone.replace(/\D/g, '')}`}
            className="hidden lg:inline-flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-xs font-semibold text-neutral-100 hover:border-neutral-500 hover:bg-neutral-800 transition-colors whitespace-nowrap"
            title="Call Sakil Bag Store"
          >
            <Phone className="h-3.5 w-3.5 text-orange-400" />
            <span>Call Now</span>
          </a>

          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-colors whitespace-nowrap"
            title="Chat on WhatsApp"
          >
            <MessageSquare className="h-3.5 w-3.5 fill-current" />
            <span>WhatsApp</span>
          </a>

          <button
            onClick={() => onOpenRequirementModal()}
            className="hidden sm:inline-flex items-center rounded-lg bg-orange-600 hover:bg-orange-500 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-colors whitespace-nowrap"
          >
            Send Requirement
          </button>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="2xl:hidden p-2 text-neutral-400 hover:text-white rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Search Bar Dropdown Overlay (when search icon is tapped on mobile) */}
      {mobileSearchOpen && (
        <div className="md:hidden border-b border-neutral-800 bg-neutral-900/98 px-4 py-3 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-neutral-300">
              Find Luggage & Trolley Services
            </span>
            <button
              onClick={() => setMobileSearchOpen(false)}
              className="text-neutral-400 hover:text-white p-1"
              aria-label="Close search"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <HeaderSearchBar
            services={services}
            settings={settings}
            onNavigate={(path) => {
              setMobileSearchOpen(false);
              onNavigate(path);
            }}
            onOpenRequirementModal={(type) => {
              setMobileSearchOpen(false);
              onOpenRequirementModal(type);
            }}
            isMobileModal={true}
            onCloseMobile={() => setMobileSearchOpen(false)}
          />
        </div>
      )}

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="2xl:hidden border-b border-neutral-800 bg-neutral-900/95 px-4 pt-3 pb-6 space-y-3">
          {/* Quick search inside mobile drawer as well */}
          <div className="pb-2">
            <HeaderSearchBar
              services={services}
              settings={settings}
              onNavigate={(path) => {
                setMobileMenuOpen(false);
                onNavigate(path);
              }}
              onOpenRequirementModal={(type) => {
                setMobileMenuOpen(false);
                onOpenRequirementModal(type);
              }}
              isMobileModal={true}
              onCloseMobile={() => setMobileMenuOpen(false)}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm pt-2 border-t border-neutral-800/60">
            {navLinks.map((item) => (
              <a
                key={item.path}
                href={item.path}
                onClick={(e) => handleLinkClick(e, item.path)}
                className={`rounded-md px-3 py-2 text-neutral-300 hover:bg-neutral-800 hover:text-white ${
                  currentPath === item.path ? 'bg-neutral-800 font-semibold text-orange-400' : ''
                }`}
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="pt-3 border-t border-neutral-800 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenRequirementModal();
              }}
              className="w-full rounded-lg bg-orange-600 hover:bg-orange-500 py-2.5 text-center text-xs font-bold text-white uppercase tracking-wider"
            >
              Send Your Requirement
            </button>
            <div className="flex gap-2">
              <a
                href={`tel:${settings.phone.replace(/\D/g, '')}`}
                className="flex-1 rounded-lg border border-neutral-700 bg-neutral-800 py-2 text-center text-xs font-medium text-neutral-200"
              >
                Call: {settings.phone}
              </a>
              <a
                href={settings.google_maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 rounded-lg border border-neutral-700 bg-neutral-800 py-2 text-center text-xs font-medium text-neutral-200 inline-flex items-center justify-center gap-1"
              >
                <MapPin className="h-3.5 w-3.5 text-orange-400" />
                Directions
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
