import Link from "next/link";

import { getPropertyLabel, getTransactionLabel } from "@/lib/labels";
import type { CatalogSort, PropertyType, TransactionType } from "@/lib/property";
import { isFilterEmpty, type CatalogFilter } from "@/lib/search";
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
 * Filter nad katalógom — TRETÍ POKUS (Rastio, 17.9.2026): prvý bol bočný
 * stĺpec voľne plávajúcich čipov („pôsobí divne"), druhý horná lišta
 * s rozbaľovacími menu („nie je to dobré, klikateľný filter je lepší"),
 * tento je klikateľné čipy HORE nad zoznamom („skús dať klikateľný
 * filter najprv hore").
 *
 * Rozloženie TROCH RIADKOV PODĽA VÝZNAMU je zámerne rovnaké ako appkový
 * `SearchBar` (`src/components/search-bar.tsx`, „Poradie samo (Rastio,
 * 12.8.2026): najprv to, ČO človek hľadá — typ obchodu, typ
 * nehnuteľnosti. Až za tým triedenie") — nie nový vzor, len jeho web
 * ekvivalent v ukotvenej karte namiesto voľne plávajúcich čipov.
 * Čipy sú obyčajné odkazy (funguje bez JS, vlastná indexovateľná URL
 * na filter), nie `<select>`.
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
  const filter: CatalogFilter = {
    transaction: activeTransaction,
    propertyType: activePropertyType,
    text: searchParams.get("q"),
    city: null,
    priceMin: null,
    priceMax: null,
    roomsMin: null,
    areaMin: null,
    onlyFavorites: null,
  };

  const chip = (active: boolean) =>
    `rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
      active
        ? "border-accent-deep bg-accent-soft text-accent-deep"
        : "border-border bg-surface text-text-secondary hover:border-border-strong"
    }`;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 shadow-[var(--shadow-card)] sm:p-5">
      <div className="flex flex-wrap gap-2">
        <Link href={hrefWith(locale, searchParams, "transaction", null)} className={chip(activeTransaction == null)}>
          {t("catalog.filterAll")}
        </Link>
        {TRANSACTIONS.map((tr) => (
          <Link key={tr} href={hrefWith(locale, searchParams, "transaction", tr)} className={chip(activeTransaction === tr)}>
            {transactionLabel[tr]}
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href={hrefWith(locale, searchParams, "type", null)} className={chip(activePropertyType == null)}>
          {t("catalog.filterAllTypes")}
        </Link>
        {PROPERTY_TYPES.map((pt) => (
          <Link key={pt} href={hrefWith(locale, searchParams, "type", pt)} className={chip(activePropertyType === pt)}>
            {propertyLabel[pt]}
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
        {SORT_VALUES.map((sortValue) => (
          <Link
            key={sortValue}
            href={hrefWith(locale, searchParams, "sort", sortValue === "NEWEST" ? null : sortValue)}
            className={chip(activeSort === sortValue)}
          >
            {sortLabel[sortValue]}
          </Link>
        ))}
        {!isFilterEmpty(filter) ? (
          <Link href={localizeHref(locale, "/")} className="ml-auto text-xs font-medium text-link hover:underline">
            {t("catalog.clearFilter")}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
