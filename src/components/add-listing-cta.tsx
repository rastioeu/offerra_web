"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";

import { createDraftAction } from "@/app/[locale]/moje-inzeraty/actions";
import type { Locale } from "@/i18n";
import { localizeHref } from "@/i18n/href";

/**
 * CTA „+ Pridať inzerát" v hornej lište (Rastio, 17.9.2026: „vpravo
 * voľné miesto, doplň tam jasné CTA tlačidlo... plné akcentové
 * tlačidlo... jediný sýto farebný prvok v inak neutrálnej lište").
 *
 * SPLIT BUTTON — appka má dva smery (ponuka vs. dopyt, appkový tab
 * „Pridať"), tlačidlo preto nie je jeden odkaz, ale hlavná časť +
 * malá šípka:
 *  - klik na text „+ Pridať inzerát" ide rovno na častejšiu akciu —
 *    volá `createDraftAction` (rovnaká appková logika: DRAFT vzniká
 *    v DB HNEĎ, nie až po vyplnení formulára, appka: `pridat.tsx`),
 *    ktorá presmeruje na editor novo založeného konceptu.
 *  - šípka otvára menu s DVOMA voľbami (Pridať inzerát / Pridať
 *    dopyt) — dopyt je obyčajný odkaz na `/dopyty/novy` (appka:
 *    formulár tam už existuje, netreba nový flow).
 *
 * Klávesnica: šípka je `aria-haspopup="menu"` + `aria-expanded`,
 * položky menu majú `role="menuitem"`, Escape zatvorí a vráti fokus na
 * šípku, klik mimo zatvorí. Menu sa nezobrazí neprihlásenému — appka aj
 * web vyžadujú účet na založenie inzerátu aj dopytu.
 *
 * `locale` (nie hotová `href` funkcia) — `SiteHeader` je Server
 * Component, funkcie sa cez RSC hranicu do klientskej komponenty
 * poslať nedajú (zmerané: `next build` prešiel, ale runtime spadol na
 * „Functions cannot be passed directly to Client Components"). `href`
 * sa preto skladá TU, z reťazca, rovnakým `localizeHref` ako všade
 * inde.
 */
export function AddListingCta({
  locale,
  addListingLabel,
  addDemandLabel,
  loading,
}: {
  locale: Locale;
  addListingLabel: string;
  addDemandLabel: string;
  loading: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const wrapRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

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

  function createListing() {
    setOpen(false);
    startTransition(async () => {
      await createDraftAction();
    });
  }

  return (
    <div ref={wrapRef} className="relative flex items-center">
      <div className="flex h-9 items-stretch overflow-hidden rounded-full bg-accent-deep text-on-primary">
        <button
          type="button"
          onClick={createListing}
          disabled={pending}
          className="flex items-center px-3.5 text-sm font-semibold hover:bg-accent disabled:opacity-70"
        >
          {pending ? loading : `+ ${addListingLabel}`}
        </button>
        <button
          type="button"
          ref={toggleRef}
          onClick={() => setOpen((v) => !v)}
          disabled={pending}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label={addDemandLabel}
          className="flex items-center border-l border-on-primary/25 px-2 hover:bg-accent disabled:opacity-70"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      </div>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-11 z-20 flex w-52 flex-col gap-0.5 rounded-2xl border border-border bg-surface p-1.5 shadow-[var(--shadow-card)]"
        >
          <button
            type="button"
            role="menuitem"
            onClick={createListing}
            className="rounded-xl px-3 py-2 text-left text-sm font-medium text-text-primary hover:bg-surface-pressed"
          >
            {addListingLabel}
          </button>
          <Link
            href={localizeHref(locale, "/dopyty/novy")}
            role="menuitem"
            onClick={() => setOpen(false)}
            className="rounded-xl px-3 py-2 text-sm font-medium text-text-primary hover:bg-surface-pressed"
          >
            {addDemandLabel}
          </Link>
        </div>
      ) : null}
    </div>
  );
}
