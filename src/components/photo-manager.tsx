"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useRef, useState, useTransition } from "react";

import { removePhotoAction, uploadPhotoAction } from "@/app/[locale]/moje-inzeraty/[id]/upravit/photo-actions";
import { createT, isLocale } from "@/i18n";
import type { Media } from "@/lib/property";

export function PhotoManager({ propertyId, media }: { propertyId: string; media: Media[] }) {
  const pathname = usePathname();
  const maybeLocale = pathname.split("/")[1];
  const locale = isLocale(maybeLocale) && maybeLocale !== "sk" ? maybeLocale : "sk";
  const t = createT(locale);
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
        setError(err instanceof Error ? err.message : t("photo.uploadFailed"));
      } finally {
        if (inputRef.current) inputRef.current.value = "";
      }
    });
  }

  function handleRemove(mediaId: string, url: string) {
    if (!window.confirm(t("photo.confirmDelete"))) return;
    setError(null);
    startTransition(async () => {
      try {
        await removePhotoAction(propertyId, mediaId, url);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("photo.deleteFailed"));
      }
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
        {t("inzeratEdit.photosSection", { count: media.length })}
      </h3>

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
                {t("photo.deleteButton")}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-text-muted">{t("photo.emptyState")}</p>
      )}

      <div>
        <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} disabled={pending} className="hidden" id="photo-input" />
        <label
          htmlFor="photo-input"
          className={`inline-block w-fit cursor-pointer rounded-xl border border-border-strong bg-surface px-4 py-2 text-sm font-semibold text-text-primary hover:bg-surface-pressed ${pending ? "opacity-60" : ""}`}
        >
          {pending ? t("photo.uploading") : t("inzeratEdit.addPhotoButton")}
        </label>
      </div>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
    </div>
  );
}
