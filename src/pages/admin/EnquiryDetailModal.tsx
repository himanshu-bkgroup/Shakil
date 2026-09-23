import React, { useState } from 'react';
import type { Enquiry, BusinessSettings } from '../../types';
import { X, Phone, MessageSquare, Sparkles, Clock, Check, Trash2, Calendar, FileText, Send } from 'lucide-react';
import { generateWhatsAppMessage, buildWhatsAppUrl } from '../../lib/whatsapp';
import { generateAIReply } from '../../lib/supabase';

interface EnquiryDetailModalProps {
  enquiry: Enquiry;
  settings: BusinessSettings;
  onClose: () => void;
  onUpdateStatus: (id: string, status: Enquiry['status'], priority: Enquiry['priority'], notes?: string) => void;
  onDelete: (id: string) => void;
}

export const EnquiryDetailModal: React.FC<EnquiryDetailModalProps> = ({
  enquiry,
  settings,
  onClose,
  onUpdateStatus,
  onDelete,
}) => {
  const [status, setStatus] = useState<Enquiry['status']>(enquiry.status);
  const [priority, setPriority] = useState<Enquiry['priority']>(enquiry.priority);
  const [adminNotes, setAdminNotes] = useState(enquiry.admin_notes || '');
  const [aiReply, setAiReply] = useState<string>('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const generatedWhatsAppMsg = generateWhatsAppMessage({
    name: enquiry.name,
    phone: enquiry.phone,
    serviceType: enquiry.requirement_type,
    data: enquiry.requirement_data,
    message: enquiry.message,
  });

  const directWhatsAppUrl = buildWhatsAppUrl(enquiry.phone, aiReply || `Hello ${enquiry.name}, this is Mohd Shakil from SAKIL BAG STORE (Sector 22, Noida) following up on your ${enquiry.requirement_type} requirement.`);

  const handleSave = () => {
    onUpdateStatus(enquiry.id, status, priority, adminNotes);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleGenerateReply = async () => {
    setIsGeneratingAi(true);
    try {
      const reply = await generateAIReply(enquiry);
      setAiReply(reply);
    } catch {
      setAiReply(`Hello ${enquiry.name}, thank you for contacting SAKIL BAG STORE (Sector 22, Noida). We received your requirement for ${enquiry.requirement_type}. Please share photos of the part or bring your bag to our store at Chaura Raghunathpur so we can inspect and assist you accurately.`);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative max-w-3xl w-full max-h-[90vh] bg-neutral-900 border border-neutral-800 rounded-3xl overflow-y-auto p-6 sm:p-8 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-neutral-400 hover:text-white rounded-lg focus:outline-none"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-neutral-800 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-orange-600/20 text-orange-400 border border-orange-500/30">
                {enquiry.requirement_type}
              </span>
              <span className="text-xs text-neutral-500">
                Source: {enquiry.source_page || '/'}
              </span>
            </div>
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-white">
              {enquiry.name}
            </h2>
            <div className="flex items-center gap-3 text-xs text-neutral-400 mt-1">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(enquiry.created_at).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`tel:${enquiry.phone}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-800 px-3.5 py-2 text-xs font-semibold text-white hover:bg-neutral-700 transition-colors"
            >
              <Phone className="h-3.5 w-3.5 text-orange-400" />
              <span>Call ({enquiry.phone})</span>
            </a>
            <a
              href={directWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3.5 py-2 text-xs font-semibold text-white transition-colors"
            >
              <MessageSquare className="h-3.5 w-3.5 fill-current" />
              <span>WhatsApp Reply</span>
            </a>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6 border-b border-neutral-800">
          {/* Left: Customer Data */}
          <div className="space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-orange-400">
              Requirement Parameters
            </div>
            <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 space-y-2 text-xs">
              {Object.entries(enquiry.requirement_data || {}).map(([key, val]) => (
                <div key={key} className="flex justify-between border-b border-neutral-900 pb-1.5 last:border-none">
                  <span className="text-neutral-400 capitalize">{key.replace(/_/g, ' ')}:</span>
                  <span className="text-white font-medium text-right">{String(val || 'N/A')}</span>
                </div>
              ))}
              {(!enquiry.requirement_data || Object.keys(enquiry.requirement_data).length === 0) && (
                <div className="text-neutral-500">No extra parameters specified.</div>
              )}
            </div>

            {enquiry.message && (
              <div>
                <div className="text-xs font-semibold text-neutral-400 mb-1">Customer Note:</div>
                <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3 text-xs text-neutral-200">
                  {enquiry.message}
                </div>
              </div>
            )}

            {enquiry.attachment_url && (
              <div>
                <div className="text-xs font-semibold text-neutral-400 mb-1">Attached Photo:</div>
                <img
                  src={enquiry.attachment_url}
                  alt="Customer luggage damage attachment"
                  className="h-36 w-full object-cover rounded-xl border border-neutral-800"
                />
              </div>
            )}
          </div>

          {/* Right: Status, Priority, AI Assistant */}
          <div className="space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-orange-400">
              Status & Priority Management
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-neutral-400 mb-1">Workflow Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                >
                  <option value="NEW">NEW</option>
                  <option value="CONTACTED">CONTACTED</option>
                  <option value="FOLLOW_UP">FOLLOW_UP</option>
                  <option value="CONVERTED">CONVERTED</option>
                  <option value="CLOSED">CLOSED</option>
                  <option value="SPAM">SPAM</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-neutral-400 mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                >
                  <option value="HIGH">HIGH (Urgent)</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="LOW">LOW</option>
                </select>
              </div>
            </div>

            {/* Admin Notes */}
            <div>
              <label className="block text-xs text-neutral-400 mb-1">Internal Admin Notes (Private)</label>
              <textarea
                rows={3}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="e.g. Quoted 50mm PU wheel pair, asked customer to bring trolley on Thursday afternoon..."
                className="w-full rounded-lg border border-neutral-700 bg-neutral-950 p-2.5 text-xs text-white placeholder-neutral-500 focus:border-orange-500 focus:outline-none"
              />
            </div>

            {/* AI Suggested Response */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-950/80 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-300">
                  <Sparkles className="h-3.5 w-3.5 text-orange-400" />
                  <span>Gemini AI Reply Generator</span>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateReply}
                  disabled={isGeneratingAi}
                  className="text-[11px] text-orange-400 hover:text-orange-300 font-medium"
                >
                  {isGeneratingAi ? 'Drafting...' : 'Generate Factual Reply'}
                </button>
              </div>

              {aiReply ? (
                <div className="text-xs text-neutral-300 bg-neutral-900 p-2.5 rounded-lg border border-neutral-800 leading-relaxed">
                  {aiReply}
                </div>
              ) : (
                <p className="text-[11px] text-neutral-500">
                  Drafts an accurate WhatsApp/SMS reply mentioning Sector 22 Noida store without inventing prices or fake stock.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={() => {
              if (confirm('Are you sure you want to delete this enquiry?')) {
                onDelete(enquiry.id);
                onClose();
              }
            }}
            className="text-xs text-rose-400 hover:text-rose-300 inline-flex items-center gap-1 self-start sm:self-auto"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete Enquiry</span>
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {savedSuccess && (
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <Check className="h-3.5 w-3.5" />
                <span>Saved!</span>
              </span>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-neutral-700 text-xs font-medium text-neutral-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="rounded-lg bg-orange-600 hover:bg-orange-500 px-5 py-2 text-xs font-bold text-white shadow-md transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
