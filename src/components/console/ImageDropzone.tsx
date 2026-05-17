"use client";

export interface UploadedImage {
  url: string;
  pathname: string;
  preview: string;
}

interface ImageDropzoneProps {
  onUploaded: (img: UploadedImage) => void;
}

// Stub: T17 replaces this with the real drag-drop + camera capture component.
// Kept here so ChatPanel can import it and the build stays green.
export function ImageDropzone({ onUploaded: _onUploaded }: ImageDropzoneProps) {
  return (
    <button
      type="button"
      disabled
      aria-label="Upload disabled until T17"
      className="bg-[var(--color-surface)] border border-[var(--color-border)] px-3 py-2 rounded text-[13px] opacity-50"
    >
      Photo
    </button>
  );
}
