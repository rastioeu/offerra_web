"use client";

import { useState } from "react";

import { computeMortgage, eur } from "@/lib/mortgage";
import { createT, type Locale } from "@/i18n";

const DEFAULT_RATE = 4.2;

function num(text: string, fallback: number): number {
  const v = Number(text.replace(",", ".").replace(/\s/g, ""));
  return Number.isFinite(v) && v > 0 ? v : fallback;
}

/**
 * Prenesené z appky (`MortgageCalculator`) — rovnaká logika a rovnaké
 * predvoľby. Zobrazuje sa LEN pri predaji (appka rovnako — pri prenájme
 * nemá čo počítať), o tom rozhoduje volajúca stránka, nie táto komponenta.
 */
export function MortgageCalculatorCard({
  price,
  topOffer,
  language,
}: {
  price?: number | null;
  topOffer?: number | null;
  language: Locale;
}) {
  const t = createT(language);
  const initial = price ?? topOffer ?? null;
  const [amount, setAmount] = useState(initial == null ? "" : String(initial));
  const [down, setDown] = useState<"10" | "20" | "30">("20");
  const [rate, setRate] = useState(String(DEFAULT_RATE));
  const [years, setYears] = useState<"20" | "25" | "30">("30");

  const entered = num(amount, 0);
  const r = computeMortgage({
    price: entered,
    downPaymentPct: Number(down),
    ratePct: num(rate, DEFAULT_RATE),
    years: Number(years),
  });

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-4">
      <h2 className="text-lg font-semibold text-text-primary">{t("mortgage.sectionTitle")}</h2>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-text-primary">{t("mortgage.priceLabel")}</label>
        <input
          type="text"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={t("mortgage.pricePlaceholder")}
          className="w-full rounded-xl border border-border-strong bg-surface px-4 py-2.5 text-text-primary focus:border-accent-deep focus:outline-none"
        />
        {topOffer != null && topOffer !== entered ? (
          <button
            type="button"
            onClick={() => setAmount(String(topOffer))}
            className="w-fit text-xs font-semibold text-link hover:underline"
          >
            {t("mortgage.useTopOffer", { amount: eur(topOffer) })}
          </button>
        ) : null}
      </div>

      <ChoiceRow
        label={t("mortgage.downPaymentLabel")}
        value={down}
        onChange={(v) => setDown(v as typeof down)}
        options={[
          { value: "10", label: "10 %" },
          { value: "20", label: "20 %" },
          { value: "30", label: "30 %" },
        ]}
      />
      <ChoiceRow
        label={t("mortgage.termLabel")}
        value={years}
        onChange={(v) => setYears(v as typeof years)}
        options={[20, 25, 30].map((n) => ({ value: String(n), label: t("mortgage.yearsCount", { count: n }) }))}
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-text-primary">{t("mortgage.rateLabel")}</label>
        <p className="text-xs text-text-muted">{t("mortgage.rateHint")}</p>
        <input
          type="text"
          inputMode="decimal"
          value={rate}
          onChange={(e) => setRate(e.target.value)}
          placeholder={t("mortgage.ratePlaceholder")}
          className="w-full max-w-[160px] rounded-xl border border-border-strong bg-surface px-4 py-2.5 text-text-primary focus:border-accent-deep focus:outline-none"
        />
      </div>

      {entered <= 0 ? (
        <p className="text-sm text-text-muted">{t("mortgage.emptyState")}</p>
      ) : (
        <>
          <div className="flex flex-col items-center gap-1 border-t border-border pt-4">
            <span className="text-sm text-text-secondary">{t("mortgage.monthlyApprox")}</span>
            <span className="font-money text-3xl font-bold text-primary">{eur(r.monthly)}</span>
          </div>
          <dl className="flex flex-col gap-1.5">
            <Row label={t("mortgage.downPaymentRow")} value={eur(r.downPayment)} />
            <Row label={t("mortgage.loanAmountRow")} value={eur(r.loan)} />
            <Row label={t("mortgage.totalInterestRow")} value={eur(r.totalInterest)} />
          </dl>
        </>
      )}

      <p className="text-xs text-text-muted">{t("mortgage.disclaimer")}</p>
    </section>
  );
}

function ChoiceRow({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-text-primary">{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
              value === o.value
                ? "border-accent-deep bg-accent-soft text-accent-deep"
                : "border-border bg-surface text-text-secondary hover:border-border-strong"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <dt className="text-text-muted">{label}</dt>
      <dd className="font-medium text-text-primary">{value}</dd>
    </div>
  );
}
