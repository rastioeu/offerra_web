"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useRef, useState, useTransition } from "react";

import { removePhotoAction, setCoverPhotoAction, uploadPhotoAction } from "@/app/[locale]/moje-inzeraty/[id]/upravit/photo-actions";
import { createT, isLocale } from "@/i18n";
import { MAX_PHOTOS, remainingSlots, takeWithinLimit } from "@/lib/photo-limits";
import type { Media } from "@/lib/property";

export function PhotoManager({ propertyId, media }: { propertyId: string; media: Media[] }) {
  const pathname = usePathname();
  const maybeLocale = pathname.split("/")[1];
  const locale = isLocale(maybeLocale) && maybeLocale !== "sk" ? maybeLocale : "sk";
  const t = createT(locale);
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [pending, startTransition] = useTransition();

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const all = Array.from(e.target.files ?? []);
    if (inputRef.current) inputRef.current.value = "";
    if (all.length === 0) return;
    setError(null);
    setInfo(null);
    const slots = remainingSlots(media.length);
    if (slots === 0) {
      setError(t("photo.limitReached", { max: MAX_PHOTOS }));
      return;
    }
    const { accepted, dropped } = takeWithinLimit(all, slots);
    startTransition(async () => {
      let saved = 0;
      for (let i = 0; i < accepted.length; i++) {
        setProgress({ done: i, total: accepted.length });
        const formData = new FormData();
        formData.set("file", accepted[i]);
        try {
          await uploadPhotoAction(propertyId, formData);
          saved++;
        } catch (err) {
          // Nič potichu: ktorá fotka zlyhala a koľko je už uložených.
          console.error("[photo-manager] upload zlyhal:", err);
          const message = err instanceof Error ? err.message : t("photo.uploadFailed");
          setError(t("photo.partialFailed", { saved, total: accepted.length, n: i + 1, message }));
          setProgress(null);
          return;
        }
      }
      setProgress(null);
      if (dropped > 0) setInfo(t("photo.droppedOverLimit", { dropped, max: MAX_PHOTOS }));
    });
  }

  function handleCover(mediaId: string) {
    setError(null);
    setInfo(null);
    startTransition(async () => {
      try {
        await setCoverPhotoAction(propertyId, mediaId);
      } catch (err) {
        console.error("[photo-manager] nastavenie titulnej zlyhalo:", err);
        setError(err instanceof Error ? err.message : t("photo.coverFailedTitle"));
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
        {t("inzeratEdit.photosSection", { count: media.length, max: MAX_PHOTOS })}
      </h3>

      {media.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {media.map((m, i) => (
            <div key={m.id} className="relative aspect-[4/3] overflow-hidden rounded-xl bg-surface-pressed">
              <Image src={m.url} alt="" fill sizes="200px" className="object-cover" />
              {i === 0 ? (
                <span className="absolute bottom-1.5 left-1.5 rounded-md bg-primary px-2 py-1 text-xs font-bold text-on-primary">
                  {t("inzeratEdit.coverBadge")}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleCover(m.id)}
                  disabled={pending}
                  className="absolute bottom-1.5 left-1.5 rounded-md bg-surface px-2 py-1 text-xs font-semibold text-link disabled:opacity-60"
                >
                  {t("inzeratEdit.makeCover")}
                </button>
              )}
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

      {media.length >= MAX_PHOTOS ? (
        <p className="text-sm text-text-muted">{t("photo.limitReached", { max: MAX_PHOTOS })}</p>
      ) : (
        <div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFiles}
            disabled={pending}
            className="hidden"
            id="photo-input"
          />
          <label
            htmlFor="photo-input"
            className={`inline-block w-fit cursor-pointer rounded-xl border border-border-strong bg-surface px-4 py-2 text-sm font-semibold text-text-primary hover:bg-surface-pressed ${pending ? "opacity-60" : ""}`}
          >
            {pending
              ? `${t("photo.uploading")}${progress ? ` ${progress.done + 1}/${progress.total}` : ""}`
              : t("inzeratEdit.addPhotoButton")}
          </label>
        </div>
      )}
      {info ? <p className="text-sm text-text-muted">{info}</p> : null}
      {error ? <p className="text-sm text-danger">{error}</p> : null}
    </div>
  );
}
