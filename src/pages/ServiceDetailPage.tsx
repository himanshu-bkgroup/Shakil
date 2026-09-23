import React, { useEffect } from 'react';
import { MapPin, Phone, MessageSquare, ArrowLeft, Disc, MoveVertical, KeyRound, Wrench, ShieldCheck, CheckCircle2 } from 'lucide-react';
import type { BusinessSettings } from '../types';
import { UniversalRequirementForm } from '../components/UniversalRequirementForm';
import { buildWhatsAppUrl } from '../lib/whatsapp';
import { trackAnalyticsEvent } from '../lib/supabase';
import { IMAGES } from '../lib/images';

interface ServiceDetailPageProps {
  slug: string;
  settings: BusinessSettings;
  onNavigate: (path: string) => void;
}

export const ServiceDetailPage: React.FC<ServiceDetailPageProps> = ({
  slug,
  settings,
  onNavigate,
}) => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    trackAnalyticsEvent({
      event_name: 'service_view',
      page_url: `/${slug}`,
      session_id: 'page-' + slug,
    });
  }, [slug]);

  // Content configuration for each exact route specified in prompt
  const getPageConfig = () => {
    switch (slug) {
      case 'trolley-wheel-repair-noida':
        return {
          title: 'Trolley Wheel Repair & Replacement in Noida',
          seoTitle: 'Trolley Wheel Repair & Replacement in Noida | Sakil Bag Store',
          h1: 'Trolley Wheel Repair & Replacement in Noida',
          subtitle: 'Precision replacement wheels, dual spinner casters, bearings & axles for all luggage brands in Sector 22, Noida.',
          heroImage: IMAGES.wheels,
          requirementCategory: 'Trolley Wheels',
          breadcrumbs: ['Home', 'Services', 'Trolley Wheels'],
          keyPoints: [
            'Single & 360-degree dual spinner wheels in stock',
            'Standard sizes: 40mm, 45mm, 50mm, 55mm, 60mm & 70mm',
            'Heavy-gauge 6mm hardened steel replacement axle bolts',
            'Polyurethane rubber tread for silent, smooth gliding',
            'Direct inspection & physical fitting by Mohd Shakil',
          ],
          guideTitle: 'How to Measure Your Trolley Wheel Before Visiting',
          guideSteps: [
            {
              step: '01',
              title: 'Measure Wheel Diameter',
              desc: 'Measure the outer circle diameter of the wheel in millimeters using a ruler or caliper. Standard sizes are 45mm, 50mm, or 55mm.',
            },
            {
              step: '02',
              title: 'Check Wheel Thickness & Axle Hole',
              desc: 'Measure the wheel tread width (typically 18mm) and the axle pin hole diameter (standard is 6mm).',
            },
            {
              step: '03',
              title: 'Photograph the Wheel Mounting',
              desc: 'Take a clear photograph of the base screw bracket or rivet. Send it directly via our form or WhatsApp below.',
            },
          ],
        };

      case 'trolley-handle-repair-noida':
        return {
          title: 'Trolley Handle Repair & Replacement in Noida',
          seoTitle: 'Trolley Handle Repair & Replacement in Noida | Sakil Bag Store',
          h1: 'Trolley Handle Repair & Replacement in Noida',
          subtitle: 'Telescopic pull-up handles, top carrying handles, side grip handles, and internal rod repairs.',
          heroImage: IMAGES.handleLocks,
          requirementCategory: 'Trolley Handle',
          breadcrumbs: ['Home', 'Services', 'Trolley Handle Repair'],
          keyPoints: [
            '2-stage and 3-stage telescopic pull-up aluminum rods',
            'Top and side molded ergonomic grip handles',
            'Fixing stuck push-button triggers and jammed locking pins',
            'Straightening or replacing bent inner alloy tubes',
            'Available for cabin (20"), medium (24"), and large (28") luggage',
          ],
          guideTitle: 'Common Trolley Handle Problems We Resolve',
          guideSteps: [
            {
              step: '01',
              title: 'Jammed Push-Button',
              desc: 'When the top handle button refuses to depress, the internal trigger cable or spring is displaced or broken.',
            },
            {
              step: '02',
              title: 'Bent or Stuck Telescopic Rod',
              desc: 'Rough handling at airports can bow the inner tube. We realign or replace the entire rod assembly.',
            },
            {
              step: '03',
              title: 'Broken Top / Side Carry Handle',
              desc: 'Rubber or plastic handles that tore under heavy load can be replaced with reinforced screws and back-plates.',
            },
          ],
        };

      case 'trolley-bag-repair-noida':
        return {
          title: 'Trolley Bag Repair in Noida',
          seoTitle: 'Trolley Bag Repair in Noida | Sakil Bag Store',
          h1: 'Trolley Bag Repair in Noida',
          subtitle: 'Comprehensive luggage & trolley repair workshop in Sector 22, Noida run by Mohd Shakil.',
          heroImage: IMAGES.hero,
          requirementCategory: 'Trolley Repair',
          breadcrumbs: ['Home', 'Services', 'Trolley Bag Repair'],
          keyPoints: [
            'Broken wheel replacement & axle realignment',
            'Damaged telescopic handle mechanism repair',
            'TSA & combination lock repair or replacement',
            'Hard-shell crack reinforcement and bumper fitting',
            'Heavy-duty zipper track stitching & slider renewal',
          ],
          guideTitle: 'Complete Trolley Repair Services in Sector 22, Noida',
          guideSteps: [
            {
              step: '01',
              title: 'Inspect Damaged Component',
              desc: 'Whether wheels, handle, or zip track, check if the mounting bracket is intact.',
            },
            {
              step: '02',
              title: 'Send Requirement or Photo',
              desc: 'Use our instant form to send a photo and details to Mohd Shakil for immediate assessment.',
            },
            {
              step: '03',
              title: 'Visit Store for Direct Fitting',
              desc: 'Bring your trolley to Chaura Raghunathpur, Sector 22, Noida for hands-on repair and testing.',
            },
          ],
        };

      case 'trolley-bag-locks-noida':
        return {
          title: 'Trolley & Luggage Locks in Noida',
          seoTitle: 'Trolley & Luggage Locks in Noida | Sakil Bag Store',
          h1: 'Trolley & Luggage Locks in Noida',
          subtitle: 'Replacement combination locks, TSA-type hardware, zipper puller locks, and latches.',
          heroImage: IMAGES.handleLocks,
          requirementCategory: 'Trolley Lock',
          breadcrumbs: ['Home', 'Services', 'Trolley Locks'],
          keyPoints: [
            '3-digit built-in combination locks for hard and soft luggage',
            'TSA compatible surface-mounted lock replacements',
            'Zipper runner lock clips and slider eyelets',
            'Safe combination reset assistance at store',
            'Heavy-duty alloy hardware without fake brand claims',
          ],
          guideTitle: 'Lock Replacement Options',
          guideSteps: [
            {
              step: '01',
              title: 'Combination Dial Jammed',
              desc: 'If dials are stuck or code is locked, we can inspect and safely release or replace the lock unit.',
            },
            {
              step: '02',
              title: 'Broken Zipper Puller Eyelet',
              desc: 'If the lock mechanism is fine but the slider tab snapped off, we fit replacement metal sliders.',
            },
            {
              step: '03',
              title: 'Surface Lock Replacement',
              desc: 'We match screw mounting holes so new locks install cleanly without drilling excess holes.',
            },
          ],
        };

      case 'trolley-parts-supplier-noida':
        return {
          title: 'Trolley Parts Supplier in Noida',
          seoTitle: 'Trolley Parts Supplier in Noida | Sakil Bag Store',
          h1: 'Trolley Parts Supplier in Noida',
          subtitle: 'Supplier of replacement trolley wheels, telescopic handles, locks, base studs, and spare components in Noida.',
          heroImage: IMAGES.wheels,
          requirementCategory: 'Trolley Parts',
          breadcrumbs: ['Home', 'Services', 'Trolley Parts Supplier'],
          keyPoints: [
            'Wheels, handles, locks, fasteners, and corner bumpers',
            'Retail enquiries & bulk supplier options for workshops',
            'Accurate dimension matching for seamless fit',
            'Direct store pickup in Sector 22, Noida',
            'WhatsApp parts verification service',
          ],
          guideTitle: 'Finding the Right Spare Parts',
          guideSteps: [
            {
              step: '01',
              title: 'Identify Part & Dimensions',
              desc: 'Note whether you need wheels, telescopic tubes, carry handles, or base bumpers.',
            },
            {
              step: '02',
              title: 'Share Part Image',
              desc: 'Send a photo of the old damaged part alongside a scale or measurement tape.',
            },
            {
              step: '03',
              title: 'Confirm Fitment',
              desc: 'Mohd Shakil verifies screw spacing and axle alignment to ensure 100% correct fit.',
            },
          ],
        };

      case 'bag-repair-noida':
        return {
          title: 'Bag Repair in Noida',
          seoTitle: 'Bag Repair in Noida | Sakil Bag Store',
          h1: 'Bag Repair in Noida',
          subtitle: 'Expert repair of backpacks, laptop bags, travel duffles, gym bags, zippers, and heavy stitching in Sector 22, Noida.',
          heroImage: IMAGES.bagRepair,
          requirementCategory: 'Bag Repair',
          breadcrumbs: ['Home', 'Services', 'Bag Repair'],
          keyPoints: [
            'Zipper slider (runner) replacement on the spot',
            'Full zipper track replacement with industrial thread',
            'Shoulder strap reinforcement & heavy seam stitching',
            'Plastic buckle, clasp, and clip replacement',
            'Tear patching and ballistic fabric reinforcement',
          ],
          guideTitle: 'Common Bag Repair Solutions',
          guideSteps: [
            {
              step: '01',
              title: 'Zipper Splitting Open',
              desc: 'If teeth open behind the slider, replacing the worn metal slider usually restores the zip immediately.',
            },
            {
              step: '02',
              title: 'Ripped Strap Seams',
              desc: 'Heavy books or laptops pull straps loose. We restitch with bonded nylon thread and back reinforcement.',
            },
            {
              step: '03',
              title: 'Damaged Linings & Buckles',
              desc: 'Cracked quick-release buckles and torn interior divider linings replaced neatly.',
            },
          ],
        };

      case 'luggage-repair-noida':
        return {
          title: 'Luggage Repair in Noida',
          seoTitle: 'Luggage Repair in Noida | Sakil Bag Store',
          h1: 'Luggage Repair in Noida',
          subtitle: 'Professional travel luggage repair: hard-shell suitcases, soft-sided spinners, wheels, handles, and locks.',
          heroImage: IMAGES.hero,
          requirementCategory: 'Luggage Repair',
          breadcrumbs: ['Home', 'Services', 'Luggage Repair'],
          keyPoints: [
            'All travel luggage styles: spinner 4-wheel & 2-wheel uprights',
            'Corner protector replacement & crack stabilizing',
            'Internal lining zipper and cross-strap repair',
            'Telescopic rod realignment and grip replacements',
            'Conveniently located in Sector 22, Noida',
          ],
          guideTitle: 'Luggage Restoration Workflow',
          guideSteps: [
            {
              step: '01',
              title: 'Damage Inspection',
              desc: 'Check whether the body shell, zip line, or wheels sustained damage during travel.',
            },
            {
              step: '02',
              title: 'Direct WhatsApp Assessment',
              desc: 'Send clear pictures to Mohd Shakil for prompt advice on parts and repair feasibility.',
            },
            {
              step: '03',
              title: 'Quality Workshop Repair',
              desc: 'Repairs executed with appropriate hardware for safe future travel.',
            },
          ],
        };

      case 'customized-bag-maker-noida':
      default:
        return {
          title: 'Customized Bag Maker in Noida',
          seoTitle: 'Customized Bag Maker in Noida | Sakil Bag Store',
          h1: 'Customized Bag Maker in Noida',
          subtitle: 'Custom bag fabrication enquiries for corporate events, promotional bags, school/college bags, and travel duffels.',
          heroImage: IMAGES.customBags,
          requirementCategory: 'Custom Bags',
          breadcrumbs: ['Home', 'Services', 'Customized Bags'],
          keyPoints: [
            'Travel duffles, gym bags, and kit bags',
            'Corporate laptop backpacks and messenger bags',
            'Promotional giveaway bags with custom printing/embroidery',
            'Custom dimension utility and tool carrying bags',
            'Fabric choices: Ballistic nylon, heavy canvas, polyester',
          ],
          guideTitle: 'How to Submit a Customized Bag Enquiry',
          guideSteps: [
            {
              step: '01',
              title: 'Specify Bag Type & Dimensions',
              desc: 'State your intended use, approximate length/width/height, and required pockets.',
            },
            {
              step: '02',
              title: 'Provide Estimated Quantity',
              desc: 'Let us know if you need a prototype/single piece, 25 pieces, 100+ pieces, etc.',
            },
            {
              step: '03',
              title: 'Attach Reference Image',
              desc: 'Upload a sample photo or sketch of your desired design in the form below.',
            },
          ],
        };
    }
  };

  const page = getPageConfig();

  const directWhatsAppUrl = buildWhatsAppUrl(
    settings.whatsapp_number,
    `Hello Sakil Bag Store, I found your page for "${page.h1}" on Google. I need assistance with a requirement.`
  );

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 pb-20">
      {/* Breadcrumbs */}
      <div className="border-b border-neutral-800 bg-neutral-900/40">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-xs text-neutral-400">
            <button
              onClick={() => onNavigate('/')}
              className="hover:text-white transition-colors"
            >
              Home
            </button>
            <span>/</span>
            <button
              onClick={() => onNavigate('/#services')}
              className="hover:text-white transition-colors"
            >
              Services
            </button>
            <span>/</span>
            <span className="text-orange-400 font-medium">{page.title}</span>
          </nav>
        </div>
      </div>

      {/* Hero Header */}
      <div className="border-b border-neutral-800 bg-neutral-900/20 py-10 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <button
                onClick={() => onNavigate('/')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-white transition-colors mb-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Home</span>
              </button>

              <div className="text-xs font-mono text-orange-400 uppercase tracking-wider">
                Sakil Bag Store · Sector 22 Noida
              </div>

              <h1 className="font-heading text-2xl sm:text-4xl font-extrabold tracking-tight text-white text-balance">
                {page.h1}
              </h1>

              <p className="text-sm sm:text-base text-neutral-300 leading-relaxed max-w-2xl">
                {page.subtitle}
              </p>

              {/* Verified NAP Info Strip */}
              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-neutral-400">
                <div className="flex items-center gap-1.5 text-neutral-300">
                  <MapPin className="h-4 w-4 text-orange-400" />
                  <span>Sector 22, Noida</span>
                </div>
                <div className="flex items-center gap-1.5 text-neutral-300">
                  <Phone className="h-4 w-4 text-orange-400" />
                  <a href={`tel:${settings.phone.replace(/\D/g, '')}`} className="hover:text-white">
                    {settings.phone}
                  </a>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <MessageSquare className="h-4 w-4 fill-current" />
                  <a href={directWhatsAppUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    WhatsApp Available
                  </a>
                </div>
              </div>
            </div>

            {/* Visual Feature Card */}
            <div className="lg:col-span-5">
              <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 shadow-xl relative">
                <img
                  src={page.heroImage}
                  alt={page.title}
                  referrerPolicy="no-referrer"
                  className="h-64 sm:h-72 w-full object-cover object-center filter brightness-95"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="text-xs font-semibold text-orange-400">Direct Workshop Inspection</span>
                  <div className="text-sm font-bold text-white">Owner: Mohd Shakil</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area: Key Features + Universal Form */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Technical Details & Steps */}
          <div className="lg:col-span-7 space-y-10">
            {/* Key Service Highlights */}
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 sm:p-8">
              <h2 className="font-heading text-lg sm:text-xl font-bold text-white mb-4">
                Service Capabilities & Standards
              </h2>
              <ul className="space-y-3">
                {page.keyPoints.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-neutral-300">
                    <CheckCircle2 className="h-4 w-4 text-orange-400 shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Measurement & Process Guide */}
            <div className="space-y-6">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-orange-400 mb-1">
                  Practical Guidance
                </div>
                <h2 className="font-heading text-xl font-bold text-white">
                  {page.guideTitle}
                </h2>
              </div>

              <div className="space-y-4">
                {page.guideSteps.map((step) => (
                  <div
                    key={step.step}
                    className="flex gap-4 rounded-xl border border-neutral-800/80 bg-neutral-900/40 p-4 sm:p-5"
                  >
                    <span className="font-heading text-lg font-bold text-orange-500/80">
                      {step.step}
                    </span>
                    <div>
                      <h3 className="font-heading text-sm font-semibold text-white mb-1">
                        {step.title}
                      </h3>
                      <p className="text-xs text-neutral-400 leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Store Visit & Location Box */}
            <div className="rounded-2xl border border-neutral-800 bg-gradient-to-br from-neutral-900 to-neutral-950 p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-lg bg-orange-600/20 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-heading text-base font-bold text-white">
                    Visit SAKIL BAG STORE in Sector 22, Noida
                  </h3>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    {settings.address}
                  </p>
                  <p className="text-xs text-neutral-400">
                    Hours: {settings.opening_hours} · Phone: {settings.phone}
                  </p>
                  <div className="pt-2 flex flex-wrap gap-2">
                    <a
                      href={settings.google_maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 px-3.5 py-2 text-xs font-semibold text-white transition-colors"
                    >
                      <MapPin className="h-3.5 w-3.5 text-orange-400" />
                      <span>Get Directions via Google Maps</span>
                    </a>
                    <a
                      href={`tel:${settings.phone.replace(/\D/g, '')}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 px-3.5 py-2 text-xs font-medium text-neutral-200 transition-colors"
                    >
                      <Phone className="h-3.5 w-3.5 text-orange-400" />
                      <span>Call {settings.phone}</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Pre-configured Universal Requirement Form */}
          <div className="lg:col-span-5">
            <div className="sticky top-24">
              <UniversalRequirementForm
                settings={settings}
                initialServiceType={page.requirementCategory}
                sourcePage={`/${slug}`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
