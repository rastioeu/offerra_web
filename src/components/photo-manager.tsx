"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";

import { removePhotoAction, uploadPhotoAction } from "@/app/moje-inzeraty/[id]/upravit/photo-actions";
import type { Media } from "@/lib/property";

export function PhotoManager({ propertyId, media }: { propertyId: string; media: Media[] }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    const formData = new FormData();
    formData.set("file", file);
    startTransition(async () => {
      try {
        await uploadPhotoAction(propertyId, formData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Nahratie zlyhalo");
      } finally {
        if (inputRef.current) inputRef.current.value = "";
      }
    });
  }

  function handleRemove(mediaId: string, url: string) {
    if (!window.confirm("Zmazať túto fotku?")) return;
    setError(null);
    startTransition(async () => {
      try {
        await removePhotoAction(propertyId, mediaId, url);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Zmazanie zlyhalo");
      }
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-text-muted">Fotky ({media.length})</h3>

      {media.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {media.map((m) => (
            <div key={m.id} className="relative aspect-[4/3] overflow-hidden rounded-xl bg-surface-pressed">
              <Image src={m.url} alt="" fill sizes="200px" className="object-cover" />
              <button
                type="button"
                onClick={() => handleRemove(m.id, m.url)}
                disabled={pending}
                className="absolute right-1.5 top-1.5 rounded-full bg-scrim px-2 py-1 text-xs font-semibold text-on-primary disabled:opacity-60"
              >
                Zmazať
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-text-muted">Zatiaľ žiadna fotka.</p>
      )}

      <div>
        <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} disabled={pending} className="hidden" id="photo-input" />
        <label
          htmlFor="photo-input"
          className={`inline-block w-fit cursor-pointer rounded-xl border border-border-strong bg-surface px-4 py-2 text-sm font-semibold text-text-primary hover:bg-surface-pressed ${pending ? "opacity-60" : ""}`}
        >
          {pending ? "Nahrávam…" : "Pridať fotku"}
        </label>
      </div>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
    </div>
  );
}
