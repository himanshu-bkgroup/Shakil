import React, { useRef } from 'react';
import type { BusinessSettings, Service } from '../types';
import { HeroSection } from '../components/HeroSection';
import { TrustSection } from '../components/TrustSection';
import { Interactive3DShowcase } from '../components/Interactive3DShowcase';
import { ServiceCard } from '../components/ServiceCard';
import { UniversalRequirementForm } from '../components/UniversalRequirementForm';
import { MapPin, Phone, MessageSquare, Clock, ArrowRight, ExternalLink } from 'lucide-react';
import { buildWhatsAppUrl } from '../lib/whatsapp';

interface HomePageProps {
  settings: BusinessSettings;
  services: Service[];
  onNavigate: (path: string) => void;
  onOpenRequirementModal: (serviceType?: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  settings,
  services,
  onNavigate,
  onOpenRequirementModal,
}) => {
  const formRef = useRef<HTMLDivElement>(null);

  const scrollToForm = (serviceType?: string) => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth' });
    } else {
      onOpenRequirementModal(serviceType);
    }
  };

  const whatsappUrl = buildWhatsAppUrl(
    settings.whatsapp_number,
    'Hello Sakil Bag Store, I found your website on Google and would like to ask about trolley/bag repair services in Noida.'
  );

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* 1. Hero Section */}
      <HeroSection
        settings={settings}
        onOpenRequirementModal={onOpenRequirementModal}
      />

      {/* 2. Trust Section (Scope of Work without fake claims) */}
      <TrustSection onSelectCategory={onOpenRequirementModal} />

      {/* 3. Interactive 3D Component Hardware Showcase */}
      <section className="py-16 sm:py-24 border-b border-neutral-800/80 bg-neutral-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Interactive3DShowcase onSelectService={onOpenRequirementModal} />
        </div>
      </section>

      {/* 4. Services Grid */}
      <section id="services" className="py-16 sm:py-24 border-b border-neutral-800/80 bg-neutral-900/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-orange-400 mb-2">
                Expertise & Capabilities
              </div>
              <h2 className="font-heading text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                Our Specialist Services in Noida
              </h2>
              <p className="text-sm text-neutral-400 mt-2 max-w-2xl">
                Select any service to view sizing specifications, measurement guides, or send your direct requirement on WhatsApp.
              </p>
            </div>
            <button
              onClick={() => onOpenRequirementModal()}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-400 hover:text-orange-300 transition-colors"
            >
              <span>Can't find your requirement? Send custom enquiry</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.filter(s => s.active).map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                settings={settings}
                onSendRequirement={onOpenRequirementModal}
                onNavigatePage={(slug) => onNavigate(`/${slug}`)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 5. Direct Requirement Form Section */}
      <section ref={formRef} className="py-16 sm:py-24 border-b border-neutral-800/80 bg-neutral-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Direct store details */}
            <div className="lg:col-span-6 space-y-6">
              <div className="text-xs font-bold uppercase tracking-wider text-orange-400">
                Direct Contact
              </div>
              <h2 className="font-heading text-2xl sm:text-4xl font-extrabold tracking-tight text-white text-balance">
                Have a Trolley or Bag Problem? Send Your Requirement
              </h2>
              <p className="text-sm text-neutral-300 leading-relaxed">
                Fill in your details below. Your enquiry is securely saved to our system and formatted into a structured WhatsApp message so Mohd Shakil can inspect your photos and confirm parts fitment immediately.
              </p>

              {/* Verified Contact Card */}
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-orange-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-semibold text-white">Workshop Address</div>
                    <div className="text-xs text-neutral-300 mt-0.5">{settings.address}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-orange-400 shrink-0" />
                  <div>
                    <div className="text-xs font-semibold text-white">Direct Business Phone</div>
                    <a href={`tel:${settings.phone.replace(/\D/g, '')}`} className="text-xs text-neutral-200 hover:text-white font-medium">
                      {settings.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-orange-400 shrink-0" />
                  <div>
                    <div className="text-xs font-semibold text-white">Store Hours</div>
                    <div className="text-xs text-neutral-300 mt-0.5">{settings.opening_hours}</div>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap gap-2">
                  <a
                    href={settings.google_maps_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 px-3.5 py-2 text-xs font-semibold text-neutral-100 transition-colors"
                  >
                    <MapPin className="h-3.5 w-3.5 text-orange-400" />
                    <span>Get Directions on Google Maps</span>
                    <ExternalLink className="h-3 w-3 opacity-60 ml-0.5" />
                  </a>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white transition-colors"
                  >
                    <MessageSquare className="h-3.5 w-3.5 fill-current" />
                    <span>Instant WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column: Universal Requirement Form */}
            <div className="lg:col-span-6">
              <UniversalRequirementForm
                settings={settings}
                initialServiceType="Trolley Wheels"
                sourcePage="/"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 6. Google Maps / Local SEO Section */}
      <section className="py-16 bg-neutral-900/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
          <div className="text-xs font-bold uppercase tracking-wider text-orange-400 mb-2">
            Local Presence
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-white mb-4">
            Located in Chaura Raghunathpur, Sector 22, Noida
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed mb-6">
            Easily accessible for residents and businesses across Noida, Greater Noida, and Delhi NCR. Bring your luggage for measurement checks or pick up replacement wheels and handles.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href={settings.google_maps_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-orange-600 hover:bg-orange-500 px-5 py-3 text-xs sm:text-sm font-semibold text-white shadow-md transition-colors"
            >
              <MapPin className="h-4 w-4" />
              <span>Get Google Maps Directions</span>
            </a>
            <a
              href={settings.google_business_profile_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 px-5 py-3 text-xs sm:text-sm font-semibold text-neutral-200 transition-colors"
            >
              <span>View Google Business Profile</span>
              <ExternalLink className="h-4 w-4 text-neutral-400" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
