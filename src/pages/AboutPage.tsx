import React from 'react';
import type { BusinessSettings } from '../types';
import { ArrowLeft, MapPin, Phone, MessageSquare, Shield, CheckCircle2 } from 'lucide-react';
import { buildWhatsAppUrl } from '../lib/whatsapp';
import { IMAGES } from '../lib/images';

interface AboutPageProps {
  settings: BusinessSettings;
  onNavigate: (path: string) => void;
  onOpenRequirementModal: (service?: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({
  settings,
  onNavigate,
  onOpenRequirementModal,
}) => {
  const whatsappUrl = buildWhatsAppUrl(
    settings.whatsapp_number,
    'Hello Mohd Shakil, I am reading about SAKIL BAG STORE on your website and would like to enquire.'
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
            About Our Workshop
          </div>
          <h1 className="font-heading text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            About SAKIL BAG STORE
          </h1>
          <p className="text-sm text-neutral-400 mt-2 max-w-2xl leading-relaxed">
            Run by Mohd Shakil in Chaura Raghunathpur, Sector 22, Noida — dedicated to luggage repair, trolley spare parts, wheels, and customized bag requirements.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Authentic Brand Narrative */}
          <div className="lg:col-span-7 space-y-6 text-neutral-300 text-sm leading-relaxed">
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-white">
              Luggage Hardware & Repair Specialist in Sector 22, Noida
            </h2>

            <p>
              <strong className="text-white">SAKIL BAG STORE</strong> was established to provide practical, reliable repair solutions for everyday travelers and commuters facing damaged luggage, broken trolley wheels, jammed telescopic handles, and torn bag zippers in Noida and Delhi NCR.
            </p>

            <p>
              Managed directly by <strong className="text-white">Mohd Shakil</strong>, our store focuses on mechanical compatibility and solid craftsmanship. Rather than discarding an expensive suitcase when a single caster wheel cracks or a pull rod sticks, we stock replacement hardware — from 40mm to 70mm polyurethane dual spinner wheels to multi-stage alloy handles and TSA combination locks.
            </p>

            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-6 space-y-3">
              <h3 className="font-heading text-base font-semibold text-white">
                Our Work Principles
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-orange-400 shrink-0 mt-0.5" />
                  <span><strong>Accurate Sizing:</strong> We verify axle diameters, hole spacing, and wheel tread before recommending replacements.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-orange-400 shrink-0 mt-0.5" />
                  <span><strong>Direct WhatsApp Verification:</strong> Customers can send photos of broken luggage components for immediate assessment before visiting.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-orange-400 shrink-0 mt-0.5" />
                  <span><strong>Customized Bag Fabrication:</strong> Capability to manufacture travel duffles, school/college bags, and corporate utility bags to order.</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-4">
              <button
                onClick={() => onOpenRequirementModal()}
                className="rounded-lg bg-orange-600 hover:bg-orange-500 px-5 py-3 text-xs font-bold text-white shadow-md transition-colors"
              >
                Send Your Requirement
              </button>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-5 py-3 text-xs font-semibold text-white shadow-md transition-colors"
              >
                <MessageSquare className="h-4 w-4 fill-current" />
                <span>Message Mohd Shakil</span>
              </a>
            </div>
          </div>

          {/* Right Column: Visual Showcase */}
          <div className="lg:col-span-5 space-y-6">
            <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 shadow-2xl relative">
              <img
                src={IMAGES.bagRepair}
                alt="Sakil Bag Store Workshop Craftsmanship"
                referrerPolicy="no-referrer"
                className="h-80 w-full object-cover object-center filter brightness-95"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <span className="text-xs text-orange-400 font-mono">Owner & Specialist</span>
                <div className="text-base font-bold text-white">Mohd Shakil · SAKIL BAG STORE</div>
                <div className="text-xs text-neutral-400">Sector 22, Noida, Uttar Pradesh</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
