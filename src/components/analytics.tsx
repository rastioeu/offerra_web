"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { CONSENT_LABELS } from "@/lib/consent-labels";
import type { Locale } from "@/i18n";

const STORAGE_KEY = "offerra-analytics-consent";
export const OPEN_CONSENT_EVENT = "offerra:open-consent";
const LEGAL_PRIVACY = "https://rastioeu.github.io/offerra_web/privacy.html";

type Consent = "granted" | "denied" | null;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function readConsent(): Consent {
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

function loadGtag(id: string) {
  if (document.getElementById("gtag-js")) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  window.gtag("js", new Date());
  // `send_page_view: false` — v Next.js App Routeri je navigácia bez
  // načítania stránky, `page_view` posiela efekt nižšie pri KAŽDEJ zmene cesty.
  window.gtag("config", id, { send_page_view: false, anonymize_ip: true });
  const s = document.createElement("script");
  s.id = "gtag-js";
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  document.head.appendChild(s);
}

function disableGtag(id: string) {
  (window as unknown as Record<string, unknown>)[`ga-disable-${id}`] = true;
  for (const c of document.cookie.split(";")) {
    const name = c.split("=")[0].trim();
    if (name === "_ga" || name.startsWith("_ga_")) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${location.hostname}`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    }
  }
}

/**
 * Google Analytics so súhlasom (Rastio, 24.9.2026: „pridaj analytiku").
 * Starý WordPress mal Google tag `GT-WPQPTGWD` + Complianz (súhlas) —
 * nový web ich nemal ani jedno. GA sa načíta AŽ PO kliknutí na „Prijať"
 * (ePrivacy/GDPR: analytické cookies vyžadujú vopred udelený súhlas);
 * „Odmietnuť" je rovnako výrazné tlačidlo, nie skryté. Voľbu možno
 * zmeniť v pätičke („Nastavenia cookies"). ID je v `GA_MEASUREMENT_ID`
 * (`.env.local`); bez neho sa nevykreslí ani lišta, ani sa nič nenačíta.
 */
export function Analytics({ gaId, locale }: { gaId: string | null; locale: Locale }) {
  const pathname = usePathname();
  const [consent, setConsent] = useState<Consent>(null);
  const [ready, setReady] = useState(false);
  const [bannerOpen, setBannerOpen] = useState(false);
  const l = CONSENT_LABELS[locale];

  useEffect(() => {
    const c = readConsent();
    setConsent(c);
    setBannerOpen(c === null);
    setReady(true);
    const reopen = () => setBannerOpen(true);
    window.addEventListener(OPEN_CONSENT_EVENT, reopen);
    return () => window.removeEventListener(OPEN_CONSENT_EVENT, reopen);
  }, []);

  useEffect(() => {
    if (!gaId || consent !== "granted") return;
    (window as unknown as Record<string, unknown>)[`ga-disable-${gaId}`] = false;
    loadGtag(gaId);
  }, [gaId, consent]);

  useEffect(() => {
    if (!gaId || consent !== "granted" || !window.gtag) return;
    window.gtag("event", "page_view", {
      page_path: pathname + window.location.search,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [gaId, consent, pathname]);

  function choose(value: "granted" | "denied") {
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* súkromný režim — voľba platí aspoň do konca tejto relácie */
    }
    if (value === "denied" && gaId) disableGtag(gaId);
    setConsent(value);
    setBannerOpen(false);
  }

  if (!gaId || !ready || !bannerOpen) return null;

  return (
    <div
      role="dialog"
      aria-label={l.settings}
      className="fixed inset-x-3 bottom-3 z-40 mx-auto flex max-w-3xl flex-col gap-3 rounded-2xl border border-border bg-surface p-4 shadow-[var(--shadow-card)] sm:flex-row sm:items-center"
    >
      <p className="flex-1 text-sm text-text-secondary">
        {l.text}{" "}
        <a href={LEGAL_PRIVACY} target="_blank" rel="noopener noreferrer" className="text-link hover:underline">
          {l.privacy}
        </a>
      </p>
      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={() => choose("denied")}
          className="rounded-xl border border-border-strong bg-surface px-4 py-2 text-sm font-semibold text-text-primary hover:bg-surface-pressed"
        >
          {l.reject}
        </button>
        <button
          type="button"
          onClick={() => choose("granted")}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-on-primary hover:opacity-90"
        >
          {l.accept}
        </button>
      </div>
    </div>
  );
}
