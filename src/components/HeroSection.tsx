import React from 'react';
import { ArrowRight, MessageSquare, MapPin, Disc, Wrench, Shield, CheckCircle2 } from 'lucide-react';
import type { BusinessSettings } from '../types';
import { buildWhatsAppUrl } from '../lib/whatsapp';
import { IMAGES } from '../lib/images';
import { trackAnalyticsEvent } from '../lib/supabase';

interface HeroSectionProps {
  settings: BusinessSettings;
  onOpenRequirementModal: (serviceType?: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  settings,
  onOpenRequirementModal,
}) => {
  const whatsappUrl = buildWhatsAppUrl(
    settings.whatsapp_number,
    'Hello Sakil Bag Store, I found your website on Google and need assistance with trolley/bag repair.'
  );

  const serviceBadges = [
    'Trolley Wheels',
    'Handles',
    'Locks',
    'Parts',
    'Bag Repair',
    'Custom Bags',
  ];

  const handleDirectionsClick = () => {
    trackAnalyticsEvent({
      event_name: 'directions_click',
      page_url: '/',
      session_id: 'hero-action',
    });
  };

  const handleWhatsAppClick = () => {
    trackAnalyticsEvent({
      event_name: 'whatsapp_click',
      page_url: '/',
      session_id: 'hero-action',
    });
  };

  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:pt-16 lg:pb-24 border-b border-neutral-800/80 bg-radial-[at_top_center] from-neutral-900/60 via-neutral-950 to-neutral-950">
      {/* Background Accent Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-orange-600/10 to-transparent blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headings & Direct CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Store NAP Trust Kicker */}
            <div className="inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900/90 px-3.5 py-1.5 text-xs text-neutral-300">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Direct Workshop · Mohd Shakil · Sector 22, Noida</span>
            </div>

            {/* Main Heading */}
            <h1 className="font-heading text-3xl sm:text-5xl lg:text-5xl font-extrabold tracking-tight text-white text-balance leading-[1.15]">
              Trolley Bag Repair & Parts Specialist in Noida
            </h1>

            {/* Subheading */}
            <div className="text-sm sm:text-base font-semibold text-orange-400 tracking-wide">
              Bag Repair · Trolley Wheels · Trolley Parts · Luggage Repair · Customized Bags
            </div>

            {/* Supporting Text */}
            <p className="text-sm sm:text-base text-neutral-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Professional solutions for trolley repair, replacement parts, luggage repair, bag repair and customized bag requirements in Sector 22, Noida.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
              <button
                onClick={() => onOpenRequirementModal('Trolley Wheels')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-orange-600 hover:bg-orange-500 px-6 py-3.5 text-xs sm:text-sm font-bold text-white shadow-lg transition-all"
              >
                <span>Send Your Requirement</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleWhatsAppClick}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-5 py-3.5 text-xs sm:text-sm font-semibold text-white shadow-md transition-colors"
              >
                <MessageSquare className="h-4 w-4 fill-current" />
                <span>WhatsApp Us</span>
              </a>

              <a
                href={settings.google_maps_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleDirectionsClick}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-700 bg-neutral-900/90 hover:bg-neutral-800 px-5 py-3.5 text-xs sm:text-sm font-semibold text-neutral-200 transition-colors"
              >
                <MapPin className="h-4 w-4 text-orange-400" />
                <span>Get Directions</span>
              </a>
            </div>

            {/* Service Badges */}
            <div className="pt-4 border-t border-neutral-800/80">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                Specialized In
              </div>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                {serviceBadges.map((badge) => (
                  <button
                    key={badge}
                    onClick={() => onOpenRequirementModal(badge)}
                    className="inline-flex items-center gap-1.5 rounded-md border border-neutral-800 bg-neutral-900/60 px-2.5 py-1 text-xs text-neutral-300 hover:border-neutral-700 hover:text-white transition-colors"
                  >
                    <CheckCircle2 className="h-3 w-3 text-orange-400" />
                    <span>{badge}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: 3D Visual Luggage Card */}
          <div className="lg:col-span-5 relative perspective-1000">
            <div className="relative rounded-2xl border border-neutral-800 bg-neutral-900/80 p-3 shadow-2xl backdrop-blur-sm group transform transition-transform duration-500 lg:group-hover:rotate-1">
              <div className="overflow-hidden rounded-xl relative">
                <img
                  src={IMAGES.hero}
                  alt="Trolley Bag Repair Workshop Sakil Bag Store Noida"
                  referrerPolicy="no-referrer"
                  className="w-full h-80 sm:h-96 object-cover object-center filter brightness-95 transform transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent" />

                {/* Floating Specs Card */}
                <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-neutral-800 bg-neutral-950/85 backdrop-blur-md p-4 text-left">
                  <div className="flex items-center justify-between text-xs text-neutral-300 mb-1">
                    <span className="font-semibold text-white">Direct Parts & Fitting</span>
                    <span className="text-orange-400 font-mono">Sector 22 Noida</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-snug">
                    Bring your trolley or send measurements for wheels, handles, and locks.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
