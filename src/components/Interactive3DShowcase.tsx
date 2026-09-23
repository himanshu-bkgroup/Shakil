import React, { useState } from 'react';
import { Disc, MoveVertical, KeyRound, Wrench, ShieldCheck, HelpCircle } from 'lucide-react';
import { IMAGES } from '../lib/images';

export const Interactive3DShowcase: React.FC<{ onSelectService: (service: string) => void }> = ({ onSelectService }) => {
  const [activeTab, setActiveTab] = useState<'wheels' | 'handles' | 'locks' | 'bags'>('wheels');

  const components = {
    wheels: {
      title: 'Trolley Wheel Anatomy & Replacement',
      subtitle: 'Precision 360° Spinner & Inline Casters',
      description: 'We stock and fit dual-bearing polyurethane wheels with reinforced axle pins. Bring your wheel or measure outer diameter, wheel width, and center axle pin size.',
      specs: [
        { label: 'Standard Diameters', value: '40mm, 45mm, 50mm, 55mm, 60mm' },
        { label: 'Axle Bolt Diameter', value: '6mm heavy-gauge hardened steel' },
        { label: 'Wheel Material', value: 'Shock-absorbing Polyurethane (PU)' },
        { label: 'Bearing Type', value: 'Sealed smooth-glide ball bearings' },
      ],
      serviceTarget: 'Trolley Wheels',
      image: IMAGES.wheels,
      action: 'Check Wheel Compatibility',
    },
    handles: {
      title: 'Telescopic Pull-Up Handle Mechanisms',
      subtitle: 'Internal Aluminum Tubing & Lock Buttons',
      description: 'Multi-stage telescopic handles commonly jam due to bent inner tube rods or broken release trigger springs. We replace handles or fix jammed internal locking pins.',
      specs: [
        { label: 'Rod Construction', value: 'Aviation-grade lightweight aluminum alloy' },
        { label: 'Mechanism', value: 'Dual-stage & three-stage button lock' },
        { label: 'Mounting Types', value: 'Internal concealed rod / external rear bracket' },
        { label: 'Luggage Sizes', value: '20" Cabin, 24" Medium, 28" Check-in' },
      ],
      serviceTarget: 'Trolley Handle',
      image: IMAGES.handleLocks,
      action: 'Check Handle Replacement',
    },
    locks: {
      title: 'Trolley Locks & Luggage Hardware',
      subtitle: 'Combination Locks & Slider Latches',
      description: 'Broken zip pullers or jammed combination dials? We fit surface combination locks, TSA-type luggage hardware, zipper lock clasps, and heavy-duty slider pullers.',
      specs: [
        { label: 'Lock Types', value: '3-digit custom combination, TSA-type' },
        { label: 'Body Material', value: 'High-impact ABS & zinc alloy casing' },
        { label: 'Zipper Sliders', value: '#5, #8, #10 heavy duty metal runners' },
        { label: 'Mounting', value: 'Flush mount & recessed rivet installation' },
      ],
      serviceTarget: 'Trolley Lock',
      image: IMAGES.handleLocks,
      action: 'Check Lock Requirement',
    },
    bags: {
      title: 'Specialist Bag & Luggage Repair',
      subtitle: 'Heavy-Duty Stitching & Seam Reinforcement',
      description: 'From torn luggage seams and blown zippers to reinforced duffle straps and broken buckles, Mohd Shakil personally inspects and restores bags with industrial machines.',
      specs: [
        { label: 'Zipper Repairs', value: 'Full zipper track replacement & slider re-alignment' },
        { label: 'Stitching', value: 'Bonded nylon thread for extreme tensile strength' },
        { label: 'Materials Serviced', value: 'Ballistic nylon, canvas, leather, ABS, polycarbonate' },
        { label: 'Custom Bags', value: 'Custom fabrication & bulk order support' },
      ],
      serviceTarget: 'Bag Repair',
      image: IMAGES.bagRepair,
      action: 'Send Bag Repair Requirement',
    },
  };

  const current = components[activeTab];

  return (
    <div className="rounded-3xl border border-neutral-800 bg-gradient-to-b from-neutral-900/90 to-neutral-950 p-6 sm:p-10 shadow-2xl backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-orange-400 mb-2">
            Interactive Hardware Explorer
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Inspect Trolley Parts & Components
          </h2>
          <p className="text-sm text-neutral-400 mt-1 max-w-xl">
            Select a component below to explore measurement standards and replacement specifications at Sakil Bag Store.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap gap-1 p-1 bg-neutral-950 rounded-xl border border-neutral-800 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('wheels')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'wheels' ? 'bg-orange-600 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Disc className="h-3.5 w-3.5" />
            <span>Trolley Wheels</span>
          </button>
          <button
            onClick={() => setActiveTab('handles')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'handles' ? 'bg-orange-600 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <MoveVertical className="h-3.5 w-3.5" />
            <span>Handles</span>
          </button>
          <button
            onClick={() => setActiveTab('locks')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'locks' ? 'bg-orange-600 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <KeyRound className="h-3.5 w-3.5" />
            <span>Locks</span>
          </button>
          <button
            onClick={() => setActiveTab('bags')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'bags' ? 'bg-orange-600 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Wrench className="h-3.5 w-3.5" />
            <span>Bag Repair</span>
          </button>
        </div>
      </div>

      {/* Main 3D Card Display */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Visual Showcase with 3D Depth Card */}
        <div className="lg:col-span-6 relative perspective-1000 group">
          <div className="relative overflow-hidden rounded-2xl border border-neutral-700/80 bg-neutral-900 shadow-2xl transition-transform duration-500 transform lg:group-hover:rotate-y-2 lg:group-hover:scale-[1.01]">
            <img
              src={current.image}
              alt={current.title}
              referrerPolicy="no-referrer"
              className="h-72 sm:h-80 w-full object-cover object-center filter brightness-95"
            />
            {/* Subtle Gradient Scrim */}
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />

            {/* Float Badge */}
            <div className="absolute top-4 left-4 rounded-md bg-neutral-950/80 backdrop-blur-md border border-neutral-700/80 px-3 py-1.5 text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-orange-400" />
              <span>Inspection Ready at Sector 22, Noida</span>
            </div>

            <div className="absolute bottom-4 left-4 right-4">
              <div className="text-xs font-medium text-orange-400">{current.subtitle}</div>
              <h3 className="text-lg font-bold text-white tracking-tight">{current.title}</h3>
            </div>
          </div>
        </div>

        {/* Spec Sheet & Details */}
        <div className="lg:col-span-6 space-y-6">
          <p className="text-sm text-neutral-300 leading-relaxed">
            {current.description}
          </p>

          <div className="space-y-3 rounded-xl border border-neutral-800 bg-neutral-950/70 p-4">
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Technical Specifications & Standards
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {current.specs.map((item, idx) => (
                <div key={idx} className="rounded-lg bg-neutral-900/80 p-2.5 border border-neutral-800">
                  <div className="text-neutral-400 text-[11px]">{item.label}</div>
                  <div className="text-neutral-100 font-semibold mt-0.5">{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={() => onSelectService(current.serviceTarget)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-orange-600 hover:bg-orange-500 px-5 py-3 text-xs font-bold text-white shadow-md transition-colors"
            >
              <span>{current.action}</span>
            </button>
            <div className="text-xs text-neutral-400 flex items-center gap-1">
              <HelpCircle className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
              <span>Bring your bag or trolley for instant fitting.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
