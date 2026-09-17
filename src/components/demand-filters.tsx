import Link from "next/link";

import { Button } from "@/components/button";
import { getDemandLabel, getPropertyLabel } from "@/lib/labels";
import type { PropertyType, TransactionType } from "@/lib/property";
import { getLocale, getT } from "@/i18n/server";
import { localizeHref } from "@/i18n/href";
import type { Locale } from "@/i18n";

const TRANSACTIONS: TransactionType[] = ["SALE", "RENT"];
const PROPERTY_TYPES: PropertyType[] = ["APARTMENT", "HOUSE", "LAND", "COMMERCIAL", "OTHER"];

function hrefWith(locale: Locale, current: URLSearchParams, key: string, value: string | null): string {
  const next = new URLSearchParams(current);
  if (value == null) next.delete(key);
  else next.set(key, value);
  const qs = next.toString();
  return localizeHref(locale, qs ? `/dopyty?${qs}` : "/dopyty");
}

/**
 * Rovnaký vzor ako `CatalogFilters` pri inzerátoch, len slová z pohľadu
 * HĽADAJÚCEHO (`getDemandLabel`, nie `getTransactionLabel` — appka:
 * „Predaj" pri dopyte znie, akoby človek predával) a bez triedenia —
 * appka dopyty triedi len podľa novosti, `buyer_request` nemá uzávierku.
 */
export async function DemandFilters({
  searchParams,
  activeTransaction,
  activePropertyType,
}: {
  searchParams: URLSearchParams;
  activeTransaction: TransactionType | null;
  activePropertyType: PropertyType | null;
}) {
  const [t, locale] = await Promise.all([getT(), getLocale()]);
  const demandLabel = getDemandLabel(t);
  const propertyLabel = getPropertyLabel(t);

  const chip = (active: boolean) =>
    `rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
      active
        ? "border-accent-deep bg-accent-soft text-accent-deep"
        : "border-border bg-surface text-text-secondary hover:border-border-strong"
    }`;

  return (
    <div className="flex flex-col gap-3">
      <form method="get" action={localizeHref(locale, "/dopyty")} className="flex gap-2">
        <input
          type="text"
          name="q"
          defaultValue={searchParams.get("q") ?? ""}
          placeholder={t("searchBar.placeholderDemand")}
          className="w-full rounded-xl border border-border-strong bg-surface px-4 py-2.5 text-text-primary placeholder:text-text-placeholder focus:border-accent-deep focus:outline-none"
        />
        {activeTransaction ? <input type="hidden" name="transaction" value={activeTransaction} /> : null}
        {activePropertyType ? <input type="hidden" name="type" value={activePropertyType} /> : null}
        <Button type="submit" className="px-5 py-2.5">
          {t("catalog.searchButton")}
        </Button>
      </form>

      <div className="flex flex-wrap gap-2">
        <Link href={hrefWith(locale, searchParams, "transaction", null)} className={chip(activeTransaction == null)}>
          {t("catalog.filterAll")}
        </Link>
        {TRANSACTIONS.map((tr) => (
          <Link key={tr} href={hrefWith(locale, searchParams, "transaction", tr)} className={chip(activeTransaction === tr)}>
            {demandLabel[tr]}
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
    </div>
  );
}
