import React from 'react';
import { Disc, Wrench, Shield, ShoppingBag, Layers, Truck, Check } from 'lucide-react';

interface TrustSectionProps {
  onSelectCategory: (category: string) => void;
}

export const TrustSection: React.FC<TrustSectionProps> = ({ onSelectCategory }) => {
  const categories = [
    {
      title: 'Trolley Problems',
      icon: Disc,
      description: 'Broken spinner wheels, cracked wheel bases, jammed telescopic handles, stuck zipper tracks, and loose bottom studs.',
      actionCategory: 'Trolley Repair',
    },
    {
      title: 'Bag Problems',
      icon: Wrench,
      description: 'Separated zipper teeth, broken slider pullers, ripped backpack strap seams, torn lining, and broken clip buckles.',
      actionCategory: 'Bag Repair',
    },
    {
      title: 'Replacement Parts',
      icon: Layers,
      description: 'Precise replacement trolley wheels (40mm to 70mm), single & dual casters, telescopic aluminum handle assemblies, and TSA combination locks.',
      actionCategory: 'Trolley Parts',
    },
    {
      title: 'Repair Requirements',
      icon: Shield,
      description: 'Direct repair work carried out at our store in Sector 22, Noida with industrial stitching machinery and specialized hardware tools.',
      actionCategory: 'Luggage Repair',
    },
    {
      title: 'Custom Bag Requirements',
      icon: ShoppingBag,
      description: 'Enquiries for custom travel bags, utility backpacks, corporate gifting bags, and special dimension fabrications.',
      actionCategory: 'Custom Bags',
    },
    {
      title: 'Bulk Enquiries',
      icon: Truck,
      description: 'Bulk spare parts and hardware supply for luggage technicians, retail repair counters, and commercial institutional requirements.',
      actionCategory: 'Bulk Requirement',
    },
  ];

  return (
    <section className="py-16 sm:py-20 border-b border-neutral-800/80 bg-neutral-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs font-bold uppercase tracking-wider text-orange-400 mb-2">
            Clear Scope of Work
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-white">
            What We Help With
          </h2>
          <p className="text-sm text-neutral-400 mt-2">
            Straightforward assistance for bag repairs, trolley component replacements, and custom requirements in Noida.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-neutral-800/80 bg-neutral-900/60 p-6 hover:border-neutral-700 hover:bg-neutral-900 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="h-10 w-10 rounded-lg bg-neutral-800 border border-neutral-700/80 flex items-center justify-center text-orange-400 mb-4">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-neutral-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-neutral-500">Sector 22, Noida Store</span>
                  <button
                    onClick={() => onSelectCategory(item.actionCategory)}
                    className="text-xs font-semibold text-orange-400 hover:text-orange-300 transition-colors"
                  >
                    Send Requirement →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
