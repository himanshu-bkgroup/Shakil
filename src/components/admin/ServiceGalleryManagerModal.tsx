import React, { useState } from 'react';
import { X, Image as ImageIcon, Star, Trash2, Eye, Plus, Check, Loader2 } from 'lucide-react';
import type { Service, GalleryItem } from '../../types';
import { BulkSingleImageUpload } from './BulkSingleImageUpload';

interface ServiceGalleryManagerModalProps {
  service: Service;
  allServices: Service[];
  onClose: () => void;
  onSaveService: (updated: Service) => Promise<void>;
  onAddGalleryItem?: (item: GalleryItem) => Promise<void>;
}

export const ServiceGalleryManagerModal: React.FC<ServiceGalleryManagerModalProps> = ({
  service,
  allServices,
  onClose,
  onSaveService,
  onAddGalleryItem,
}) => {
  const [currentGallery, setCurrentGallery] = useState<string[]>(service.gallery || []);
  const [coverImage, setCoverImage] = useState<string>(service.image_url || '');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // When a single photo is uploaded in the modal
  const handleSingleUpload = async (url: string, meta?: { title?: string; category?: string }) => {
    const updated = [...currentGallery, url];
    setCurrentGallery(updated);

    // If service has no cover, set this as cover
    let newCover = coverImage;
    if (!newCover) {
      newCover = url;
      setCoverImage(url);
    }

    setSaving(true);
    try {
      await onSaveService({
        ...service,
        image_url: newCover,
        gallery: updated,
      });

      // Also create a global gallery item if callback provided
      if (onAddGalleryItem) {
        await onAddGalleryItem({
          id: 'gal-srv-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          image_url: url,
          title: meta?.title || `${service.name} Repair Photo`,
          caption: `Work executed at Sakil Bag Store for ${service.name}`,
          category: (meta?.category as any) || 'Trolley Parts',
          service_id: service.id,
          service_name: service.name,
          alt_text: `${service.name} Noida Mohd Shakil`,
          display_order: updated.length,
          active: true,
          created_at: new Date().toISOString(),
        });
      }

      setMsg({ type: 'success', text: 'Photo added to service gallery!' });
      setTimeout(() => setMsg(null), 3000);
    } catch (err: any) {
      setMsg({ type: 'error', text: err?.message || 'Failed to save' });
    } finally {
      setSaving(false);
    }
  };

  // When multiple photos are bulk uploaded in the modal
  const handleBulkUpload = async (urls: string[], meta?: { category?: string }) => {
    const updated = [...currentGallery, ...urls];
    setCurrentGallery(updated);

    let newCover = coverImage;
    if (!newCover && urls.length > 0) {
      newCover = urls[0];
      setCoverImage(urls[0]);
    }

    setSaving(true);
    try {
      await onSaveService({
        ...service,
        image_url: newCover,
        gallery: updated,
      });

      // Add each to global gallery as well
      if (onAddGalleryItem) {
        for (let i = 0; i < urls.length; i++) {
          await onAddGalleryItem({
            id: 'gal-srv-bulk-' + Date.now() + '-' + i,
            image_url: urls[i],
            title: `${service.name} Part ${i + 1}`,
            caption: `Workshop repair photo for ${service.name} in Sector 22, Noida`,
            category: (meta?.category as any) || 'Trolley Parts',
            service_id: service.id,
            service_name: service.name,
            alt_text: `${service.name} Noida`,
            display_order: updated.length + i,
            active: true,
            created_at: new Date().toISOString(),
          });
        }
      }

      setMsg({ type: 'success', text: `Added ${urls.length} photos to service gallery!` });
      setTimeout(() => setMsg(null), 4000);
    } catch (err: any) {
      setMsg({ type: 'error', text: err?.message || 'Failed to save bulk photos' });
    } finally {
      setSaving(false);
    }
  };

  // Set image as main service cover
  const handleSetCover = async (url: string) => {
    setCoverImage(url);
    setSaving(true);
    try {
      await onSaveService({
        ...service,
        image_url: url,
        gallery: currentGallery,
      });
      setMsg({ type: 'success', text: 'Set as main service cover photo!' });
      setTimeout(() => setMsg(null), 3000);
    } catch {
      setMsg({ type: 'error', text: 'Failed to update cover' });
    } finally {
      setSaving(false);
    }
  };

  // Delete an image from service gallery
  const handleDeleteImage = async (indexToDelete: number) => {
    const deletedUrl = currentGallery[indexToDelete];
    const updated = currentGallery.filter((_, idx) => idx !== indexToDelete);
    setCurrentGallery(updated);

    let newCover = coverImage;
    if (coverImage === deletedUrl) {
      newCover = updated[0] || '';
      setCoverImage(newCover);
    }

    setSaving(true);
    try {
      await onSaveService({
        ...service,
        image_url: newCover,
        gallery: updated,
      });
      setMsg({ type: 'success', text: 'Photo removed from service gallery' });
      setTimeout(() => setMsg(null), 3000);
    } catch {
      setMsg({ type: 'error', text: 'Failed to delete photo' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-5 backdrop-blur-sm">
      <div className="max-w-3xl w-full bg-neutral-900 border border-neutral-800 rounded-3xl p-5 sm:p-6 space-y-5 max-h-[92vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-neutral-800 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-950/80 text-orange-400 border border-orange-800 text-[10px] font-mono mb-1">
              Service Gallery
            </div>
            <h3 className="font-heading text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <span>{service.name}</span>
              <span className="text-xs font-normal text-neutral-400">
                ({currentGallery.length} Photos)
              </span>
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Upload before/after work shots, spare parts, and customer repairs for this specific service.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Feedback message */}
        {msg && (
          <div
            className={`p-3 rounded-xl text-xs font-semibold flex items-center justify-between ${
              msg.type === 'success'
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                : 'bg-red-950/80 text-red-300 border border-red-800'
            }`}
          >
            <span>{msg.text}</span>
            <button onClick={() => setMsg(null)} className="text-neutral-400 hover:text-white">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Upload Section: Bulk / Single */}
        <BulkSingleImageUpload
          onSingleUpload={handleSingleUpload}
          onBulkUpload={handleBulkUpload}
          services={allServices}
          defaultServiceId={service.id}
          allowServiceSelection={false}
          className="border-neutral-800 bg-neutral-950"
        />

        {/* Current Photos Gallery Grid */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-neutral-300">
              Service Gallery Photos ({currentGallery.length})
            </h4>
            {saving && (
              <span className="text-[11px] text-orange-400 flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Saving updates...</span>
              </span>
            )}
          </div>

          {currentGallery.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border border-dashed border-neutral-800 bg-neutral-950/40 text-neutral-500 text-xs">
              <ImageIcon className="h-8 w-8 mx-auto text-neutral-600 mb-2" />
              <div>No photos added to this service yet.</div>
              <div className="text-[11px] text-neutral-600 mt-1">
                Use the Single or Bulk upload options above to showcase your repairs.
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {currentGallery.map((url, idx) => {
                const isCover = coverImage === url;
                return (
                  <div
                    key={idx}
                    className="group relative rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950 aspect-square flex flex-col justify-between"
                  >
                    <img
                      src={url}
                      alt={`${service.name} ${idx + 1}`}
                      className="h-full w-full object-cover"
                    />

                    {/* Cover badge */}
                    {isCover && (
                      <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-orange-600 text-white text-[9px] font-bold shadow-md flex items-center gap-1">
                        <Star className="h-2.5 w-2.5 fill-current" />
                        <span>Cover</span>
                      </span>
                    )}

                    {/* Action overlay on hover */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                      <button
                        type="button"
                        onClick={() => setPreviewImage(url)}
                        className="p-2 rounded-lg bg-neutral-800/90 text-neutral-200 hover:text-white hover:bg-neutral-700"
                        title="View Full Size"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>

                      {!isCover && (
                        <button
                          type="button"
                          onClick={() => handleSetCover(url)}
                          className="p-2 rounded-lg bg-orange-600/90 text-white hover:bg-orange-500"
                          title="Set as Main Service Cover Photo"
                        >
                          <Star className="h-3.5 w-3.5" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDeleteImage(idx)}
                        className="p-2 rounded-lg bg-rose-600/90 text-white hover:bg-rose-500"
                        title="Delete from Service Gallery"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="flex justify-end pt-3 border-t border-neutral-800">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-white transition-colors"
          >
            Done / Close
          </button>
        </div>
      </div>

      {/* Full screen preview lightbox */}
      {previewImage && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/95 p-4 cursor-pointer"
          onClick={() => setPreviewImage(null)}
        >
          <img
            src={previewImage}
            alt="Full size view"
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl"
          />
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute top-4 right-4 p-2 text-white bg-neutral-800 rounded-full"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      )}
    </div>
  );
};
