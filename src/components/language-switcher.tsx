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
 */
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { isLocale, LOCALES, type Locale } from "@/i18n";
import { localizeHref } from "@/i18n/href";

const NAMES: Record<Locale, string> = { sk: "SK", en: "EN", de: "DE" };

function LanguageSwitcherInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const segments = pathname.split("/");
  const maybeLocale = segments[1];
  const current: Locale = isLocale(maybeLocale) && maybeLocale !== "sk" ? maybeLocale : "sk";
  const barePath = current === "sk" ? pathname : "/" + segments.slice(2).join("/");
  const qs = searchParams.toString();

  return (
    <div className="flex items-center gap-0.5 text-sm">
      {LOCALES.map((locale) => {
        const active = locale === current;
        const href = localizeHref(locale, barePath || "/") + (qs ? `?${qs}` : "");
        return (
          <Link
            key={locale}
            href={href}
            aria-current={active ? "true" : undefined}
            className={`rounded-lg px-1.5 py-1 ${
              active ? "font-semibold text-text-primary" : "font-medium text-text-muted hover:text-text-secondary"
            }`}
          >
            {NAMES[locale]}
          </Link>
        );
      })}
    </div>
  );
}

export function LanguageSwitcher() {
  return (
    <Suspense fallback={<div className="h-7 w-[90px]" />}>
      <LanguageSwitcherInner />
    </Suspense>
  );
}
