"use client";

/**
 * Obal, ktorý dovolí zavrieť kartu pod ním — appka ukladá zatvorenie
 * do PROFILU (appka: nedôveruje appkovému stavu pre trvalé rozhodnutia),
 * web pre toto zatiaľ nemá kam — `localStorage` je teda vedomý
 * kompromis: per-prehliadač, nie per-účet, ale lepšie než karta, čo sa
 * nedá schovať (Rastio, 17.9.2026).
 */
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { createT, isLocale } from "@/i18n";

export function DismissibleCard({ storageKey, children }: { storageKey: string; children: ReactNode }) {
  const pathname = usePathname();
  const maybeLocale = pathname.split("/")[1];
  const locale = isLocale(maybeLocale) && maybeLocale !== "sk" ? maybeLocale : "sk";
  const t = createT(locale);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(storageKey) === "1") setDismissed(true);
    } catch {
      // súkromné okno / zablokované úložisko — karta zostane viditeľná
    }
  }, [storageKey]);

  if (dismissed) return null;

  return (
    <div className="relative">
      {children}
      <button
        type="button"
        onClick={() => {
          setDismissed(true);
          try {
            localStorage.setItem(storageKey, "1");
          } catch {
            // nedá sa uložiť — karta sa v tejto relácii aj tak zavrie
          }
        }}
        aria-label={t("ui.close")}
        className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-surface text-sm text-text-muted hover:text-text-primary"
      >
        ✕
      </button>
    </div>
  );
}
