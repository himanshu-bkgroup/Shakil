import React, { useState } from 'react';
import type { GalleryItem, BusinessSettings } from '../types';
import { ArrowLeft, ZoomIn, MessageSquare, PlusCircle } from 'lucide-react';
import { buildWhatsAppUrl } from '../lib/whatsapp';

interface GalleryPageProps {
  gallery: GalleryItem[];
  settings: BusinessSettings;
  onNavigate: (path: string) => void;
  onOpenRequirementModal: (serviceType?: string) => void;
}

export const GalleryPage: React.FC<GalleryPageProps> = ({
  gallery,
  settings,
  onNavigate,
  onOpenRequirementModal,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [previewItem, setPreviewItem] = useState<GalleryItem | null>(null);

  const categories = [
    'All',
    'Wheels',
    'Handles',
    'Locks',
    'Trolley Parts',
    'Bag Repair',
    'Luggage',
    'Customized Bags',
    'Store',
  ];

  const filteredItems = selectedCategory === 'All'
    ? gallery.filter(item => item.active)
    : gallery.filter(item => item.active && item.category === selectedCategory);

  const whatsappUrl = (title: string) => buildWhatsAppUrl(
    settings.whatsapp_number,
    `Hello Sakil Bag Store, I saw "${title}" in your parts gallery on your website. Do you have this available or can you repair mine?`
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
            Sakil Bag Store · Sector 22 Noida
          </div>
          <h1 className="font-heading text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Parts, Hardware & Repair Work Gallery
          </h1>
          <p className="text-sm text-neutral-400 mt-2 max-w-2xl leading-relaxed">
            Examine our replacement trolley wheels, telescopic handles, luggage locks, and repair craftsmanship. Administrators can upload and replace photos from the management dashboard.
          </p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap items-center gap-2 border-b border-neutral-800 pb-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-orange-600 text-white font-semibold'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="group rounded-2xl border border-neutral-800 bg-neutral-900/60 overflow-hidden hover:border-neutral-700 hover:bg-neutral-900 transition-all flex flex-col justify-between"
            >
              <div className="relative h-60 w-full overflow-hidden bg-neutral-950">
                <img
                  src={item.image_url}
                  alt={item.alt_text || item.title}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover object-center filter brightness-90 group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent" />

                <button
                  onClick={() => setPreviewItem(item)}
                  className="absolute top-3 right-3 rounded-lg bg-neutral-950/70 p-2 text-neutral-300 hover:text-white backdrop-blur-sm transition-colors"
                  aria-label="Enlarge image"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>

                <div className="absolute bottom-3 left-4 right-4">
                  <span className="text-[10px] font-mono text-orange-400 uppercase tracking-wider block">
                    {item.category}
                  </span>
                  <h3 className="font-heading text-sm font-bold text-white">
                    {item.title}
                  </h3>
                </div>
              </div>

              <div className="p-4 flex flex-col justify-between flex-1">
                <p className="text-xs text-neutral-400 mb-4 leading-relaxed">
                  {item.caption || 'Authentic hardware & repair work from our Sector 22, Noida workshop.'}
                </p>

                <div className="flex items-center gap-2 pt-2 border-t border-neutral-800/80">
                  <button
                    onClick={() => onOpenRequirementModal(item.category)}
                    className="flex-1 rounded-lg bg-orange-600 hover:bg-orange-500 py-2 text-center text-xs font-semibold text-white transition-colors"
                  >
                    Send Requirement
                  </button>
                  <a
                    href={whatsappUrl(item.title)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-emerald-400 transition-colors"
                    title="Ask on WhatsApp"
                  >
                    <MessageSquare className="h-4 w-4 fill-current" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {filteredItems.length === 0 && (
          <div className="py-20 text-center text-neutral-500 text-sm">
            No gallery items found in this category.
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm">
          <div className="relative max-w-4xl w-full bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden p-4">
            <button
              onClick={() => setPreviewItem(null)}
              className="absolute top-4 right-4 z-10 bg-neutral-950/80 text-neutral-300 hover:text-white rounded-full p-2"
            >
              ✕
            </button>
            <img
              src={previewItem.image_url}
              alt={previewItem.alt_text}
              className="max-h-[70vh] w-full object-contain rounded-xl"
            />
            <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs text-orange-400 uppercase font-mono">{previewItem.category}</span>
                <h3 className="font-heading text-lg font-bold text-white">{previewItem.title}</h3>
                <p className="text-xs text-neutral-400 mt-1">{previewItem.caption}</p>
              </div>
              <a
                href={whatsappUrl(previewItem.title)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-semibold text-white"
              >
                <MessageSquare className="h-4 w-4 fill-current" />
                <span>Enquire on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
