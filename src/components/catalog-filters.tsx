import Link from "next/link";

import { getPropertyLabel, getTransactionLabel } from "@/lib/labels";
import type { CatalogSort, PropertyType, TransactionType } from "@/lib/property";
import { t } from "@/i18n";

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
 * Tri riadky filtra (Predaj/Prenájom · typ nehnuteľnosti · triedenie) +
 * voľné vyhľadávanie. Bez klientského JS — obyčajné odkazy/GET formulár,
 * takže filtrovaný katalóg je stále SSR a má vlastnú indexovateľnú URL
 * (napr. `/?transaction=SALE&type=APARTMENT`).
 */
export function CatalogFilters({
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
  const transactionLabel = getTransactionLabel(t);
  const propertyLabel = getPropertyLabel(t);

  const chip = (active: boolean) =>
    `rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
      active
        ? "border-accent-deep bg-accent-soft text-accent-deep"
        : "border-border bg-surface text-text-secondary hover:border-border-strong"
    }`;

  return (
    <div className="flex flex-col gap-3">
      <form method="get" className="flex gap-2">
        <input
          type="text"
          name="q"
          defaultValue={searchParams.get("q") ?? ""}
          placeholder="napr. 3 izbový byt Bratislava do 150000"
          className="w-full rounded-xl border border-border-strong bg-surface px-4 py-2.5 text-text-primary placeholder:text-text-placeholder focus:border-accent-deep focus:outline-none"
        />
        {/* zachovať ostatné aktívne filtre pri odoslaní vyhľadávania */}
        {activeTransaction ? <input type="hidden" name="transaction" value={activeTransaction} /> : null}
        {activePropertyType ? <input type="hidden" name="type" value={activePropertyType} /> : null}
        {activeSort !== "NEWEST" ? <input type="hidden" name="sort" value={activeSort} /> : null}
        <button
          type="submit"
          className="rounded-xl bg-primary px-5 py-2.5 font-semibold text-on-primary hover:opacity-90"
        >
          Hľadať
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        <Link href={hrefWith(searchParams, "transaction", null)} className={chip(activeTransaction == null)}>
          Všetko
        </Link>
        {TRANSACTIONS.map((tr) => (
          <Link key={tr} href={hrefWith(searchParams, "transaction", tr)} className={chip(activeTransaction === tr)}>
            {transactionLabel[tr]}
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

      <div className="flex flex-wrap gap-2">
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
  );
}
