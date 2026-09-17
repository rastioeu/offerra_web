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
 * Filter nad katalógom — ŠIESTY POKUS (Rastio, 17.9.2026). Postupnosť:
 * bočný stĺpec voľne plávajúcich čipov („pôsobí divne") → horná lišta
 * s rozbaľovacími menu („klikateľný filter je lepší") → tri stlačené
 * riadky hore („moc veľké") → jeden zhustený riadok hore („daj medzeru")
 * → viditeľnejší odstup medzi skupinami → „nie je to dobré, daj to na
 * bok, ale lepšie rozlož, aby som to vedel filtrovať naraz aj na
 * notebooku."
 *
 * Späť na BOK, ale nie pôvodná voľne plávajúca verzia z prvého pokusu —
 * KAŽDÁ skupina (typ obchodu / typ nehnuteľnosti / triedenie) je teraz
 * VLASTNÁ SEKCIA s nadpisom, v ukotvenej karte s tenkými deliacimi
 * čiarami medzi sekciami. Tri sekcie POD SEBOU (nie v jednom riadku) —
 * na boku je výška zadarmo (karta rastie vedľa mriežky, nezaberá miesto
 * NAD ňou ako predošlé pokusy), takže tu už „príliš veľké" nehrozí, a
 * všetky tri kategórie sú vidieť a klikateľné NARAZ, bez skrolovania či
 * rozbaľovania — presne to, čo Rastio žiadal aj pre notebook šírky
 * (panel má pevnú, kompaktnú `lg:w-64`, nie plávajúcu šírku, ktorá by sa
 * pri užšom okne notebooku nafúkla).
 *
 * MOBIL (Rastio, 17.9.2026: „pole je dobre, filtre neprehľadné") — pod
 * `lg:` je tento panel PLNOU šírkou NAD mriežkou (appka aj web
 * webu nemá zatiaľ mobilnú dvojstĺpcovú alternatívu k bočnému panelu),
 * takže zabalené (`flex-wrap`) čipy pri piatich typoch nehnuteľností
 * vedeli natiahnuť sekciu na viacero riadkov nepredvídateľne — vyzeralo
 * to ako stena čipov, nie usporiadaný zoznam. Každý riadok čipov je
 * teraz pod `lg:` VODOROVNE POSÚVATEĽNÝ (`overflow-x-auto`, žiadne
 * zalamovanie) — pevná, predvídateľná výška na sekciu bez ohľadu na
 * počet čipov, nadpis sekcie ostáva čitateľný nad ním. Od `lg:` sa
 * vracia späť na zalamovanie (`lg:flex-wrap`), kde je šírka panela
 * pevná a menší počet čipov na sekciu sa zmestí bez potreby posúvania.
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
    `shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
      active
        ? "border-accent-deep bg-accent-soft text-accent-deep"
        : "border-border bg-surface text-text-secondary hover:border-border-strong"
    }`;
  const sectionTitleCls = "text-xs font-semibold uppercase tracking-wide text-text-muted";
  const divider = <div className="h-px bg-border" />;

  return (
    <aside className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-4 shadow-[var(--shadow-card)] lg:w-64 lg:shrink-0">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-text-primary">{t("catalog.filtersTitle")}</h2>
        {!isFilterEmpty(filter) ? (
          <Link href={localizeHref(locale, "/")} className="text-xs font-medium text-link hover:underline">
            {t("catalog.clearFilter")}
          </Link>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <p className={sectionTitleCls}>{t("filterRows.transactionTitle")}</p>
        <div className="flex gap-2 overflow-x-auto pb-0.5 lg:flex-wrap lg:overflow-visible lg:pb-0">
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

      {divider}

      <div className="flex flex-col gap-2">
        <p className={sectionTitleCls}>{t("filterRows.propertyTypeTitle")}</p>
        <div className="flex gap-2 overflow-x-auto pb-0.5 lg:flex-wrap lg:overflow-visible lg:pb-0">
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

      {divider}

      <div className="flex flex-col gap-2">
        <p className={sectionTitleCls}>{t("catalog.sortSectionTitle")}</p>
        <div className="flex gap-2 overflow-x-auto pb-0.5 lg:flex-wrap lg:overflow-visible lg:pb-0">
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
    </aside>
  );
}
