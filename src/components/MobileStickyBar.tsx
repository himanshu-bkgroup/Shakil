import React from 'react';
import { Phone, MessageSquare, Navigation } from 'lucide-react';
import type { BusinessSettings } from '../types';
import { buildWhatsAppUrl } from '../lib/whatsapp';
import { trackAnalyticsEvent } from '../lib/supabase';

interface MobileStickyBarProps {
  settings: BusinessSettings;
}

export const MobileStickyBar: React.FC<MobileStickyBarProps> = ({ settings }) => {
  const whatsappUrl = buildWhatsAppUrl(
    settings.whatsapp_number,
    'Hello Sakil Bag Store, I found your store on Google and need assistance with bag/trolley repair.'
  );

  const handlePhoneClick = () => {
    trackAnalyticsEvent({
      event_name: 'phone_click',
      page_url: window.location.pathname,
      session_id: 'mob-bar',
    });
  };

  const handleWhatsAppClick = () => {
    trackAnalyticsEvent({
      event_name: 'whatsapp_click',
      page_url: window.location.pathname,
      session_id: 'mob-bar',
    });
  };

  const handleDirectionsClick = () => {
    trackAnalyticsEvent({
      event_name: 'directions_click',
      page_url: window.location.pathname,
      session_id: 'mob-bar',
    });
  };

  return (
    <aside 
      aria-label="Quick contact actions"
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-neutral-800 bg-neutral-950/95 backdrop-blur-md px-3 py-2 shadow-2xl safe-area-bottom"
    >
      <div className="grid grid-cols-3 gap-2 max-w-md mx-auto">
        <a
          href={`tel:${settings.phone.replace(/\D/g, '')}`}
          onClick={handlePhoneClick}
          className="flex flex-col items-center justify-center rounded-lg bg-neutral-900 border border-neutral-800 py-2 active:bg-neutral-800 text-neutral-200 transition-colors"
        >
          <Phone className="h-4 w-4 text-orange-400 mb-0.5" />
          <span className="text-[11px] font-semibold tracking-wide">CALL</span>
        </a>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleWhatsAppClick}
          className="flex flex-col items-center justify-center rounded-lg bg-emerald-700 active:bg-emerald-600 py-2 text-white shadow-sm transition-colors"
        >
          <MessageSquare className="h-4 w-4 mb-0.5 fill-current" />
          <span className="text-[11px] font-bold tracking-wide">WHATSAPP</span>
        </a>

        <a
          href={settings.google_maps_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleDirectionsClick}
          className="flex flex-col items-center justify-center rounded-lg bg-neutral-900 border border-neutral-800 py-2 active:bg-neutral-800 text-neutral-200 transition-colors"
        >
          <Navigation className="h-4 w-4 text-orange-400 mb-0.5" />
          <span className="text-[11px] font-semibold tracking-wide">DIRECTIONS</span>
        </a>
      </div>
    </aside>
  );
};
