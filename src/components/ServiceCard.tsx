import React from 'react';
import { ArrowRight, MessageSquare } from 'lucide-react';
import type { Service, BusinessSettings } from '../types';
import { buildWhatsAppUrl } from '../lib/whatsapp';
import { trackAnalyticsEvent } from '../lib/supabase';

interface ServiceCardProps {
  service: Service;
  settings: BusinessSettings;
  onSendRequirement: (serviceName: string) => void;
  onNavigatePage: (slug: string) => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  settings,
  onSendRequirement,
  onNavigatePage,
}) => {
  const whatsappUrl = buildWhatsAppUrl(
    settings.whatsapp_number,
    `Hello Sakil Bag Store, I found your website on Google and need assistance with ${service.name}.`
  );

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    trackAnalyticsEvent({
      event_name: 'whatsapp_click',
      page_url: window.location.pathname,
      service_id: service.id,
      session_id: 'card-' + service.id,
    });
  };

  return (
    <div
      onClick={() => onNavigatePage(service.slug)}
      className="group cursor-pointer rounded-2xl border border-neutral-800 bg-neutral-900/60 overflow-hidden hover:border-neutral-700 hover:bg-neutral-900 transition-all flex flex-col justify-between shadow-lg"
    >
      <div>
        {/* Visual Header */}
        <div className="relative h-48 w-full overflow-hidden bg-neutral-950">
          <img
            src={service.image_url}
            alt={service.name}
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover object-center filter brightness-90 group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent" />
          <div className="absolute bottom-3 left-4 right-4">
            <span className="text-[11px] font-mono text-orange-400 uppercase tracking-wider block">
              Sakil Bag Store · Noida
            </span>
            <h3 className="font-heading text-lg font-bold text-white group-hover:text-orange-400 transition-colors">
              {service.name}
            </h3>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5">
          <p className="text-xs text-neutral-400 leading-relaxed">
            {service.description}
          </p>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-5 pt-0 border-t border-neutral-800/80 mt-2 flex items-center justify-between gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSendRequirement(service.name);
          }}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-colors whitespace-nowrap"
        >
          <span>Send Requirement</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleWhatsApp}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 px-3 py-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors whitespace-nowrap"
          title="Direct WhatsApp chat"
        >
          <MessageSquare className="h-3.5 w-3.5 fill-current" />
          <span>WhatsApp</span>
        </a>
      </div>
    </div>
  );
};
