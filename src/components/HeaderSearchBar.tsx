import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, Disc, Sliders, Lock, Wrench, Package, Sparkles, ArrowRight, CornerDownLeft, MessageSquare } from 'lucide-react';
import type { Service, BusinessSettings } from '../types';
import { buildWhatsAppUrl } from '../lib/whatsapp';

interface HeaderSearchBarProps {
  services: Service[];
  settings: BusinessSettings;
  onNavigate: (path: string) => void;
  onOpenRequirementModal: (serviceType?: string) => void;
  isMobileModal?: boolean;
  onCloseMobile?: () => void;
}

interface SearchItem {
  id: string;
  name: string;
  slug: string;
  categoryBadge: string;
  description: string;
  keywords: string[];
  modalCategory: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const HeaderSearchBar: React.FC<HeaderSearchBarProps> = ({
  services,
  settings,
  onNavigate,
  onOpenRequirementModal,
  isMobileModal = false,
  onCloseMobile,
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Pre-configured rich search items with extensive synonyms for luggage and bag repair
  const catalogItems: SearchItem[] = useMemo(() => [
    {
      id: 'wheels',
      name: 'Trolley Wheel Replacement',
      slug: 'trolley-wheel-repair-noida',
      categoryBadge: 'Wheels & Spinners',
      description: 'Single, dual spinner 360°, PU caster wheels, 40mm–70mm sizes, bearings & axle replacement.',
      keywords: [
        'wheels', 'wheel', 'trolley wheel', 'spinner', 'dual spinner', 'caster',
        'bearing', 'axle', '40mm', '50mm', '55mm', '60mm', '70mm', 'chakka',
        'pahiya', 'roller', 'tyre', 'rubber wheel', 'polyurethane'
      ],
      modalCategory: 'Trolley Wheels',
      icon: Disc,
    },
    {
      id: 'handles',
      name: 'Trolley Handle Repair & Replacement',
      slug: 'trolley-handle-repair-noida',
      categoryBadge: 'Telescopic & Grips',
      description: 'Telescopic pull-up trolley handles, aluminum rod internal tubes, top & side carrying grips.',
      keywords: [
        'handles', 'handle', 'telescopic', 'pull handle', 'pull up', 'rod',
        'aluminium rod', 'internal tubes', 'dandi', 'side handle', 'top handle',
        'luggage handle', 'carrying grip', 'extending handle'
      ],
      modalCategory: 'Trolley Handles',
      icon: Sliders,
    },
    {
      id: 'locks',
      name: 'Trolley & Luggage Locks',
      slug: 'trolley-bag-locks-noida',
      categoryBadge: 'Security & Hardware',
      description: 'TSA combination locks, 3-digit number locks, zipper puller clasps, and replacement latches.',
      keywords: [
        'locks', 'lock', 'tsa', 'tsa lock', 'combination', 'number lock',
        '3 digit', 'password', 'code', 'zipper lock', 'latch', 'tala', 'hardware lock'
      ],
      modalCategory: 'Trolley Locks',
      icon: Lock,
    },
    {
      id: 'parts',
      name: 'Trolley Parts Supplier',
      slug: 'trolley-parts-supplier-noida',
      categoryBadge: 'Hardware & Spares',
      description: 'Direct supplier for spare trolley components, base plates, rubber feet, rivets, and wheel caps.',
      keywords: [
        'parts', 'trolley parts', 'spare parts', 'supplier', 'base plate',
        'bottom feet', 'hardware', 'screws', 'axle bolt', 'rivet', 'accessories',
        'bulk parts', 'wholesale'
      ],
      modalCategory: 'Trolley Parts',
      icon: Package,
    },
    {
      id: 'bag-repair',
      name: 'Bag & Backpack Repair',
      slug: 'bag-repair-noida',
      categoryBadge: 'Zippers & Seams',
      description: 'Backpack repair, zipper runner and slider replacements, strap reinforcement, and seam stitching.',
      keywords: [
        'bag repair', 'backpack', 'zip', 'zipper', 'chain', 'slider', 'runner',
        'strap', 'seam', 'stitching', 'duffle bag', 'gym bag', 'laptop bag', 'tear'
      ],
      modalCategory: 'Bag Repair',
      icon: Wrench,
    },
    {
      id: 'luggage-repair',
      name: 'Suitcase & Luggage Repair',
      slug: 'luggage-repair-noida',
      categoryBadge: 'Hard-Shell & Body',
      description: 'Hard-case crack fixing, corner protective bumper installations, frame alignment, and internal lining.',
      keywords: [
        'luggage', 'luggage repair', 'suitcase', 'hard shell', 'polycarbonate',
        'crack', 'bumper', 'corner bumper', 'frame', 'dented luggage', 'lining'
      ],
      modalCategory: 'Luggage Repair',
      icon: Wrench,
    },
    {
      id: 'custom-bags',
      name: 'Customized Bags & Manufacturing',
      slug: 'customized-bag-maker-noida',
      categoryBadge: 'Custom Fabrication',
      description: 'Custom travel bags, corporate promotional backpacks, institute bags, and bespoke luggage creation.',
      keywords: [
        'custom', 'customized', 'custom bags', 'corporate bags', 'promotional bags',
        'bulk bags', 'manufacturer', 'bag maker', 'logo printing', 'fabrication'
      ],
      modalCategory: 'Customized Bags',
      icon: Sparkles,
    },
  ], []);

  // Filter items based on user query
  const filteredResults = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      return catalogItems.slice(0, 4); // Show top 4 services as featured suggestions
    }

    return catalogItems.filter((item) => {
      const matchName = item.name.toLowerCase().includes(trimmed);
      const matchDesc = item.description.toLowerCase().includes(trimmed);
      const matchKeywords = item.keywords.some((kw) => kw.toLowerCase().includes(trimmed));
      const matchBadge = item.categoryBadge.toLowerCase().includes(trimmed);
      return matchName || matchDesc || matchKeywords || matchBadge;
    });
  }, [query, catalogItems]);

  // Quick suggestion tags for 1-click discovery
  const quickTags = [
    { label: 'Wheels', query: 'wheels' },
    { label: 'Handles', query: 'handles' },
    { label: 'Locks', query: 'locks' },
    { label: 'Zippers', query: 'zipper' },
    { label: 'Luggage', query: 'luggage' },
    { label: 'Custom Bags', query: 'custom' },
  ];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Global keyboard shortcut ('/' or 'Cmd+K' / 'Ctrl+K') to trigger search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is currently typing in an input/textarea
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      if ((e.key === '/' && !isInput) || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSelect = (item: SearchItem) => {
    setIsOpen(false);
    if (onCloseMobile) onCloseMobile();
    onNavigate(item.slug);
  };

  const handleOpenModal = (e: React.MouseEvent, modalCategory: string) => {
    e.stopPropagation();
    setIsOpen(false);
    if (onCloseMobile) onCloseMobile();
    onOpenRequirementModal(modalCategory);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredResults.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < filteredResults.length) {
        handleSelect(filteredResults[selectedIndex]);
      } else if (filteredResults.length > 0) {
        handleSelect(filteredResults[0]);
      }
    }
  };

  const whatsappDirectHref = buildWhatsAppUrl(
    settings.whatsapp_number,
    `Hello Sakil Bag Store, I am searching for "${query}" on your website. Do you have this repair part or service available?`
  );

  return (
    <div
      ref={searchContainerRef}
      className={`relative ${isMobileModal ? 'w-full' : 'w-48 sm:w-64 lg:w-72 xl:w-80'}`}
    >
      {/* Search Bar Input Container */}
      <div className="relative flex items-center">
        <div className="absolute left-3 pointer-events-none text-neutral-400">
          <Search className="h-4 w-4" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search wheels, handles, locks..."
          className="w-full h-9 pl-9 pr-14 rounded-lg bg-neutral-900 border border-neutral-700/80 text-xs sm:text-sm text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors"
          aria-label="Search trolley wheels, handles, locks and bag repairs"
        />

        {/* Right side buttons & keyboard hint */}
        <div className="absolute right-2.5 flex items-center gap-1.5">
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setSelectedIndex(-1);
                inputRef.current?.focus();
              }}
              className="text-neutral-400 hover:text-white p-0.5 rounded transition-colors"
              aria-label="Clear search query"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-neutral-400 bg-neutral-800 rounded border border-neutral-700">
              /
            </kbd>
          )}
        </div>
      </div>

      {/* Dropdown Results Box */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 z-50 rounded-xl bg-neutral-900/98 border border-neutral-800 shadow-2xl backdrop-blur-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 min-w-[300px] sm:min-w-[360px] md:min-w-[420px]">
          {/* Quick filter suggestion pills */}
          <div className="px-3 py-2 bg-neutral-950/60 border-b border-neutral-800/80">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 block mb-1.5">
              Quick Searches
            </span>
            <div className="flex flex-wrap gap-1.5">
              {quickTags.map((tag) => (
                <button
                  key={tag.label}
                  type="button"
                  onClick={() => {
                    setQuery(tag.query);
                    setIsOpen(true);
                    inputRef.current?.focus();
                  }}
                  className={`text-[11px] font-medium px-2 py-0.5 rounded-full border transition-all ${
                    query.toLowerCase() === tag.query.toLowerCase()
                      ? 'bg-orange-500/20 text-orange-400 border-orange-500/40'
                      : 'bg-neutral-800/80 text-neutral-300 border-neutral-700 hover:bg-neutral-700 hover:text-white'
                  }`}
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </div>

          {/* Results List */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-neutral-800/50 p-1">
            {filteredResults.length > 0 ? (
              filteredResults.map((item, index) => {
                const IconComponent = item.icon;
                const isSelected = index === selectedIndex;

                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`group flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-neutral-800 text-white'
                        : 'hover:bg-neutral-800/70 text-neutral-200'
                    }`}
                  >
                    <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20 shrink-0 mt-0.5">
                      <IconComponent className="h-4 w-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs sm:text-sm font-semibold text-white truncate group-hover:text-orange-400 transition-colors">
                          {item.name}
                        </h4>
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-neutral-300 shrink-0">
                          {item.categoryBadge}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-400 line-clamp-2 mt-0.5">
                        {item.description}
                      </p>

                      {/* Action buttons inside result item */}
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelect(item);
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-orange-400 hover:text-orange-300 transition-colors"
                        >
                          <span>View Details</span>
                          <ArrowRight className="h-3 w-3" />
                        </button>

                        <span className="text-neutral-600 text-xs">·</span>

                        <button
                          type="button"
                          onClick={(e) => handleOpenModal(e, item.modalCategory)}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-300 hover:text-white transition-colors"
                        >
                          <span>Send Requirement</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              /* No direct result found */
              <div className="p-4 text-center">
                <p className="text-xs text-neutral-300 font-medium">
                  No exact match found for <span className="text-orange-400 font-semibold">"{query}"</span>.
                </p>
                <p className="text-[11px] text-neutral-400 mt-1 max-w-xs mx-auto">
                  Mohd Shakil can arrange almost all luggage parts, bespoke fittings, and repair solutions.
                </p>

                <div className="mt-3 flex items-center justify-center gap-2">
                  <a
                    href={whatsappDirectHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsOpen(false)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-colors"
                  >
                    <MessageSquare className="h-3.5 w-3.5 fill-current" />
                    <span>Ask on WhatsApp</span>
                  </a>

                  <button
                    type="button"
                    onClick={(e) => handleOpenModal(e, 'Trolley Wheels')}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold border border-neutral-700 transition-colors"
                  >
                    <span>Submit Requirement</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer help tip */}
          <div className="px-3 py-1.5 bg-neutral-950/80 border-t border-neutral-800/80 flex items-center justify-between text-[10px] text-neutral-400">
            <span>Specialist repair workshop in Sector 22, Noida</span>
            <div className="hidden sm:flex items-center gap-2">
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-neutral-800 rounded border border-neutral-700 font-mono text-[9px]">↓</kbd>
                <kbd className="px-1 py-0.5 bg-neutral-800 rounded border border-neutral-700 font-mono text-[9px]">↑</kbd> to navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-neutral-800 rounded border border-neutral-700 font-mono text-[9px]">
                  <CornerDownLeft className="h-2.5 w-2.5 inline" />
                </kbd> to select
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
