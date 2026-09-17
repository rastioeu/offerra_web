"use client";

import { useTransition } from "react";

import { setAppConfig } from "@/app/admin/actions";

/** Jeden nastaviteľný prah — appka: riadok v „SETTINGS" tabe. Platí ihneď. */
export function AdminConfigRow({ configKey, value, label, hint }: { configKey: string; value: string; label: string; hint: string | null }) {
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    const next = String(formData.get("value") ?? "").trim();
    if (next === "") return;
    startTransition(() => void setAppConfig(configKey, next));
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-1 rounded-xl border border-border bg-surface p-3">
      <label htmlFor={`cfg-${configKey}`} className="text-sm font-medium text-text-primary">
        {label}
      </label>
      {hint ? <p className="text-xs text-text-muted">{hint}</p> : null}
      <div className="flex items-center gap-2 pt-1">
        <input
          id={`cfg-${configKey}`}
          name="value"
          type="text"
          inputMode="numeric"
          defaultValue={value}
          className="w-28 rounded-xl border border-border-strong bg-surface px-3 py-1.5 text-sm text-text-primary focus:border-accent-deep focus:outline-none"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-primary px-3 py-1.5 text-sm font-semibold text-on-primary hover:opacity-90 disabled:opacity-60"
        >
          Uložiť
        </button>
        <span className="text-xs text-text-muted">Teraz platí: {value}</span>
      </div>
    </form>
  );
}
