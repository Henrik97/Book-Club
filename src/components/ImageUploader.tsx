import React, { useEffect, useRef, useState } from "react";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/ui/shadcn-io/dropzone";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";

interface UploadResult {
  path: string;
}

interface ImageUploaderProps {
  bucket?: string;
  onUploadComplete: (res: UploadResult) => void;
  accept?: string;
  maxSizeBytes?: number;
}

export default function ImageUploader({
  bucket = "book-covers",
  onUploadComplete,
  accept = "image/*",
  maxSizeBytes = 4 * 1024 * 1024,
}: ImageUploaderProps) {
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function onPick() {
    if (uploading) return;
    if (fileRef.current) fileRef.current.value = "";
    fileRef.current?.click();
  }

  async function uploadFile(file: File) {
    setError(null);

    if (file.size > maxSizeBytes) {
      setError(
        `File too large (max ${Math.round(maxSizeBytes / 1024 / 1024)} MB)`,
      );
      return;
    }

    // Create a preview URL
    const objectUrl = URL.createObjectURL(file);

    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return objectUrl;
    });

    // Unique filename (fixes collisions!)
    const ext = file.name.split(".").pop() ?? "jpg";
    const filename = `book-${crypto.randomUUID()}.${ext}`;
    const path = filename;

    setUploading(true);

    try {
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) throw uploadError;

      onUploadComplete({ path });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Upload failed";
      console.error("Upload failed:", err);
      setError(message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  // Dropzone handler
  const handleDrop = (files: File[]) => {
    const file = files?.[0];
    if (!file) return;
    uploadFile(file);
  };

  // File input handler
  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadFile(file);
  };

  return (
    <div className="flex flex-col gap-2 h-full">
      <input
        ref={fileRef}
        type="file"
        accept={accept}
        hidden
        onChange={handleFilePick}
      />

      {previewUrl ? (
        <div className="flex flex-col gap-2">
          <div className="relative w-60 h-100">
            <Image
              fill
              src={previewUrl}
              alt="preview"
              unoptimized
              className="object-cover rounded-md"
            />
          </div>
          <button
            type="button"
            className="text-sm underline"
            onClick={() => {
              setPreviewUrl(null);
              onPick();
            }}
            disabled={uploading}
          >
            Change image
          </button>
        </div>
      ) : (
        <div
          onClick={uploading ? undefined : onPick}
          className="cursor-pointer h-100 w-60"
        >
          <Dropzone
            noClick
            className="h-full"
            accept={{ "image/*": [] }}
            onDrop={handleDrop}
          >
            <DropzoneEmptyState />
            <DropzoneContent />
          </Dropzone>
        </div>
      )}
      {uploading && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-sm rounded-md">
          Uploading...
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
