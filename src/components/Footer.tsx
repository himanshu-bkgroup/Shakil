import React from 'react';
import { MapPin, Phone, MessageSquare, Clock, Shield, Lock, ExternalLink } from 'lucide-react';
import type { BusinessSettings } from '../types';
import { buildWhatsAppUrl } from '../lib/whatsapp';

interface FooterProps {
  settings: BusinessSettings;
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, onNavigate }) => {
  const whatsappUrl = buildWhatsAppUrl(
    settings.whatsapp_number,
    'Hello Sakil Bag Store, I would like to enquire about your bag repair and trolley spare parts services in Noida.'
  );

  return (
    <footer className="border-t border-neutral-800 bg-neutral-950 text-neutral-400 text-sm">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Column 1: Business Identity & NAP */}
          <div>
            <div className="mb-4">
              <span className="font-heading text-xl font-bold tracking-tight text-white block">
                {settings.business_name}
              </span>
              <span className="text-xs text-orange-400 font-medium tracking-wide">
                Specialist: {settings.owner_name}
              </span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed mb-4">
              Specialist in trolley bag repair, replacement trolley wheels, telescopic handles, locks, luggage repair, and customized bags in Sector 22, Noida.
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2 text-neutral-300">
                <MapPin className="h-4 w-4 text-orange-400 shrink-0 mt-0.5" />
                <span>{settings.address}</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-300">
                <Phone className="h-4 w-4 text-orange-400 shrink-0" />
                <a href={`tel:${settings.phone.replace(/\D/g, '')}`} className="hover:text-white font-medium">
                  {settings.phone}
                </a>
              </div>
              <div className="flex items-center gap-2 text-neutral-300">
                <Clock className="h-4 w-4 text-orange-400 shrink-0" />
                <span>{settings.opening_hours}</span>
              </div>
            </div>
          </div>

          {/* Column 2: Specialist Services */}
          <div>
            <h3 className="font-heading text-xs font-semibold uppercase tracking-wider text-neutral-200 mb-4">
              Specialist Services
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('/trolley-wheel-repair-noida')}
                  className="hover:text-orange-400 text-left transition-colors"
                >
                  Trolley Wheel Replacement (Noida)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/trolley-handle-repair-noida')}
                  className="hover:text-orange-400 text-left transition-colors"
                >
                  Trolley Handle Repair & Replacement
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/trolley-bag-repair-noida')}
                  className="hover:text-orange-400 text-left transition-colors"
                >
                  Trolley Bag Repair
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/trolley-bag-locks-noida')}
                  className="hover:text-orange-400 text-left transition-colors"
                >
                  Trolley & Luggage Locks
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/trolley-parts-supplier-noida')}
                  className="hover:text-orange-400 text-left transition-colors"
                >
                  Trolley Parts Supplier
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/bag-repair-noida')}
                  className="hover:text-orange-400 text-left transition-colors"
                >
                  General Bag & Backpack Repair
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/customized-bag-maker-noida')}
                  className="hover:text-orange-400 text-left transition-colors"
                >
                  Customized Bag Fabrication
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Local Directions & Verification */}
          <div>
            <h3 className="font-heading text-xs font-semibold uppercase tracking-wider text-neutral-200 mb-4">
              Store Location & Directions
            </h3>
            <p className="text-xs text-neutral-400 mb-3">
              Visit our store in Sector 22, Noida for direct inspection and wheel sizing with precision gauges.
            </p>
            <div className="space-y-2">
              <a
                href={settings.google_maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-xs font-semibold text-neutral-200 hover:border-orange-500 hover:text-white transition-colors"
              >
                <MapPin className="h-3.5 w-3.5 text-orange-400" />
                <span>Get Google Maps Directions</span>
                <ExternalLink className="h-3 w-3 ml-0.5 opacity-60" />
              </a>
              <div className="pt-2">
                <a
                  href={settings.google_business_profile_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-orange-400 hover:text-orange-300 inline-flex items-center gap-1"
                >
                  <span>See our customer reviews on Google</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Column 4: Quick Contact & Admin */}
          <div>
            <h3 className="font-heading text-xs font-semibold uppercase tracking-wider text-neutral-200 mb-4">
              Quick Contact
            </h3>
            <p className="text-xs text-neutral-400 mb-3">
              Send wheel dimensions or bag photos for rapid verification before visiting.
            </p>
            <div className="flex flex-col gap-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition-colors"
              >
                <MessageSquare className="h-3.5 w-3.5 fill-current" />
                <span>Chat with Mohd Shakil</span>
              </a>
              <a
                href={`tel:${settings.phone.replace(/\D/g, '')}`}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 px-4 py-2 text-xs font-medium text-neutral-200 transition-colors"
              >
                <Phone className="h-3.5 w-3.5 text-orange-400" />
                <span>Call {settings.phone}</span>
              </a>
            </div>

            <div className="mt-6 pt-4 border-t border-neutral-900 flex items-center justify-between">
              <button
                onClick={() => onNavigate('/admin')}
                className="text-xs text-neutral-500 hover:text-neutral-300 inline-flex items-center gap-1 transition-colors"
              >
                <Lock className="h-3 w-3" />
                <span>Staff Portal</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-4">
          <p>© {new Date().getFullYear()} SAKIL BAG STORE. All rights reserved. Owner: Mohd Shakil. Sector 22, Noida.</p>
          <div className="flex items-center gap-4">
            <button onClick={() => onNavigate('/about')} className="hover:text-neutral-300">About Store</button>
            <button onClick={() => onNavigate('/faq')} className="hover:text-neutral-300">FAQ</button>
            <button onClick={() => onNavigate('/contact')} className="hover:text-neutral-300">Contact</button>
            <button onClick={() => onNavigate('/gallery')} className="hover:text-neutral-300">Parts Gallery</button>
          </div>
        </div>
      </div>
    </footer>
  );
};
