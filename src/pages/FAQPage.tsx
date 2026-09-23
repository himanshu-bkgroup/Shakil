import React, { useState } from 'react';
import type { FAQItem, BusinessSettings } from '../types';
import { ArrowLeft, ChevronDown, ChevronUp, MessageSquare, Phone, MapPin, Search } from 'lucide-react';
import { buildWhatsAppUrl } from '../lib/whatsapp';

interface FAQPageProps {
  faqs: FAQItem[];
  settings: BusinessSettings;
  onNavigate: (path: string) => void;
  onOpenRequirementModal: (serviceType?: string) => void;
}

export const FAQPage: React.FC<FAQPageProps> = ({
  faqs,
  settings,
  onNavigate,
  onOpenRequirementModal,
}) => {
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Trolley Repair', 'Trolley Wheels', 'Trolley Handles', 'Locks & Hardware', 'Bag Repair', 'Custom Bags', 'Store Visit', 'Contact'];

  const filteredFaqs = faqs.filter((faq) => {
    if (!faq.active) return false;
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFaq = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  const whatsappUrl = buildWhatsAppUrl(
    settings.whatsapp_number,
    'Hello Sakil Bag Store, I have a question regarding bag/trolley repair services.'
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
            Frequently Asked Questions
          </div>
          <h1 className="font-heading text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Questions About Trolley Repairs, Wheels & Parts
          </h1>
          <p className="text-sm text-neutral-400 mt-2 max-w-2xl leading-relaxed">
            Factual answers regarding wheel sizing, telescopic handle replacements, lock repairs, and visiting our store in Sector 22, Noida.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions (e.g. wheel size, handle, lock, location)..."
            className="w-full rounded-xl border border-neutral-800 bg-neutral-900/80 pl-10 pr-4 py-3 text-sm text-white placeholder-neutral-500 focus:border-orange-500 focus:outline-none"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-orange-600 text-white font-semibold'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* FAQs Accordion */}
        <div className="space-y-3">
          {filteredFaqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className="rounded-xl border border-neutral-800/80 bg-neutral-900/50 overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 focus:outline-none"
                >
                  <span className="font-heading text-sm sm:text-base font-semibold text-white">
                    {faq.question}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-orange-400 shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-neutral-400 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 border-t border-neutral-800/60 text-xs sm:text-sm text-neutral-300 leading-relaxed">
                    <p>{faq.answer}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-[11px] font-mono text-neutral-500">
                        Category: {faq.category}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {filteredFaqs.length === 0 && (
            <div className="py-12 text-center text-neutral-500 text-sm">
              No matching questions found. Ask Mohd Shakil directly on WhatsApp!
            </div>
          )}
        </div>

        {/* Help CTA Box */}
        <div className="mt-12 rounded-2xl border border-neutral-800 bg-neutral-900/80 p-6 text-center">
          <h3 className="font-heading text-lg font-bold text-white mb-2">
            Have a question not listed here?
          </h3>
          <p className="text-xs text-neutral-400 max-w-md mx-auto mb-4">
            Send a photo of your bag or trolley directly to Mohd Shakil for prompt clarification.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-semibold text-white"
            >
              <MessageSquare className="h-4 w-4 fill-current" />
              <span>Ask on WhatsApp</span>
            </a>
            <button
              onClick={() => onOpenRequirementModal()}
              className="rounded-lg bg-orange-600 hover:bg-orange-500 px-4 py-2 text-xs font-semibold text-white"
            >
              Send Requirement
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
