"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import { createT, type Locale } from "@/i18n";
import type { Media } from "@/lib/property";

/**
 * Fullscreen prehliadač fotiek (Rastio, 28.9.2026: „nech sa zväčší a dá sa
 * ďalej listovať, zatvorí Esc alebo tlačidlo"; 28.9.2026, druhé kolo: pôvodné
 * vyzeranie s pilulkovými tlačidlami na svetlom podklade „nie je pekné" —
 * teraz čisté „kino": čierne pozadie, fotka bez rámu, tenké SVG šípky,
 * bodky namiesto textovej pilulky). Web má myš a klávesnicu, nie dotykové
 * gestá — preto žiadny text sľubujúci swipe (rovnaká zásada ako appka
 * CLAUDE.md §12a: text nesľubuje ovládanie, ktoré appka/web nemá).
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

  // Klávesnica: Esc zavrie, šípky listujú.
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

  // Bodky dávajú zmysel, len kým sa zmestia na jeden riadok bez tlačenice —
  // pri viac fotkách sa vracia na číselné počítadlo.
  const showDots = count > 1 && count <= 8;

  return createPortal(
    <div role="dialog" aria-modal="true" aria-label={title} className="fixed inset-0 z-50 bg-black">
      <button
        ref={closeButtonRef}
        type="button"
        onClick={onClose}
        aria-label={t("photoLightbox.closePhoto")}
        className="absolute right-3 top-[max(0.75rem,env(safe-area-inset-top,0px))] z-20 flex h-10 w-10 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white sm:right-5"
      >
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
          <path d="M5 5l14 14M19 5L5 19" />
        </svg>
      </button>

      {/* Klik mimo fotky (na čierne pozadie) tiež zatvorí. */}
      <div className="absolute inset-0 flex items-center justify-center" onClick={onClose}>
        <div
          className="relative h-[calc(100%-5.5rem)] w-full max-w-6xl px-14 sm:px-20"
          style={{ marginTop: "env(safe-area-inset-top, 0px)" }}
          onClick={(e) => e.stopPropagation()}
        >
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
      </div>

      {count > 1 ? (
        <>
          <button
            type="button"
            onClick={goPrev}
            aria-label={t("photoLightbox.prevPhoto")}
            className="absolute left-0 top-0 z-10 flex h-full w-12 items-center justify-center text-white/50 transition-colors hover:text-white sm:w-20"
          >
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label={t("photoLightbox.nextPhoto")}
            className="absolute right-0 top-0 z-10 flex h-full w-12 items-center justify-center text-white/50 transition-colors hover:text-white sm:w-20"
          >
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      ) : null}

      {count > 1 ? (
        <div className="absolute inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom,0px))] z-10 flex items-center justify-center">
          {showDots ? (
            <div className="flex items-center gap-2">
              {media.map((m, i) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onNavigate(i)}
                  aria-label={t("photoLightbox.counter", { n: i + 1, total: count })}
                  aria-current={i === index}
                  className="p-1.5"
                >
                  <span className={`block h-1.5 rounded-full transition-all ${i === index ? "w-5 bg-white" : "w-1.5 bg-white/40"}`} />
                </button>
              ))}
            </div>
          ) : (
            <span className="text-sm font-medium text-white/70">{t("photoLightbox.counter", { n: index + 1, total: count })}</span>
          )}
        </div>
      ) : null}
    </div>,
    document.body
  );
}
