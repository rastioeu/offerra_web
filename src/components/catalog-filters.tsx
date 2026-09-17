import Link from "next/link";

import { getPropertyLabel, getTransactionLabel } from "@/lib/labels";
import type { CatalogSort, PropertyType, TransactionType } from "@/lib/property";
import { getLocale, getT } from "@/i18n/server";
import { localizeHref } from "@/i18n/href";
import type { Locale } from "@/i18n";

const TRANSACTIONS: TransactionType[] = ["SALE", "RENT"];
const PROPERTY_TYPES: PropertyType[] = ["APARTMENT", "HOUSE", "LAND", "COMMERCIAL", "OTHER"];
const SORT_VALUES: CatalogSort[] = ["NEWEST", "ENDING_SOON"];

/** Aktuálne URL parametre s JEDNÝM poľom zmeneným (alebo zmazaným, ak `value` je `null`). */
function hrefWith(locale: Locale, current: URLSearchParams, key: string, value: string | null): string {
  const next = new URLSearchParams(current);
  if (value == null) next.delete(key);
  else next.set(key, value);
  const qs = next.toString();
  return localizeHref(locale, qs ? `/?${qs}` : "/");
}

/**
 * Tri riadky filtra (Predaj/Prenájom · typ nehnuteľnosti · triedenie) sú
 * obyčajné odkazy (bez JS), takže filtrovaný katalóg je stále SSR a má
 * vlastnú indexovateľnú URL (napr. `/?transaction=SALE&type=APARTMENT`).
 *
 * `SearchBox` (voľné vyhľadávanie, appka: živo, debounce 350ms) tu ZÁMERNE
 * NIE JE — presunuté nad tento riadok na celú šírku stránky (Rastio,
 * 17.9.2026: v úzkom `lg:w-64` bočnom stĺpci si ho pri prezeraní webu
 * nevšimol a nahlásil ho ako chýbajúci pole).
 */
export async function CatalogFilters({
  searchParams,
  activeTransaction,
  activePropertyType,
  activeSort,
}: {
  searchParams: URLSearchParams;
  activeTransaction: TransactionType | null;
  activePropertyType: PropertyType | null;
  activeSort: CatalogSort;
}) {
  const [t, locale] = await Promise.all([getT(), getLocale()]);
  const transactionLabel = getTransactionLabel(t);
  const propertyLabel = getPropertyLabel(t);
  const sortLabel: Record<CatalogSort, string> = {
    NEWEST: t("filterRows.sortNewest"),
    ENDING_SOON: t("filterRows.sortEndingSoon"),
  };

  const chip = (active: boolean) =>
    `rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
      active
        ? "border-accent-deep bg-accent-soft text-accent-deep"
        : "border-border bg-surface text-text-secondary hover:border-border-strong"
    }`;

  return (
    <div className="flex flex-col gap-5 lg:w-64 lg:shrink-0">
      <div className="flex flex-col gap-2">
        <p className="hidden text-xs font-semibold uppercase tracking-wide text-text-muted lg:block">
          {t("filterRows.transactionTitle")}
        </p>
        <div className="flex flex-wrap gap-2 lg:flex-col lg:flex-nowrap lg:items-start">
          <Link href={hrefWith(locale, searchParams, "transaction", null)} className={chip(activeTransaction == null)}>
            {t("catalog.filterAll")}
          </Link>
          {TRANSACTIONS.map((tr) => (
            <Link key={tr} href={hrefWith(locale, searchParams, "transaction", tr)} className={chip(activeTransaction === tr)}>
              {transactionLabel[tr]}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="hidden text-xs font-semibold uppercase tracking-wide text-text-muted lg:block">
          {t("filterRows.propertyTypeTitle")}
        </p>
        <div className="flex flex-wrap gap-2 lg:flex-col lg:flex-nowrap lg:items-start">
          <Link href={hrefWith(locale, searchParams, "type", null)} className={chip(activePropertyType == null)}>
            {t("catalog.filterAllTypes")}
          </Link>
          {PROPERTY_TYPES.map((pt) => (
            <Link key={pt} href={hrefWith(locale, searchParams, "type", pt)} className={chip(activePropertyType === pt)}>
              {propertyLabel[pt]}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="hidden text-xs font-semibold uppercase tracking-wide text-text-muted lg:block">
          {t("catalog.sortSectionTitle")}
        </p>
        <div className="flex flex-wrap gap-2 lg:flex-col lg:flex-nowrap lg:items-start">
          {SORT_VALUES.map((sortValue) => (
            <Link
              key={sortValue}
              href={hrefWith(locale, searchParams, "sort", sortValue === "NEWEST" ? null : sortValue)}
              className={chip(activeSort === sortValue)}
            >
              {sortLabel[sortValue]}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
