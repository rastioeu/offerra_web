"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { createT, isLocale } from "@/i18n";
import { localizeHref } from "@/i18n/href";
import { getPropertyLabel, getTransactionLabel } from "@/lib/labels";
import type { CatalogSort, PropertyType, TransactionType } from "@/lib/property";

const TRANSACTIONS: TransactionType[] = ["SALE", "RENT"];
const PROPERTY_TYPES: PropertyType[] = ["APARTMENT", "HOUSE", "LAND", "COMMERCIAL", "OTHER"];
const SORT_VALUES: CatalogSort[] = ["NEWEST", "ENDING_SOON"];

/**
 * Kompaktná horná lišta filtrov — nahrádza bočný stĺpec s čipmi
 * (Rastio, 17.9.2026: „bočný filter pôsobí divne" — vybraná varianta B
 * z jeho návrhu, ktorú sám odporučil: „pri katalógu s kartami je lepšie
 * nechať čo najviac šírky na samotné inzeráty"). Nemám ako reálne
 * porovnať oba návrhy vizuálne (žiadny prehliadač v tomto prostredí), tak
 * ide táto — B má aj druhý dôvod naviac: predtým `lg:w-64` bočný stĺpec
 * zobral takmer štvrtinu šírky obrazovky len pre tri filtre a triedenie,
 * teraz je to jeden riadok nad kartami.
 *
 * TRI `<select>`, jeden riadok, zalamuje sa na mobile. Zmena hodnoty
 * rovno mení URL (`router.replace`, rovnaký vzor ako `SearchBox`) —
 * filter má stále vlastnú indexovateľnú URL, len sa k nej dochádza cez
 * menu, nie kliknutím na čip.
 */
export function CatalogFilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const maybeLocale = pathname.split("/")[1];
  const locale = isLocale(maybeLocale) && maybeLocale !== "sk" ? maybeLocale : "sk";
  const t = createT(locale);

  const activeTransaction = (searchParams.get("transaction") as TransactionType | null) ?? null;
  const activePropertyType = (searchParams.get("type") as PropertyType | null) ?? null;
  const activeSort: CatalogSort = searchParams.get("sort") === "ENDING_SOON" ? "ENDING_SOON" : "NEWEST";

  function setParam(key: string, value: string | null) {
    const next = new URLSearchParams(searchParams.toString());
    if (value == null) next.delete(key);
    else next.set(key, value);
    const qs = next.toString();
    router.replace(localizeHref(locale, qs ? `/?${qs}` : "/"));
  }

  const transactionLabel = getTransactionLabel(t);
  const propertyLabel = getPropertyLabel(t);

  const boxCls =
    "flex items-center gap-1.5 rounded-xl border border-border-strong bg-surface px-3 py-2 text-sm text-text-primary";
  const selectCls = "cursor-pointer bg-transparent text-text-primary focus:outline-none";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className={boxCls}>
        <span className="text-text-muted">{t("filterRows.transactionTitle")}</span>
        <select
          value={activeTransaction ?? ""}
          onChange={(e) => setParam("transaction", e.target.value || null)}
          className={selectCls}
        >
          <option value="">{t("catalog.filterAll")}</option>
          {TRANSACTIONS.map((tr) => (
            <option key={tr} value={tr}>
              {transactionLabel[tr]}
            </option>
          ))}
        </select>
      </label>

      <label className={boxCls}>
        <span className="text-text-muted">{t("filterRows.propertyTypeTitle")}</span>
        <select
          value={activePropertyType ?? ""}
          onChange={(e) => setParam("type", e.target.value || null)}
          className={selectCls}
        >
          <option value="">{t("catalog.filterAllTypes")}</option>
          {PROPERTY_TYPES.map((pt) => (
            <option key={pt} value={pt}>
              {propertyLabel[pt]}
            </option>
          ))}
        </select>
      </label>

      <label className={boxCls}>
        <span className="text-text-muted">{t("catalog.sortSectionTitle")}</span>
        <select
          value={activeSort}
          onChange={(e) => setParam("sort", e.target.value === "NEWEST" ? null : e.target.value)}
          className={selectCls}
        >
          {SORT_VALUES.map((s) => (
            <option key={s} value={s}>
              {s === "NEWEST" ? t("filterRows.sortNewest") : t("filterRows.sortEndingSoon")}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
