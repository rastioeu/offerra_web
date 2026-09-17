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
 * Filter nad katalógom — ŠTVRTÝ POKUS (Rastio, 17.9.2026): bočný stĺpec
 * voľne plávajúcich čipov („pôsobí divne") → horná lišta s rozbaľovacími
 * menu („klikateľný filter je lepší") → klikateľné čipy v troch
 * stlačených riadkoch hore („je to lepšie ale nie dobre, sú to tri
 * riadky, je to moc veľké").
 *
 * Tri samostatné, vypchaté riadky (appkové rozloženie „tri riadky podľa
 * významu") na webe zaberali zbytočne veľa VÝŠKY — appka na to má celú
 * obrazovku, web má vedľa toho ešte hlavičku aj mriežku kariet. Preto sú
 * všetky skupiny čipov teraz v JEDNOM riadku, ktorý sa zalomí len keď na
 * to nie je miesto (nie vynútene vždy) — oddelené tenkou zvislou čiarou,
 * nie samostatnými `<div>` blokmi s vlastným odsadením. Menšie čipy
 * (`text-xs`, menší padding) a menší padding celého panela.
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
  const groupDivider = <span aria-hidden className="mx-0.5 hidden h-4 w-px shrink-0 bg-border sm:block" />;

  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-2 shadow-[var(--shadow-card)]">
      <Link href={hrefWith(locale, searchParams, "transaction", null)} className={chip(activeTransaction == null)}>
        {t("catalog.filterAll")}
      </Link>
      {TRANSACTIONS.map((tr) => (
        <Link key={tr} href={hrefWith(locale, searchParams, "transaction", tr)} className={chip(activeTransaction === tr)}>
          {transactionLabel[tr]}
        </Link>
      ))}

      {groupDivider}

      <Link href={hrefWith(locale, searchParams, "type", null)} className={chip(activePropertyType == null)}>
        {t("catalog.filterAllTypes")}
      </Link>
      {PROPERTY_TYPES.map((pt) => (
        <Link key={pt} href={hrefWith(locale, searchParams, "type", pt)} className={chip(activePropertyType === pt)}>
          {propertyLabel[pt]}
        </Link>
      ))}

      {groupDivider}

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
        <Link href={localizeHref(locale, "/")} className="ml-auto pl-1 text-xs font-medium text-link hover:underline">
          {t("catalog.clearFilter")}
        </Link>
      ) : null}
    </div>
  );
}
