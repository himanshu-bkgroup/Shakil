import React, { useState, useRef } from 'react';
import { UploadCloud, Layers, Image as ImageIcon, X, Check, Loader2, Plus, Sparkles } from 'lucide-react';

interface BulkSingleImageUploadProps {
  onSingleUpload?: (url: string, meta?: { title?: string; category?: string; service_id?: string }) => Promise<void> | void;
  onBulkUpload?: (urls: string[], meta?: { category?: string; service_id?: string }) => Promise<void> | void;
  services?: { id: string; name: string; slug: string }[];
  defaultCategory?: string;
  defaultServiceId?: string;
  allowServiceSelection?: boolean;
  className?: string;
}

/**
 * Resizes and compresses an image client-side to ensure fast loading and responsive saving.
 */
function compressImage(file: File, maxDim = 1080, quality = 0.80): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Invalid image file'));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const compressedUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedUrl);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Upload compressed data URL to backend static directory, with fallback
 */
async function uploadToServer(dataUrl: string, filename: string): Promise<string> {
  try {
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: dataUrl, name: filename }),
    });
    if (res.ok) {
      const json = await res.json();
      if (json?.url) return json.url;
    }
  } catch {
    // fallback to dataUrl
  }
  return dataUrl;
}

export const BulkSingleImageUpload: React.FC<BulkSingleImageUploadProps> = ({
  onSingleUpload,
  onBulkUpload,
  services = [],
  defaultCategory = 'Wheels',
  defaultServiceId = '',
  allowServiceSelection = true,
  className = '',
}) => {
  const [uploadMode, setUploadMode] = useState<'single' | 'bulk'>('single');
  const [category, setCategory] = useState(defaultCategory);
  const [selectedServiceId, setSelectedServiceId] = useState(defaultServiceId);

  // Single upload state
  const [singleFile, setSingleFile] = useState<File | null>(null);
  const [singlePreview, setSinglePreview] = useState<string>('');
  const [singleTitle, setSingleTitle] = useState('');
  const [singleUploading, setSingleUploading] = useState(false);

  // Bulk upload state
  const [bulkFiles, setBulkFiles] = useState<File[]>([]);
  const [bulkPreviews, setBulkPreviews] = useState<{ name: string; url: string; size: string }[]>([]);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });

  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const singleInputRef = useRef<HTMLInputElement>(null);
  const bulkInputRef = useRef<HTMLInputElement>(null);

  // Single file handling
  const handleSingleSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }
    setErrorMsg('');
    setSuccessMsg('');
    setSingleFile(file);
    try {
      const preview = await compressImage(file, 600, 0.7);
      setSinglePreview(preview);
      if (!singleTitle) {
        setSingleTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
      }
    } catch {
      setErrorMsg('Failed to process image preview.');
    }
  };

  const handleSingleSubmit = async () => {
    if (!singleFile || !onSingleUpload) return;
    setSingleUploading(true);
    setErrorMsg('');
    try {
      const compressed = await compressImage(singleFile, 1200, 0.82);
      const finalUrl = await uploadToServer(compressed, singleFile.name);
      await onSingleUpload(finalUrl, {
        title: singleTitle || 'Repair Photo',
        category,
        service_id: selectedServiceId || undefined,
      });
      setSingleFile(null);
      setSinglePreview('');
      setSingleTitle('');
      setSuccessMsg('Photo uploaded successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to upload photo');
    } finally {
      setSingleUploading(false);
    }
  };

  // Bulk file handling
  const handleBulkSelect = async (files: FileList | File[]) => {
    const validFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (validFiles.length === 0) {
      setErrorMsg('Please select valid image files.');
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    setBulkFiles(prev => [...prev, ...validFiles]);

    // Generate thumbnails
    for (const f of validFiles) {
      try {
        const thumb = await compressImage(f, 300, 0.6);
        setBulkPreviews(prev => [
          ...prev,
          {
            name: f.name,
            url: thumb,
            size: `${Math.round(f.size / 1024)} KB`,
          },
        ]);
      } catch {
        // Continue with others
      }
    }
  };

  const removeBulkFile = (index: number) => {
    setBulkFiles(prev => prev.filter((_, i) => i !== index));
    setBulkPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleBulkSubmit = async () => {
    if (bulkFiles.length === 0 || !onBulkUpload) return;
    setBulkUploading(true);
    setErrorMsg('');
    setBulkProgress({ current: 0, total: bulkFiles.length });

    const uploadedUrls: string[] = [];
    try {
      for (let i = 0; i < bulkFiles.length; i++) {
        const file = bulkFiles[i];
        setBulkProgress({ current: i + 1, total: bulkFiles.length });
        const compressed = await compressImage(file, 1200, 0.80);
        const finalUrl = await uploadToServer(compressed, file.name);
        uploadedUrls.push(finalUrl);
      }

      await onBulkUpload(uploadedUrls, {
        category,
        service_id: selectedServiceId || undefined,
      });

      setSuccessMsg(`Successfully bulk-uploaded ${uploadedUrls.length} photos!`);
      setBulkFiles([]);
      setBulkPreviews([]);
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error occurred during bulk upload');
    } finally {
      setBulkUploading(false);
    }
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (uploadMode === 'single') {
        handleSingleSelect(e.dataTransfer.files[0]);
      } else {
        handleBulkSelect(e.dataTransfer.files);
      }
    }
  };

  return (
    <div className={`rounded-2xl border border-neutral-800 bg-neutral-900/80 p-5 space-y-4 ${className}`}>
      {/* Header and Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
        <div>
          <h4 className="font-heading text-sm font-bold text-white flex items-center gap-2">
            <UploadCloud className="h-4 w-4 text-orange-400" />
            <span>Upload Photos to Gallery</span>
          </h4>
          <p className="text-[11px] text-neutral-400">
            Choose single upload with details or bulk upload multiple photos at once
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="inline-flex rounded-xl bg-neutral-950 p-1 border border-neutral-800 shrink-0">
          <button
            type="button"
            onClick={() => setUploadMode('single')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              uploadMode === 'single'
                ? 'bg-orange-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <ImageIcon className="h-3.5 w-3.5" />
            <span>Single Photo</span>
          </button>
          <button
            type="button"
            onClick={() => setUploadMode('bulk')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              uploadMode === 'bulk'
                ? 'bg-orange-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Bulk Upload (Multiple)</span>
          </button>
        </div>
      </div>

      {/* Target Service & Category Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        {allowServiceSelection && services.length > 0 && (
          <div>
            <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
              Assign to Service
            </label>
            <select
              value={selectedServiceId}
              onChange={(e) => setSelectedServiceId(e.target.value)}
              className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-white text-xs focus:border-orange-500 focus:outline-none"
            >
              <option value="">All Services / General Gallery</option>
              {services.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-white text-xs focus:border-orange-500 focus:outline-none"
          >
            <option value="Wheels">Trolley Wheels</option>
            <option value="Handles">Telescopic Handles</option>
            <option value="Locks">Combination & TSA Locks</option>
            <option value="Trolley Parts">Trolley Spare Parts</option>
            <option value="Bag Repair">Bag & Zipper Repair</option>
            <option value="Luggage">Luggage & Suitcases</option>
            <option value="Customized Bags">Customized Bags</option>
            <option value="Store">Workshop & Store</option>
          </select>
        </div>
      </div>

      {/* Messages */}
      {errorMsg && (
        <div className="rounded-xl border border-red-900/60 bg-red-950/40 p-2.5 text-xs text-red-300 flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg('')} className="text-red-400 hover:text-white">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
      {successMsg && (
        <div className="rounded-xl border border-emerald-900/60 bg-emerald-950/40 p-2.5 text-xs text-emerald-300 flex items-center gap-2">
          <Check className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* -------------------- MODE: SINGLE -------------------- */}
      {uploadMode === 'single' && (
        <div className="space-y-3">
          <input
            ref={singleInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) handleSingleSelect(e.target.files[0]);
            }}
          />

          {!singlePreview ? (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => singleInputRef.current?.click()}
              className={`rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${
                dragActive
                  ? 'border-orange-500 bg-orange-950/20'
                  : 'border-neutral-800 bg-neutral-950/50 hover:border-neutral-700 hover:bg-neutral-950'
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-orange-600/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                  <UploadCloud className="h-5 w-5" />
                </div>
                <div className="text-xs font-semibold text-neutral-200">
                  Click to select photo or drag & drop here
                </div>
                <div className="text-[11px] text-neutral-500">
                  Supports JPG, PNG, WebP up to 15MB · Auto-optimized for instant load
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3 space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src={singlePreview}
                  alt="Preview"
                  className="h-16 w-16 rounded-lg object-cover border border-neutral-800 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-white truncate">
                    {singleFile?.name}
                  </div>
                  <div className="text-[11px] text-neutral-400">
                    Ready to upload
                  </div>
                  <input
                    type="text"
                    value={singleTitle}
                    onChange={(e) => setSingleTitle(e.target.value)}
                    placeholder="Photo title / caption (e.g. 50mm Spinner Wheel Replacement)"
                    className="w-full mt-1.5 px-2.5 py-1 rounded-lg border border-neutral-800 bg-neutral-900 text-white text-xs focus:border-orange-500 focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSingleFile(null);
                    setSinglePreview('');
                    setSingleTitle('');
                  }}
                  className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800/80">
                <button
                  type="button"
                  onClick={() => {
                    setSingleFile(null);
                    setSinglePreview('');
                  }}
                  className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSingleSubmit}
                  disabled={singleUploading}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-xs font-bold text-white disabled:opacity-50"
                >
                  {singleUploading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Save & Add Photo</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* -------------------- MODE: BULK -------------------- */}
      {uploadMode === 'bulk' && (
        <div className="space-y-3">
          <input
            ref={bulkInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) handleBulkSelect(e.target.files);
            }}
          />

          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => bulkInputRef.current?.click()}
            className={`rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${
              dragActive
                ? 'border-orange-500 bg-orange-950/20'
                : 'border-neutral-800 bg-neutral-950/50 hover:border-neutral-700 hover:bg-neutral-950'
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-orange-600/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                <Layers className="h-5 w-5" />
              </div>
              <div className="text-xs font-semibold text-neutral-200">
                Click to select multiple photos or drag batch here
              </div>
              <div className="text-[11px] text-neutral-500">
                Select 5, 10, or 20+ photos at once · Auto-resized in parallel
              </div>
            </div>
          </div>

          {/* Bulk selected file previews */}
          {bulkPreviews.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-neutral-300">
                  Selected Photos ({bulkPreviews.length})
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setBulkFiles([]);
                    setBulkPreviews([]);
                  }}
                  className="text-neutral-500 hover:text-rose-400 text-[11px]"
                >
                  Clear All
                </button>
              </div>

              {/* Thumbnail Strip Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-1 bg-neutral-950 rounded-xl border border-neutral-800">
                {bulkPreviews.map((preview, idx) => (
                  <div key={idx} className="relative group rounded-lg overflow-hidden border border-neutral-800 bg-neutral-900 aspect-square">
                    <img src={preview.url} alt={preview.name} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeBulkFile(idx)}
                      className="absolute top-1 right-1 p-0.5 rounded-full bg-neutral-950/80 text-neutral-400 hover:text-white"
                      title="Remove"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    <div className="absolute bottom-0 inset-x-0 bg-neutral-950/80 px-1 py-0.5 text-[9px] text-neutral-400 truncate">
                      {preview.name}
                    </div>
                  </div>
                ))}
              </div>

              {/* Progress bar if uploading */}
              {bulkUploading && (
                <div className="space-y-1.5 p-3 rounded-xl bg-orange-950/20 border border-orange-900/40">
                  <div className="flex items-center justify-between text-xs text-orange-300">
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Uploading batch...</span>
                    </span>
                    <span className="font-mono">
                      {bulkProgress.current} / {bulkProgress.total} ({Math.round((bulkProgress.current / bulkProgress.total) * 100)}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-500 transition-all duration-200"
                      style={{ width: `${(bulkProgress.current / bulkProgress.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Bulk Submit Button */}
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleBulkSubmit}
                  disabled={bulkUploading}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-xs font-bold text-white shadow-sm transition-colors disabled:opacity-50"
                >
                  {bulkUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Uploading {bulkProgress.current} of {bulkProgress.total}...</span>
                    </>
                  ) : (
                    <>
                      <Layers className="h-4 w-4" />
                      <span>Upload All {bulkFiles.length} Photos</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
