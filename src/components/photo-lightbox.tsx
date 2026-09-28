"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import { createT, type Locale } from "@/i18n";
import type { Media } from "@/lib/property";

/**
 * Fullscreen prehliadač fotiek (Rastio, 28.9.2026: „nech sa zväčší a dá sa
 * ďalej listovať, zatvorí Esc alebo tlačidlo"). Web má myš a klávesnicu, nie
 * dotykové gestá — preto žiadne swipe hinty (rovnaká zásada ako v appke,
 * CLAUDE.md appky §12a: text nesľubuje gestá, ktoré appka nemá).
 *
 * `createPortal` do `document.body` — inak by prehliadač zdedil `overflow`
 * alebo `transform` nadradeného kontajnera a `position: fixed` by sa
 * nekryl s celou obrazovkou.
 */
export function PhotoLightbox({
  media,
  title,
  index,
  language,
  onClose,
  onNavigate,
}: {
  media: Media[];
  title: string;
  index: number;
  language: Locale;
  onClose: () => void;
  onNavigate: (index: number) => void;
}) {
  const t = createT(language);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const count = media.length;

  const goPrev = useCallback(() => onNavigate((index - 1 + count) % count), [index, count, onNavigate]);
  const goNext = useCallback(() => onNavigate((index + 1) % count), [index, count, onNavigate]);

  // Klávesnica: Esc zavrie, šípky listujú — presne to, čo textová
  // nápoveda dole sľubuje, nič viac.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft" && count > 1) goPrev();
      else if (e.key === "ArrowRight" && count > 1) goNext();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, goPrev, goNext, count]);

  // Stránka pod prehliadačom sa nesmie posúvať a focus ide na zatváracie
  // tlačidlo (klávesnicová prístupnosť) — po zatvorení sa oboje vráti.
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, []);

  const current = media[index];
  if (!current) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex flex-col bg-scrim"
    >
      <div className="flex items-center justify-between px-3 pt-[max(0.75rem,env(safe-area-inset-top,0px))] pb-2 sm:px-5">
        {count > 1 ? (
          <span className="rounded-full bg-surface/90 px-3 py-1 text-sm font-semibold text-text-primary">
            {t("photoLightbox.counter", { n: index + 1, total: count })}
          </span>
        ) : (
          <span />
        )}
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label={t("photoLightbox.closePhoto")}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-surface/90 text-xl font-semibold text-text-primary hover:bg-surface"
        >
          ×
        </button>
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden px-2 pb-2">
        {count > 1 ? (
          <button
            type="button"
            onClick={goPrev}
            aria-label={t("photoLightbox.prevPhoto")}
            className="absolute left-1 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-surface/90 text-2xl font-semibold text-text-primary hover:bg-surface sm:left-4"
          >
            ‹
          </button>
        ) : null}

        <div className="relative h-full w-full max-w-5xl">
          <Image
            key={current.id}
            src={current.url}
            alt={t("photoLightbox.counter", { n: index + 1, total: count })}
            fill
            sizes="100vw"
            className="object-contain"
            priority
          />
        </div>

        {count > 1 ? (
          <button
            type="button"
            onClick={goNext}
            aria-label={t("photoLightbox.nextPhoto")}
            className="absolute right-1 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-surface/90 text-2xl font-semibold text-text-primary hover:bg-surface sm:right-4"
          >
            ›
          </button>
        ) : null}
      </div>

      {count > 1 ? (
        <p className="pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] text-center text-xs text-surface/80">
          {t("photoLightbox.keyboardHint")}
        </p>
      ) : null}
    </div>,
    document.body
  );
}
