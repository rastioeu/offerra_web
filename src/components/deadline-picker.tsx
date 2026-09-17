"use client";

import { useState } from "react";

import type { TFunc } from "@/i18n";

/** Uzávierka príjmu ponúk — prenesené z appky (`DeadlinePicker`), rovnaké rýchle voľby. */
function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(23, 59, 0, 0);
  return d.toISOString();
}

export function DeadlinePicker({
  defaultValue,
  onChange,
  t,
}: {
  defaultValue: string | null;
  onChange: (iso: string | null) => void;
  t: TFunc;
}) {
  const [value, setValue] = useState<string | null>(defaultValue);
  const choices: { days: number | null; label: string }[] = [
    { days: null, label: t("deadlinePicker.none") },
    { days: 7, label: t("deadlinePicker.days", { count: 7 }) },
    { days: 14, label: t("deadlinePicker.days", { count: 14 }) },
    { days: 30, label: t("deadlinePicker.days", { count: 30 }) },
  ];

  function matches(days: number | null): boolean {
    if (days === null) return value === null;
    if (!value) return false;
    return new Date(value).toDateString() === new Date(daysFromNow(days)).toDateString();
  }

  function pick(days: number | null) {
    const iso = days === null ? null : daysFromNow(days);
    setValue(iso);
    onChange(iso);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-text-primary">{t("deadlinePicker.label")}</label>
      <p className="text-xs text-text-muted">{t("deadlinePicker.hint")}</p>
      <div className="flex flex-wrap gap-2">
        {choices.map((c) => (
          <button
            key={c.label}
            type="button"
            onClick={() => pick(c.days)}
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
    </div>
  );
}
