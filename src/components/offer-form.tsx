"use client";

import { useState, useTransition } from "react";

import { submitOffer } from "@/app/inzerat/[id]/actions";
import { Button } from "@/components/button";
import { OfferValidityPicker } from "@/components/offer-validity-picker";
import { getEmploymentOptions, type TenantProfile } from "@/lib/offers";
import { t } from "@/i18n";

export function OfferForm({
  propertyId,
  transactionType,
  existing,
  existingTenant,
}: {
  propertyId: string;
  transactionType: "SALE" | "RENT";
  existing: { id: string; amount: number; message: string | null; valid_until: string | null } | null;
  existingTenant?: TenantProfile | null;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [hasPets, setHasPets] = useState(existingTenant?.has_pets ?? false);
  const isRent = transactionType === "RENT";
  const employmentOptions = getEmploymentOptions(t);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        await submitOffer(propertyId, existing?.id ?? null, formData);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Odoslanie zlyhalo");
      }
    });
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-4">
      <h3 className="font-semibold text-text-primary">{existing ? "Upraviť moju ponuku" : "Podať ponuku"}</h3>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="amount" className="text-sm font-medium text-text-primary">
          Suma (€)
        </label>
        <input
          id="amount"
          name="amount"
          type="text"
          inputMode="decimal"
          defaultValue={existing?.amount ?? ""}
          required
          className="w-full rounded-xl border border-border-strong bg-surface px-4 py-2.5 text-text-primary focus:border-accent-deep focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="message" className="text-sm font-medium text-text-primary">
          Odkaz predávajúcemu (nepovinné)
        </label>
        <textarea
          id="message"
          name="message"
          rows={3}
          defaultValue={existing?.message ?? ""}
          className="w-full rounded-xl border border-border-strong bg-surface px-4 py-2.5 text-text-primary focus:border-accent-deep focus:outline-none"
        />
      </div>

      <OfferValidityPicker defaultValue={existing?.valid_until} />

      <input type="hidden" name="transactionType" value={transactionType} />

      {isRent ? (
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface-pressed p-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-text-muted">
              {t("ponukaForm.tenantSection")}
            </p>
            <p className="text-xs text-text-muted">{t("ponukaForm.tenantNote")}</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="numPeople" className="text-sm font-medium text-text-primary">
              {t("ponukaForm.peopleLabel")}
            </label>
            <input
              id="numPeople"
              name="numPeople"
              type="text"
              inputMode="numeric"
              defaultValue={existingTenant?.num_people ?? ""}
              placeholder={t("ponukaForm.peoplePlaceholder")}
              required={isRent}
              className="w-full rounded-xl border border-border-strong bg-surface px-4 py-2.5 text-text-primary focus:border-accent-deep focus:outline-none"
            />
            <p className="text-xs text-text-muted">{t("ponukaForm.peopleHint")}</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-text-primary">{t("ponukaForm.petsLabel")}</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setHasPets(false)}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium ${!hasPets ? "border-accent-deep bg-accent-soft text-accent-deep" : "border-border bg-surface text-text-secondary"}`}
              >
                {t("ponukaForm.petsNo")}
              </button>
              <button
                type="button"
                onClick={() => setHasPets(true)}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium ${hasPets ? "border-accent-deep bg-accent-soft text-accent-deep" : "border-border bg-surface text-text-secondary"}`}
              >
                {t("ponukaForm.petsYes")}
              </button>
            </div>
            <input type="hidden" name="hasPets" value={hasPets ? "YES" : "NO"} />
          </div>

          {hasPets ? (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="petDetails" className="text-sm font-medium text-text-primary">
                {t("ponukaForm.petDetailsLabel")}
              </label>
              <input
                id="petDetails"
                name="petDetails"
                type="text"
                defaultValue={existingTenant?.pet_details ?? ""}
                placeholder={t("ponukaForm.petDetailsPlaceholder")}
                className="w-full rounded-xl border border-border-strong bg-surface px-4 py-2.5 text-text-primary focus:border-accent-deep focus:outline-none"
              />
            </div>
          ) : null}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="leaseMonths" className="text-sm font-medium text-text-primary">
              {t("ponukaForm.monthsLabel")}
            </label>
            <input
              id="leaseMonths"
              name="leaseMonths"
              type="text"
              inputMode="numeric"
              defaultValue={existingTenant?.lease_duration_months ?? ""}
              placeholder={t("ponukaForm.monthsPlaceholder")}
              className="w-full rounded-xl border border-border-strong bg-surface px-4 py-2.5 text-text-primary focus:border-accent-deep focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="employmentStatus" className="text-sm font-medium text-text-primary">
              {t("ponukaForm.employmentLabel")}
            </label>
            <select
              id="employmentStatus"
              name="employmentStatus"
              defaultValue={existingTenant?.employment_status ?? employmentOptions[0]}
              className="w-full rounded-xl border border-border-strong bg-surface px-4 py-2.5 text-text-primary focus:border-accent-deep focus:outline-none"
            >
              {employmentOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="monthlyIncome" className="text-sm font-medium text-text-primary">
              {t("ponukaForm.incomeLabel")}
            </label>
            <input
              id="monthlyIncome"
              name="monthlyIncome"
              type="text"
              inputMode="decimal"
              defaultValue={existingTenant?.monthly_income_hint ?? ""}
              placeholder={t("ponukaForm.incomePlaceholder")}
              className="w-full rounded-xl border border-border-strong bg-surface px-4 py-2.5 text-text-primary focus:border-accent-deep focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="tenantNote" className="text-sm font-medium text-text-primary">
              {t("ponukaForm.noteLabel")}
            </label>
            <textarea
              id="tenantNote"
              name="tenantNote"
              rows={2}
              defaultValue={existingTenant?.note ?? ""}
              placeholder={t("ponukaForm.notePlaceholder")}
              className="w-full rounded-xl border border-border-strong bg-surface px-4 py-2.5 text-text-primary focus:border-accent-deep focus:outline-none"
            />
          </div>
        </div>
      ) : null}

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <Button type="submit" disabled={pending} className="w-fit px-5 py-2.5">
        {pending ? "Odosielam…" : existing ? "Uložiť zmenu" : "Podať ponuku"}
      </Button>
    </form>
  );
}
