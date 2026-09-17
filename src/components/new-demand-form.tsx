"use client";

import { useState, useTransition } from "react";

import { createDemandAction } from "@/app/dopyty/novy/actions";
import { Button } from "@/components/button";
import { CityPicker } from "@/components/city-picker";
import { getDemandLabel, getPropertyLabel } from "@/lib/labels";
import type { PropertyType, TransactionType } from "@/lib/property";
import { t } from "@/i18n";

const TRANSACTIONS: TransactionType[] = ["SALE", "RENT"];
const PROPERTY_TYPES: (PropertyType | "ANY")[] = ["ANY", "APARTMENT", "HOUSE", "LAND", "COMMERCIAL", "OTHER"];

export function NewDemandForm() {
  const [transaction, setTransaction] = useState<TransactionType>("SALE");
  const [city, setCity] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const demandLabel = getDemandLabel(t);
  const propertyLabel = getPropertyLabel(t);
  const isRent = transaction === "RENT";

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        await createDemandAction(formData);
      } catch (e) {
        // `redirect()` v Server Action vyhodí VLASTNÚ, Next.js-om
        // rozpoznateľnú výnimku (`digest` začína `NEXT_REDIRECT`) — tú
        // treba pustiť ďalej, inak presmerovanie po úspechu nenastane.
        // Skutočné chyby (zlá suma a pod.) túto vlastnosť nemajú.
        if (
          e &&
          typeof e === "object" &&
          "digest" in e &&
          typeof (e as { digest?: unknown }).digest === "string" &&
          (e as { digest: string }).digest.startsWith("NEXT_REDIRECT")
        ) {
          throw e;
        }
        setError(e instanceof Error ? e.message : "Vytvorenie zlyhalo");
      }
    });
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-5">
      <p className="text-sm text-text-secondary">{t("dopytNovy.leadPublic")}</p>
      <p className="text-sm text-text-muted">{t("dopytNovy.leadPrivate")}</p>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-text-primary">{t("dopytNovy.whatSeekingLabel")}</span>
        <div className="flex gap-2">
          {TRANSACTIONS.map((tr) => (
            <button
              key={tr}
              type="button"
              onClick={() => setTransaction(tr)}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
                transaction === tr
                  ? "border-accent-deep bg-accent-soft text-accent-deep"
                  : "border-border bg-surface text-text-secondary"
              }`}
            >
              {demandLabel[tr]}
            </button>
          ))}
        </div>
        <input type="hidden" name="transaction" value={transaction} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-text-primary">{t("dopytNovy.propertyTypeLabel")}</label>
        <select
          name="propertyType"
          defaultValue="ANY"
          className="w-fit rounded-xl border border-border-strong bg-surface px-4 py-2.5 text-text-primary focus:border-accent-deep focus:outline-none"
        >
          {PROPERTY_TYPES.map((pt) => (
            <option key={pt} value={pt}>
              {pt === "ANY" ? t("dopytNovy.propertyTypeAny") : propertyLabel[pt]}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-text-primary">{t("dopytDetail.locationLabel")}</label>
        <div className="w-full max-w-xs">
          <CityPicker value={city || null} onPick={(picked) => setCity(picked.city)} />
        </div>
        <input type="hidden" name="city" value={city} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="budgetMin" className="text-sm font-medium text-text-primary">
            {t(isRent ? "dopytNovy.budgetMinRentLabel" : "dopytNovy.budgetMinSaleLabel")}
          </label>
          <input
            id="budgetMin"
            name="budgetMin"
            type="text"
            inputMode="decimal"
            placeholder={t(isRent ? "dopytNovy.budgetMinRentPlaceholder" : "dopytNovy.budgetMinSalePlaceholder")}
            className="w-full rounded-xl border border-border-strong bg-surface px-4 py-2.5 text-text-primary focus:border-accent-deep focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="budgetMax" className="text-sm font-medium text-text-primary">
            {t(isRent ? "dopytNovy.budgetMaxRentLabel" : "dopytNovy.budgetMaxSaleLabel")}
          </label>
          <p className="text-xs text-text-muted">
            {t(isRent ? "dopytNovy.budgetMaxRentHint" : "dopytNovy.budgetMaxSaleHint")}
          </p>
          <input
            id="budgetMax"
            name="budgetMax"
            type="text"
            inputMode="decimal"
            placeholder={t(isRent ? "dopytNovy.budgetMaxRentPlaceholder" : "dopytNovy.budgetMaxSalePlaceholder")}
            className="w-full rounded-xl border border-border-strong bg-surface px-4 py-2.5 text-text-primary focus:border-accent-deep focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="rooms" className="text-sm font-medium text-text-primary">
            {t("dopytNovy.roomsLabel")}
          </label>
          <input
            id="rooms"
            name="rooms"
            type="text"
            inputMode="numeric"
            placeholder={t("dopytNovy.roomsPlaceholder")}
            className="w-full rounded-xl border border-border-strong bg-surface px-4 py-2.5 text-text-primary focus:border-accent-deep focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="area" className="text-sm font-medium text-text-primary">
            {t("dopytNovy.areaLabel")}
          </label>
          <input
            id="area"
            name="area"
            type="text"
            inputMode="numeric"
            placeholder={t("dopytNovy.areaPlaceholder")}
            className="w-full rounded-xl border border-border-strong bg-surface px-4 py-2.5 text-text-primary focus:border-accent-deep focus:outline-none"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="description" className="text-sm font-medium text-text-primary">
          {t("dopytNovy.descriptionLabel")}
        </label>
        <p className="text-xs text-text-muted">{t("dopytNovy.descriptionHint")}</p>
        <textarea
          id="description"
          name="description"
          rows={4}
          required
          placeholder={t(isRent ? "dopytNovy.descriptionPlaceholderRent" : "dopytNovy.descriptionPlaceholderSale")}
          className="w-full rounded-xl border border-border-strong bg-surface px-4 py-2.5 text-text-primary focus:border-accent-deep focus:outline-none"
        />
      </div>

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <Button type="submit" disabled={pending} className="w-fit px-6 py-3">
        {pending ? t("dopytNovy.savingButton") : t("dopytNovy.publishButton")}
      </Button>
    </form>
  );
}
