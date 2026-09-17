import type { Metadata } from "next";
import Link from "next/link";

import { DemandCard } from "@/components/demand-card";
import { DemandFilters } from "@/components/demand-filters";
import { fetchDemands } from "@/lib/demand-data";
import type { PropertyType, TransactionType } from "@/lib/property";
import { EMPTY_FILTER, isFilterEmpty, parseQuery, type CatalogFilter } from "@/lib/search";
import { getLocale, getT } from "@/i18n/server";
import { localizeHref } from "@/i18n/href";

export const metadata: Metadata = {
  title: "Dopyty",
  description:
    "Zoznam dopytov po nehnuteľnostiach na Offerra — čo ľudia hľadajú, s akým rozpočtom a v ktorej lokalite.",
  alternates: { canonical: "https://app.offerra.sk/dopyty" },
};

type SearchParams = Record<string, string | string[] | undefined>;

function one(v: string | string[] | undefined): string | null {
  return typeof v === "string" && v.length > 0 ? v : null;
}

function buildFilter(params: SearchParams): { filter: CatalogFilter; understood: string[] } {
  const q = one(params.q);
  const parsed = q ? parseQuery(q) : { filter: EMPTY_FILTER, understood: [] };
  const transaction = (one(params.transaction) as TransactionType | null) ?? parsed.filter.transaction;
  const propertyType = (one(params.type) as PropertyType | null) ?? parsed.filter.propertyType;
  return { filter: { ...parsed.filter, transaction, propertyType }, understood: parsed.understood };
}

/**
 * Verejný katalóg dopytov — appka: `(tabs)/dopyty.tsx` + `useRequests`.
 * Rovnaký vzor ako katalóg inzerátov (URL filtre, `parseQuery` pre voľný
 * text), len druhý smer trhu — ľudia, ktorí niečo HĽADAJÚ.
 */
export default async function DemandsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const [t, language] = await Promise.all([getT(), getLocale()]);
  const params = await searchParams;
  const { filter, understood } = buildFilter(params);
  const demands = await fetchDemands(filter);

  const currentSearchParams = new URLSearchParams(
    Object.entries(params).flatMap(([k, v]) =>
      v == null ? [] : Array.isArray(v) ? v.map((x) => [k, x] as [string, string]) : [[k, v] as [string, string]]
    )
  );

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-text-primary">{t("dopyty.title")}</h1>
          <p className="text-text-secondary">{t("dopyty.lead")}</p>
        </div>
        <Link
          href={localizeHref(language, "/dopyty/novy")}
          className="w-fit rounded-xl bg-primary px-5 py-2.5 font-semibold text-on-primary hover:opacity-90"
        >
          {t("dopyty.addDemand")}
        </Link>
      </header>

      <DemandFilters
        searchParams={currentSearchParams}
        activeTransaction={filter.transaction}
        activePropertyType={filter.propertyType}
      />

      {understood.length > 0 ? <p className="text-sm text-text-muted">Rozumiem: {understood.join(", ")}</p> : null}
      {!isFilterEmpty(filter) ? (
        <Link href={localizeHref(language, "/dopyty")} className="w-fit text-sm text-link hover:underline">
          {t("dopyty.clearFilters")}
        </Link>
      ) : null}

      {demands.length === 0 ? (
        <div className="flex flex-col gap-1">
          <p className="font-semibold text-text-primary">
            {isFilterEmpty(filter) ? t("dopyty.emptyStateTitle") : t("dopyty.noMatchTitle")}
          </p>
          <p className="text-text-muted">{isFilterEmpty(filter) ? t("dopyty.emptyStateBody") : t("dopyty.noMatchBody")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {demands.map((d) => (
            <DemandCard key={d.id} demand={d} />
          ))}
        </div>
      )}
    </main>
  );
}
