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
 * Filter nad katalógom — PIATY POKUS (Rastio, 17.9.2026): bočný stĺpec
 * voľne plávajúcich čipov („pôsobí divne") → horná lišta s rozbaľovacími
 * menu („klikateľný filter je lepší") → tri stlačené riadky čipov („moc
 * veľké") → jeden zhustený riadok bez viditeľného odstupu medzi skupinami
 * („lepšie ale medzi tými troma filtrami daj medzeru alebo niečo na
 * dizajn").
 *
 * Tri skupiny (typ obchodu / typ nehnuteľnosti / triedenie) sú teraz
 * VLASTNÉ `<div>` bloky vo vnútri jedného panela — každá ďalšia (od
 * druhej) má na `sm:` a vyššie `border-l` + `pl-5`, čo dáva skutočný
 * vizuálny odstup A deliacu čiaru naraz, nie len 1px čiarku na dotyk.
 * Na mobile sa `border-l`/`pl` vypína (`sm:` variant) — čiara nalepená
 * na ľavý okraj zalomeného riadku by vyzerala ako chyba, nie dizajn.
 *
 * Čipy sú obyčajné odkazy (funguje bez JS, vlastná indexovateľná URL na
 * filter), nie `<select>`.
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
    `rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
      active
        ? "border-accent-deep bg-accent-soft text-accent-deep"
        : "border-border bg-surface text-text-secondary hover:border-border-strong"
    }`;
  const groupCls = "flex flex-wrap items-center gap-1.5";
  const separatedGroupCls = `${groupCls} sm:border-l sm:border-border sm:pl-5`;

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-border bg-surface px-4 py-2.5 shadow-[var(--shadow-card)]">
      <div className={groupCls}>
        <Link href={hrefWith(locale, searchParams, "transaction", null)} className={chip(activeTransaction == null)}>
          {t("catalog.filterAll")}
        </Link>
        {TRANSACTIONS.map((tr) => (
          <Link key={tr} href={hrefWith(locale, searchParams, "transaction", tr)} className={chip(activeTransaction === tr)}>
            {transactionLabel[tr]}
          </Link>
        ))}
      </div>

      <div className={separatedGroupCls}>
        <Link href={hrefWith(locale, searchParams, "type", null)} className={chip(activePropertyType == null)}>
          {t("catalog.filterAllTypes")}
        </Link>
        {PROPERTY_TYPES.map((pt) => (
          <Link key={pt} href={hrefWith(locale, searchParams, "type", pt)} className={chip(activePropertyType === pt)}>
            {propertyLabel[pt]}
          </Link>
        ))}
      </div>

      <div className={separatedGroupCls}>
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

      {!isFilterEmpty(filter) ? (
        <Link href={localizeHref(locale, "/")} className="ml-auto text-xs font-medium text-link hover:underline">
          {t("catalog.clearFilter")}
        </Link>
      ) : null}
    </div>
  );
}
