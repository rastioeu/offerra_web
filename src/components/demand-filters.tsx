import Link from "next/link";

import { Button } from "@/components/button";
import { getDemandLabel, getPropertyLabel } from "@/lib/labels";
import type { PropertyType, TransactionType } from "@/lib/property";
import { t } from "@/i18n";

const TRANSACTIONS: TransactionType[] = ["SALE", "RENT"];
const PROPERTY_TYPES: PropertyType[] = ["APARTMENT", "HOUSE", "LAND", "COMMERCIAL", "OTHER"];

function hrefWith(current: URLSearchParams, key: string, value: string | null): string {
  const next = new URLSearchParams(current);
  if (value == null) next.delete(key);
  else next.set(key, value);
  const qs = next.toString();
  return qs ? `/dopyty?${qs}` : "/dopyty";
}

/**
 * Rovnaký vzor ako `CatalogFilters` pri inzerátoch, len slová z pohľadu
 * HĽADAJÚCEHO (`getDemandLabel`, nie `getTransactionLabel` — appka:
 * „Predaj" pri dopyte znie, akoby človek predával) a bez triedenia —
 * appka dopyty triedi len podľa novosti, `buyer_request` nemá uzávierku.
 */
export function DemandFilters({
  searchParams,
  activeTransaction,
  activePropertyType,
}: {
  searchParams: URLSearchParams;
  activeTransaction: TransactionType | null;
  activePropertyType: PropertyType | null;
}) {
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
      <form method="get" action="/dopyty" className="flex gap-2">
        <input
          type="text"
          name="q"
          defaultValue={searchParams.get("q") ?? ""}
          placeholder="napr. 2 izbový byt Bratislava do 800"
          className="w-full rounded-xl border border-border-strong bg-surface px-4 py-2.5 text-text-primary placeholder:text-text-placeholder focus:border-accent-deep focus:outline-none"
        />
        {activeTransaction ? <input type="hidden" name="transaction" value={activeTransaction} /> : null}
        {activePropertyType ? <input type="hidden" name="type" value={activePropertyType} /> : null}
        <Button type="submit" className="px-5 py-2.5">
          Hľadať
        </Button>
      </form>

      <div className="flex flex-wrap gap-2">
        <Link href={hrefWith(searchParams, "transaction", null)} className={chip(activeTransaction == null)}>
          Všetko
        </Link>
        {TRANSACTIONS.map((tr) => (
          <Link key={tr} href={hrefWith(searchParams, "transaction", tr)} className={chip(activeTransaction === tr)}>
            {demandLabel[tr]}
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href={hrefWith(searchParams, "type", null)} className={chip(activePropertyType == null)}>
          Všetky typy
        </Link>
        {PROPERTY_TYPES.map((pt) => (
          <Link key={pt} href={hrefWith(searchParams, "type", pt)} className={chip(activePropertyType === pt)}>
            {propertyLabel[pt]}
          </Link>
        ))}
      </div>
    </div>
  );
}
