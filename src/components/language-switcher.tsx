"use client";

/**
 * Prepínač jazyka — appka toto nemá (appka ide podľa systémového
 * jazyka telefónu, appka nemá URL), pre web je to nová vec. V hlavičke
 * vedľa zvončeka (Rastio, 17.9.2026: „chybu kde si zmením jazyk... hneď
 * hore ako je zvonček"), viditeľný aj BEZ prihlásenia — jazyk webu nemá
 * s účtom nič spoločné.
 *
 * Sám si zistí aktuálny jazyk z URL (rovnaký vzor ako `LocalizedLink`)
 * a prepne na TEN ISTÝ obsah v inom jazyku — nie na domovskú stránku.
 *
 * JEDNO TLAČIDLO (Rastio, 17.9.2026: „prepínač jazykov daj do jedného
 * tlačidla") — predtým tri samostatné odkazy (SK/EN/DE) vedľa seba
 * v lište. Teraz JEDNO tlačidlo s aktuálnym jazykom + šípkou, ktoré
 * otvára menu s ostatnými dvoma voľbami — rovnaký prístupný vzor ako
 * `AddListingCta` (`aria-haspopup`/`aria-expanded`, Escape zatvorí
 * a vráti fokus, klik mimo zatvorí, `role="menu"`/`"menuitem"`).
 */
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

import { isLocale, LOCALES, type Locale } from "@/i18n";
import { localizeHref } from "@/i18n/href";

const NAMES: Record<Locale, string> = { sk: "SK", en: "EN", de: "DE" };

function LanguageSwitcherInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const segments = pathname.split("/");
  const maybeLocale = segments[1];
  const current: Locale = isLocale(maybeLocale) && maybeLocale !== "sk" ? maybeLocale : "sk";
  const barePath = current === "sk" ? pathname : "/" + segments.slice(2).join("/");
  const qs = searchParams.toString();
  const hrefFor = (locale: Locale) => localizeHref(locale, barePath || "/") + (qs ? `?${qs}` : "");

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="relative flex items-center">
      <button
        type="button"
        ref={toggleRef}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-9 items-center gap-1 rounded-full px-2.5 text-sm font-semibold text-text-primary hover:bg-surface-pressed"
      >
        {NAMES[current]}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-11 z-20 flex w-28 flex-col gap-0.5 rounded-2xl border border-border bg-surface p-1.5 shadow-[var(--shadow-card)]"
        >
          {LOCALES.filter((locale) => locale !== current).map((locale) => (
            <Link
              key={locale}
              href={hrefFor(locale)}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-2 text-sm font-medium text-text-primary hover:bg-surface-pressed"
            >
              {NAMES[locale]}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function LanguageSwitcher() {
  return (
    <Suspense fallback={<div className="h-9 w-14" />}>
      <LanguageSwitcherInner />
    </Suspense>
  );
}
