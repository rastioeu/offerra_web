"use client";

import { useState } from "react";

import { offerValidityDaysLabel } from "@/lib/offer-validity";
import { t, language } from "@/i18n";

/**
 * Platnosť ponuky pri podaní — prenesené z appky (`OfferValidityPicker`),
 * rovnaké rýchle voľby (bez vlastného dátumu, appka to má zámerne tiež
 * takto). Vypĺňa skryté pole `validUntil` vo formulári okolo neho.
 */
function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(23, 59, 0, 0);
  return d.toISOString();
}

export function OfferValidityPicker({ defaultValue }: { defaultValue?: string | null }) {
  const [value, setValue] = useState<string | null>(defaultValue ?? null);
  const choices: { days: number | null; label: string }[] = [
    { days: null, label: t("offerValidity.pickerNone") },
    ...[1, 3, 7, 14, 30].map((days) => ({ days, label: offerValidityDaysLabel(t, language, days) })),
  ];

  function matches(days: number | null): boolean {
    if (days === null) return value === null;
    if (!value) return false;
    return new Date(value).toDateString() === new Date(daysFromNow(days)).toDateString();
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-text-primary">{t("offerValidity.pickerLabel")}</label>
      <p className="text-xs text-text-muted">{t("offerValidity.pickerHint")}</p>
      <div className="flex flex-wrap gap-2">
        {choices.map((c) => (
          <button
            key={c.label}
            type="button"
            onClick={() => setValue(c.days === null ? null : daysFromNow(c.days))}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
              matches(c.days)
                ? "border-accent-deep bg-accent-soft text-accent-deep"
                : "border-border bg-surface text-text-secondary hover:border-border-strong"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>
      <input type="hidden" name="validUntil" value={value ?? ""} />
    </div>
  );
}
