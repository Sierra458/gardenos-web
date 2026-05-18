"use client";
import { useRef, useState } from "react";

export interface UploadedImage {
  url: string;
  pathname: string;
  preview: string;
}

export function ImageDropzone({ onUploaded }: { onUploaded: (img: UploadedImage) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handleFiles(files: FileList | File[]) {
    setBusy(true);
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) continue;
        const form = new FormData();
        form.append("file", file);
        const res = await fetch("/api/console/upload", { method: "POST", body: form });
        if (!res.ok) {
          const { error } = await res.json().catch(() => ({ error: "Upload failed" }));
          alert(error);
          continue;
        }
        const { url, pathname } = await res.json();
        onUploaded({ url, pathname, preview: URL.createObjectURL(file) });
      }
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <>
      <button type="button" onClick={() => inputRef.current?.click()} disabled={busy}
        className="bg-[var(--color-surface)] border border-[var(--color-border)] px-3 py-2 rounded text-[13px] disabled:opacity-50"
        aria-label="Attach photos">
        {busy ? "↑" : "📷"}
      </button>
      <input ref={inputRef} type="file" accept="image/*" multiple capture="environment"
        onChange={e => e.target.files && handleFiles(e.target.files)}
        className="hidden" />
    </>
  );
}
