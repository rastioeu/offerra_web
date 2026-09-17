import Link from "next/link";

import { SearchBox } from "@/components/search-box";
import { getPropertyLabel, getTransactionLabel } from "@/lib/labels";
import type { CatalogSort, PropertyType, TransactionType } from "@/lib/property";
import { getT } from "@/i18n/server";

const TRANSACTIONS: TransactionType[] = ["SALE", "RENT"];
const PROPERTY_TYPES: PropertyType[] = ["APARTMENT", "HOUSE", "LAND", "COMMERCIAL", "OTHER"];
const SORTS: { value: CatalogSort; label: string }[] = [
  { value: "NEWEST", label: "Najnovšie" },
  { value: "ENDING_SOON", label: "Končí čoskoro" },
];

/** Aktuálne URL parametre s JEDNÝM poľom zmeneným (alebo zmazaným, ak `value` je `null`). */
function hrefWith(current: URLSearchParams, key: string, value: string | null): string {
  const next = new URLSearchParams(current);
  if (value == null) next.delete(key);
  else next.set(key, value);
  const qs = next.toString();
  return qs ? `/?${qs}` : "/";
}

/**
 * Tri riadky filtra (Predaj/Prenájom · typ nehnuteľnosti · triedenie) sú
 * obyčajné odkazy (bez JS), takže filtrovaný katalóg je stále SSR a má
 * vlastnú indexovateľnú URL (napr. `/?transaction=SALE&type=APARTMENT`).
 * Voľné vyhľadávanie (`SearchBox`) JE klientské — appka vyhľadáva živo
 * (debounce 350ms), nie až po kliknutí na tlačidlo.
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
  const t = await getT();
  const transactionLabel = getTransactionLabel(t);
  const propertyLabel = getPropertyLabel(t);

  const chip = (active: boolean) =>
    `rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
      active
        ? "border-accent-deep bg-accent-soft text-accent-deep"
        : "border-border bg-surface text-text-secondary hover:border-border-strong"
    }`;

  return (
    <div className="flex flex-col gap-5 lg:w-64 lg:shrink-0">
      <SearchBox initialValue={searchParams.get("q") ?? ""} />

      <div className="flex flex-col gap-2">
        <p className="hidden text-xs font-semibold uppercase tracking-wide text-text-muted lg:block">
          Typ ponuky
        </p>
        <div className="flex flex-wrap gap-2 lg:flex-col lg:flex-nowrap lg:items-start">
          <Link href={hrefWith(searchParams, "transaction", null)} className={chip(activeTransaction == null)}>
            Všetko
          </Link>
          {TRANSACTIONS.map((tr) => (
            <Link key={tr} href={hrefWith(searchParams, "transaction", tr)} className={chip(activeTransaction === tr)}>
              {transactionLabel[tr]}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="hidden text-xs font-semibold uppercase tracking-wide text-text-muted lg:block">
          Typ nehnuteľnosti
        </p>
        <div className="flex flex-wrap gap-2 lg:flex-col lg:flex-nowrap lg:items-start">
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

      <div className="flex flex-col gap-2">
        <p className="hidden text-xs font-semibold uppercase tracking-wide text-text-muted lg:block">
          Triedenie
        </p>
        <div className="flex flex-wrap gap-2 lg:flex-col lg:flex-nowrap lg:items-start">
          {SORTS.map((s) => (
            <Link
              key={s.value}
              href={hrefWith(searchParams, "sort", s.value === "NEWEST" ? null : s.value)}
              className={chip(activeSort === s.value)}
            >
              {s.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
