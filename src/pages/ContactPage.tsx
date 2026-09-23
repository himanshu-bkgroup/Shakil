import React from 'react';
import type { BusinessSettings } from '../types';
import { ArrowLeft, MapPin, Phone, MessageSquare, Clock, Mail, Navigation, ExternalLink } from 'lucide-react';
import { UniversalRequirementForm } from '../components/UniversalRequirementForm';
import { buildWhatsAppUrl } from '../lib/whatsapp';

interface ContactPageProps {
  settings: BusinessSettings;
  onNavigate: (path: string) => void;
  onOpenRequirementModal: (service?: string) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({
  settings,
  onNavigate,
  onOpenRequirementModal,
}) => {
  const whatsappUrl = buildWhatsAppUrl(
    settings.whatsapp_number,
    'Hello Mohd Shakil, I am contacting you regarding your store in Sector 22, Noida.'
  );

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 pb-20">
      {/* Header */}
      <div className="border-b border-neutral-800 bg-neutral-900/40 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => onNavigate('/')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </button>
          <div className="text-xs font-mono text-orange-400 uppercase tracking-wider mb-2">
            Store Location & Contact
          </div>
          <h1 className="font-heading text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Visit SAKIL BAG STORE in Sector 22, Noida
          </h1>
          <p className="text-sm text-neutral-400 mt-2 max-w-2xl leading-relaxed">
            Conveniently situated in Chaura Raghunathpur, Sector 22, Noida. Run by Mohd Shakil for all bag repair, trolley parts, wheels, and customized bag requirements.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Verified NAP Info & Directions */}
          <div className="lg:col-span-6 space-y-6">
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-6 sm:p-8 space-y-6">
              <h2 className="font-heading text-xl font-bold text-white">
                Store Information
              </h2>

              <div className="space-y-4 text-xs sm:text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-orange-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-white">Workshop Address</div>
                    <div className="text-neutral-300 mt-1 leading-relaxed">{settings.address}</div>
                    <div className="text-[11px] text-neutral-500 mt-1">Plus Code: H8WV+F28 Noida</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-orange-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-white">Direct Phone Number</div>
                    <a href={`tel:${settings.phone.replace(/\D/g, '')}`} className="text-orange-400 hover:underline mt-1 block">
                      {settings.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MessageSquare className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-white">WhatsApp Enquiry</div>
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline mt-1 block">
                      Chat on WhatsApp (+{settings.whatsapp_number})
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-orange-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-white">Operating Hours</div>
                    <div className="text-neutral-300 mt-1">{settings.opening_hours}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-orange-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-white">Email</div>
                    <div className="text-neutral-300 mt-1">{settings.email}</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-neutral-800 flex flex-col sm:flex-row gap-3">
                <a
                  href={settings.google_maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-orange-600 hover:bg-orange-500 px-4 py-3 text-xs font-bold text-white shadow-md transition-colors"
                >
                  <Navigation className="h-4 w-4" />
                  <span>Get Directions on Google Maps</span>
                </a>

                <a
                  href={settings.google_business_profile_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 px-4 py-3 text-xs font-semibold text-neutral-200 transition-colors"
                >
                  <span>Google Business Reviews</span>
                  <ExternalLink className="h-3.5 w-3.5 opacity-60" />
                </a>
              </div>
            </div>

            {/* Practical Advice */}
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 text-xs text-neutral-400 space-y-2">
              <h3 className="font-heading font-semibold text-white">Tip for Store Visitors</h3>
              <p>
                When visiting for trolley wheel replacement, bring the trolley or a detached sample wheel with its mounting screw or axle pin. This enables Mohd Shakil to test-fit replacement wheels on the spot.
              </p>
            </div>
          </div>

          {/* Right Column: Universal Requirement Form */}
          <div className="lg:col-span-6">
            <UniversalRequirementForm
              settings={settings}
              initialServiceType="Trolley Repair"
              sourcePage="/contact"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
