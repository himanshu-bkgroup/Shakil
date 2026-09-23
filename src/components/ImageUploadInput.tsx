import React, { useState, useRef } from 'react';
import { UploadCloud, Link as LinkIcon, X, Check, Image as ImageIcon, RefreshCw } from 'lucide-react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

interface ImageUploadInputProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  helperText?: string;
  className?: string;
}

/**
 * Resizes and compresses an image client-side to ensure fast loading and reliable saving.
 */
function compressImage(file: File, maxDim = 1280, quality = 0.84): Promise<string> {
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
        // Convert to optimized JPEG DataURL
        const compressedUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedUrl);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export const ImageUploadInput: React.FC<ImageUploadInputProps> = ({
  label = 'Photo / Image',
  value,
  onChange,
  helperText = 'Upload from your device (JPG, PNG, WebP) or enter an image link',
  className = '',
}) => {
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [fileDetails, setFileDetails] = useState<{ name: string; size: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (JPG, PNG, WebP, etc.)');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setUploadError('Image size exceeds 15MB. Please choose a smaller photo.');
      return;
    }

    setUploadError('');
    setUploading(true);

    try {
      // 1. First compress the image locally for fast preview & guaranteed persistence
      const compressedDataUrl = await compressImage(file);
      const sizeKb = Math.round((compressedDataUrl.length * 0.75) / 1024);

      setFileDetails({
        name: file.name,
        size: `${sizeKb} KB (optimized)`,
      });

      // 2. If Supabase is connected, optionally try to upload to Supabase Storage 'gallery' bucket
      if (isSupabaseConfigured && supabase) {
        try {
          const fileExt = file.name.split('.').pop() || 'jpg';
          const fileName = `uploads/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
          const { data, error } = await supabase.storage
            .from('gallery')
            .upload(fileName, file, { upsert: true });

          if (!error && data?.path) {
            const { data: publicUrlData } = supabase.storage
              .from('gallery')
              .getPublicUrl(fileName);

            if (publicUrlData?.publicUrl) {
              onChange(publicUrlData.publicUrl);
              setUploading(false);
              return;
            }
          }
        } catch (storageErr) {
          console.warn('Supabase storage upload fallback to optimized DataURL:', storageErr);
        }
      }

      // 3. Set the optimized image DataURL directly
      onChange(compressedDataUrl);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to process image');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-xs font-medium text-neutral-300">
          {label}
        </label>
        <div className="flex items-center rounded-lg bg-neutral-950 p-0.5 border border-neutral-800 text-[11px]">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
              mode === 'upload'
                ? 'bg-neutral-800 text-white font-medium'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <UploadCloud className="h-3 w-3" />
            <span>Upload File</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
              mode === 'url'
                ? 'bg-neutral-800 text-white font-medium'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <LinkIcon className="h-3 w-3" />
            <span>Image URL</span>
          </button>
        </div>
      </div>

      {mode === 'upload' ? (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-orange-500 bg-orange-500/10'
                : 'border-neutral-700 bg-neutral-950/60 hover:border-neutral-600 hover:bg-neutral-900/50'
            }`}
          >
            {uploading ? (
              <div className="py-4 flex flex-col items-center justify-center space-y-2">
                <RefreshCw className="h-6 w-6 text-orange-400 animate-spin" />
                <p className="text-xs text-neutral-300 font-medium">Processing and optimizing image...</p>
              </div>
            ) : (
              <div className="py-2 flex flex-col items-center justify-center space-y-1.5">
                <div className="p-2.5 rounded-full bg-neutral-900 text-orange-400 border border-neutral-800">
                  <UploadCloud className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-white hover:text-orange-400">
                    Click to browse
                  </span>{' '}
                  <span className="text-xs text-neutral-400">or drag & drop photograph</span>
                </div>
                <p className="text-[10px] text-neutral-500">
                  Supports Camera photos, JPG, PNG, WebP (auto-optimized)
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-1">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://images.unsplash.com/... or https://..."
            className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-xs text-white placeholder-neutral-500 focus:border-orange-500 focus:outline-none"
          />
          <p className="text-[10px] text-neutral-500">
            Paste a public web link to any image
          </p>
        </div>
      )}

      {uploadError && (
        <p className="text-[11px] text-rose-400 font-medium">{uploadError}</p>
      )}

      {/* Image Preview Box if image exists */}
      {value && (
        <div className="mt-2 rounded-xl border border-neutral-800 bg-neutral-950/90 p-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-14 w-14 rounded-lg overflow-hidden border border-neutral-800 bg-black shrink-0 relative">
              <img
                src={value}
                alt="Uploaded preview"
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-white truncate">
                <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>Image Attached</span>
              </div>
              {fileDetails ? (
                <p className="text-[10px] text-neutral-400 truncate">
                  {fileDetails.name} • {fileDetails.size}
                </p>
              ) : (
                <p className="text-[10px] text-neutral-400 truncate max-w-[200px] sm:max-w-[260px]">
                  {value.startsWith('data:') ? 'Custom uploaded image (Ready)' : value}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-[11px] font-medium text-neutral-300 hover:text-white px-2 py-1 rounded bg-neutral-900 border border-neutral-800"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={() => {
                onChange('');
                setFileDetails(null);
              }}
              className="p-1 rounded text-neutral-400 hover:text-rose-400 hover:bg-neutral-900"
              title="Remove image"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {helperText && !value && (
        <p className="text-[10px] text-neutral-500">{helperText}</p>
      )}
    </div>
  );
};
