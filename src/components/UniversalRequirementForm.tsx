import React, { useState } from 'react';
import { Upload, MessageSquare, CheckCircle, AlertCircle, Phone, ArrowRight, X } from 'lucide-react';
import type { BusinessSettings, Enquiry } from '../types';
import { submitEnquiry, trackAnalyticsEvent } from '../lib/supabase';
import { generateWhatsAppMessage, buildWhatsAppUrl } from '../lib/whatsapp';

interface UniversalRequirementFormProps {
  settings: BusinessSettings;
  initialServiceType?: string;
  sourcePage?: string;
  onSuccess?: (enquiry: Enquiry) => void;
  isModal?: boolean;
  onClose?: () => void;
}

export const UniversalRequirementForm: React.FC<UniversalRequirementFormProps> = ({
  settings,
  initialServiceType = 'Trolley Wheels',
  sourcePage = '/',
  onSuccess,
  isModal = false,
  onClose,
}) => {
  const [requirementType, setRequirementType] = useState<string>(initialServiceType);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [brand, setBrand] = useState('');
  const [trolleyType, setTrolleyType] = useState('Hard Shell Cabin (20-22 inch)');
  const [message, setMessage] = useState('');
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);

  // Wheel specific fields
  const [wheelDiameter, setWheelDiameter] = useState('50mm');
  const [wheelWidth, setWheelWidth] = useState('18mm');
  const [axleDiameter, setAxleDiameter] = useState('6mm');
  const [axleLength, setAxleLength] = useState('35mm');
  const [wheelType, setWheelType] = useState('Dual Spinner (360-deg)');
  const [quantity, setQuantity] = useState('2');
  const [problem, setProblem] = useState('');

  // Handle specific fields
  const [handleType, setHandleType] = useState('Telescopic Pull Rod Handle');
  const [handleLength, setHandleLength] = useState('');

  // Lock specific fields
  const [lockType, setLockType] = useState('3-Digit Combination Lock');

  // Parts specific fields
  const [partName, setPartName] = useState('');
  const [partSize, setPartSize] = useState('');

  // Custom bag fields
  const [bagType, setBagType] = useState('Duffle Bag / Travel Bag');
  const [customization, setCustomization] = useState('');

  // Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedEnquiry, setSubmittedEnquiry] = useState<Enquiry | null>(null);
  const [whatsAppUrl, setWhatsAppUrl] = useState('');

  const requirementOptions = [
    'Trolley Wheels',
    'Trolley Handle',
    'Trolley Lock',
    'Trolley Parts',
    'Trolley Repair',
    'Bag Repair',
    'Luggage Repair',
    'Custom Bags',
    'Bulk Requirement',
  ];

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setErrorMsg('Image size must be under 8MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setAttachmentPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Please enter your full name');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Compile service-specific metadata
      let requirementData: Record<string, any> = {};

      if (requirementType.includes('Wheel')) {
        requirementData = {
          brand,
          trolley_type: trolleyType,
          wheel_diameter: wheelDiameter,
          wheel_width: wheelWidth,
          axle_diameter: axleDiameter,
          axle_length: axleLength,
          wheel_type: wheelType,
          quantity,
          problem,
        };
      } else if (requirementType.includes('Handle')) {
        requirementData = {
          brand,
          handle_type: handleType,
          length: handleLength,
          quantity,
          problem,
        };
      } else if (requirementType.includes('Lock')) {
        requirementData = {
          brand,
          lock_type: lockType,
          bag_type: trolleyType,
          quantity,
          problem,
        };
      } else if (requirementType.includes('Part')) {
        requirementData = {
          part_name: partName,
          size: partSize,
          brand,
          quantity,
        };
      } else if (requirementType.includes('Custom')) {
        requirementData = {
          bag_type: bagType,
          quantity,
          customization,
        };
      } else {
        requirementData = {
          brand,
          bag_type: bagType,
          problem,
          quantity,
        };
      }

      // 2. Save enquiry to Supabase
      const enquiry = await submitEnquiry({
        name,
        phone: cleanPhone,
        requirement_type: requirementType,
        requirement_data: requirementData,
        message,
        attachment_url: attachmentPreview || undefined,
        source_page: sourcePage,
      });

      // 3. Generate WhatsApp message
      const generatedMessage = generateWhatsAppMessage({
        name,
        phone: cleanPhone,
        serviceType: requirementType,
        data: requirementData,
        message,
      });

      // 4. Construct WhatsApp URL
      const waUrl = buildWhatsAppUrl(settings.whatsapp_number, generatedMessage);
      setWhatsAppUrl(waUrl);

      // 5. Track analytics event
      trackAnalyticsEvent({
        event_name: 'requirement_submitted',
        page_url: sourcePage,
        metadata: {
          requirement_type: requirementType,
          phone: cleanPhone,
        },
        session_id: 'sess-' + Math.random().toString(36).substring(2, 8),
      });

      setSubmittedEnquiry(enquiry);
      if (onSuccess) onSuccess(enquiry);

      // 6. Open WhatsApp automatically in new tab
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong. Please call us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submittedEnquiry) {
    return (
      <div className="rounded-2xl border border-emerald-800/60 bg-neutral-900/90 p-6 sm:p-8 text-center text-neutral-200 shadow-xl">
        <CheckCircle className="mx-auto h-12 w-12 text-emerald-400 mb-4" />
        <h3 className="font-heading text-xl font-bold text-white mb-2">
          Requirement Received Successfully!
        </h3>
        <p className="text-sm text-neutral-300 mb-6 max-w-md mx-auto">
          Your enquiry for <span className="font-semibold text-orange-400">{submittedEnquiry.requirement_type}</span> has been securely recorded. Mohd Shakil has been notified.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={whatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-5 py-3 text-xs font-bold text-white shadow-md transition-colors"
          >
            <MessageSquare className="h-4 w-4 fill-current" />
            <span>Open WhatsApp Chat Again</span>
          </a>

          <a
            href={`tel:${settings.phone.replace(/\D/g, '')}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 px-5 py-3 text-xs font-semibold text-neutral-200 transition-colors"
          >
            <Phone className="h-4 w-4 text-orange-400" />
            <span>Call Mohd Shakil Directly</span>
          </a>

          {isModal && onClose && (
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-3 text-xs font-medium text-neutral-400 hover:text-white"
            >
              Done
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative rounded-2xl border border-neutral-800 bg-neutral-900/95 p-6 sm:p-8 shadow-2xl backdrop-blur-md ${isModal ? 'max-w-2xl w-full max-h-[90vh] overflow-y-auto' : ''}`}>
      {isModal && onClose && (
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-neutral-400 hover:text-white rounded-lg focus:outline-none"
          aria-label="Close form"
        >
          <X className="h-5 w-5" />
        </button>
      )}

      <div className="mb-6">
        <h2 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-white mb-1">
          Send Your Bag / Trolley Requirement
        </h2>
        <p className="text-xs sm:text-sm text-neutral-400">
          Direct enquiry to Mohd Shakil at Sakil Bag Store, Sector 22 Noida.
        </p>
      </div>

      {errorMsg && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-rose-800/80 bg-rose-950/40 p-3 text-xs text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Service Type Selection */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-2">
            Select Requirement Category
          </label>
          <div className="flex flex-wrap gap-1.5">
            {requirementOptions.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setRequirementType(type)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                  requirementType === type
                    ? 'bg-orange-600 text-white font-semibold shadow-sm'
                    : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Contact Info (Always required) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Your Name <span className="text-orange-400">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rajesh Sharma"
              className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Mobile Phone Number <span className="text-orange-400">*</span>
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 98100 12345"
              className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-orange-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Dynamic Fields for Trolley Wheels */}
        {requirementType.includes('Wheel') && (
          <div className="space-y-4 rounded-xl border border-neutral-800 bg-neutral-950/60 p-4">
            <div className="text-xs font-semibold text-orange-400 uppercase tracking-wider">
              Wheel Sizing & Details
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Wheel Diameter</label>
                <select
                  value={wheelDiameter}
                  onChange={(e) => setWheelDiameter(e.target.value)}
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-2 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                >
                  <option value="40mm">40 mm</option>
                  <option value="45mm">45 mm</option>
                  <option value="50mm">50 mm (Standard)</option>
                  <option value="55mm">55 mm</option>
                  <option value="60mm">60 mm</option>
                  <option value="70mm+">70 mm or larger</option>
                  <option value="Not Sure">Not Sure / Bring to Store</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Wheel Width</label>
                <input
                  type="text"
                  value={wheelWidth}
                  onChange={(e) => setWheelWidth(e.target.value)}
                  placeholder="e.g. 18mm"
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-2.5 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Axle Hole Dia</label>
                <input
                  type="text"
                  value={axleDiameter}
                  onChange={(e) => setAxleDiameter(e.target.value)}
                  placeholder="e.g. 6mm"
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-2.5 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Axle Length</label>
                <input
                  type="text"
                  value={axleLength}
                  onChange={(e) => setAxleLength(e.target.value)}
                  placeholder="e.g. 35mm"
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-2.5 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Wheel Type</label>
                <select
                  value={wheelType}
                  onChange={(e) => setWheelType(e.target.value)}
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-2.5 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                >
                  <option value="Dual Spinner (360-deg)">Dual Spinner (360-deg)</option>
                  <option value="Single Spinner">Single Spinner</option>
                  <option value="Fixed Inline Wheel">Fixed Inline / Two-Wheel</option>
                  <option value="Corner Caster Wheel">Corner Caster Wheel</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Trolley Brand</label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g. VIP, Samsonite, Safari, etc."
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-2.5 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Quantity Needed</label>
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-2.5 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                >
                  <option value="1">1 Wheel</option>
                  <option value="2">2 Wheels (Pair)</option>
                  <option value="4">4 Wheels (Full Set)</option>
                  <option value="8+">Bulk / 8+ Wheels</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Fields for Trolley Handle */}
        {requirementType.includes('Handle') && (
          <div className="space-y-4 rounded-xl border border-neutral-800 bg-neutral-950/60 p-4">
            <div className="text-xs font-semibold text-orange-400 uppercase tracking-wider">
              Trolley Handle Details
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Handle Type</label>
                <select
                  value={handleType}
                  onChange={(e) => setHandleType(e.target.value)}
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-2.5 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                >
                  <option value="Telescopic Pull Rod">Telescopic Pull Rod Handle</option>
                  <option value="Top Carry Grip Handle">Top Carry Grip Handle</option>
                  <option value="Side Carry Handle">Side Carry Handle</option>
                  <option value="Internal Aluminum Tube">Internal Tube Repair</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Approx. Length</label>
                <input
                  type="text"
                  value={handleLength}
                  onChange={(e) => setHandleLength(e.target.value)}
                  placeholder="e.g. 24 inch / 38 inch"
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-2.5 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Brand</label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g. American Tourister, Delsey"
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-2.5 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Fields for Locks */}
        {requirementType.includes('Lock') && (
          <div className="space-y-4 rounded-xl border border-neutral-800 bg-neutral-950/60 p-4">
            <div className="text-xs font-semibold text-orange-400 uppercase tracking-wider">
              Lock Requirement Details
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Lock Type</label>
                <select
                  value={lockType}
                  onChange={(e) => setLockType(e.target.value)}
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-2.5 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                >
                  <option value="3-Digit Built-in Combination Lock">3-Digit Built-in Combination</option>
                  <option value="TSA Compatible Surface Lock">TSA Compatible Lock</option>
                  <option value="Zipper Lock Slider Fitting">Zipper Lock Slider Fitting</option>
                  <option value="External Luggage Padlock">External Padlock</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Trolley / Bag Brand</label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g. VIP, Safari"
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-2.5 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Quantity</label>
                <input
                  type="text"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="e.g. 1"
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-2.5 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Fields for Parts */}
        {requirementType.includes('Part') && (
          <div className="space-y-4 rounded-xl border border-neutral-800 bg-neutral-950/60 p-4">
            <div className="text-xs font-semibold text-orange-400 uppercase tracking-wider">
              Trolley Spare Part Details
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Part Name</label>
                <input
                  type="text"
                  value={partName}
                  onChange={(e) => setPartName(e.target.value)}
                  placeholder="e.g. Bottom Feet, Stud, Rod"
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-2.5 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Approximate Dimensions</label>
                <input
                  type="text"
                  value={partSize}
                  onChange={(e) => setPartSize(e.target.value)}
                  placeholder="e.g. 5cm x 3cm"
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-2.5 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Quantity</label>
                <input
                  type="text"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="e.g. 4 pieces"
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-2.5 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Fields for Custom Bags */}
        {requirementType.includes('Custom') && (
          <div className="space-y-4 rounded-xl border border-neutral-800 bg-neutral-950/60 p-4">
            <div className="text-xs font-semibold text-orange-400 uppercase tracking-wider">
              Customized Bag Specifications
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Bag Type</label>
                <select
                  value={bagType}
                  onChange={(e) => setBagType(e.target.value)}
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-2.5 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                >
                  <option value="Duffle / Travel Bag">Duffle / Travel Bag</option>
                  <option value="Corporate / Laptop Backpack">Corporate / Laptop Backpack</option>
                  <option value="School / College Bag">School / College Bag</option>
                  <option value="Utility / Tool Bag">Utility / Tool Bag</option>
                  <option value="Promotional Bag">Promotional / Event Bag</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Estimated Quantity</label>
                <input
                  type="text"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="e.g. 50 pieces or 1 sample"
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-2.5 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">Customization Requirements</label>
              <input
                type="text"
                value={customization}
                onChange={(e) => setCustomization(e.target.value)}
                placeholder="e.g. Custom logo print, water resistant fabric, specific dimensions"
                className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-2.5 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Problem or Requirement Details */}
        <div>
          <label className="block text-xs font-medium text-neutral-300 mb-1">
            Describe Problem or Specific Requirement
          </label>
          <textarea
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="e.g. Need replacement for cracked wheel base, zipper chain separated, handle doesn't lock in place..."
            className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3.5 py-2 text-sm text-white placeholder-neutral-500 focus:border-orange-500 focus:outline-none"
          />
        </div>

        {/* Photo Upload */}
        <div>
          <label className="block text-xs font-medium text-neutral-300 mb-1">
            Attach Photo of Damaged Part / Bag (Optional but Recommended)
          </label>
          <div className="flex items-center gap-3">
            <label className="cursor-pointer inline-flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 px-4 py-2 text-xs font-medium text-neutral-200 transition-colors">
              <Upload className="h-4 w-4 text-orange-400" />
              <span>Choose Photo</span>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
            {attachmentPreview && (
              <div className="relative">
                <img
                  src={attachmentPreview}
                  alt="Attachment preview"
                  className="h-10 w-10 object-cover rounded-lg border border-neutral-700"
                />
                <button
                  type="button"
                  onClick={() => setAttachmentPreview(null)}
                  className="absolute -top-1.5 -right-1.5 bg-neutral-900 text-neutral-400 hover:text-white rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            <span className="text-[11px] text-neutral-500">
              Helps Mohd Shakil verify compatibility instantly.
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-orange-600 hover:bg-orange-500 disabled:opacity-50 px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-all"
          >
            <MessageSquare className="h-4 w-4 fill-current" />
            <span>
              {isSubmitting
                ? 'Saving & Preparing WhatsApp...'
                : requirementType.includes('Wheel')
                ? 'SEND WHEEL REQUIREMENT ON WHATSAPP'
                : 'SEND REQUIREMENT ON WHATSAPP'}
            </span>
            <ArrowRight className="h-4 w-4 ml-1" />
          </button>
          <p className="mt-2 text-center text-[11px] text-neutral-500">
            Saves your enquiry safely to our system and opens WhatsApp with your pre-formatted requirement.
          </p>
        </div>
      </form>
    </div>
  );
};
