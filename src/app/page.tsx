import type { Metadata } from "next";
import Link from "next/link";

import { CatalogFilters } from "@/components/catalog-filters";
import { PropertyCard } from "@/components/property-card";
import { fetchCatalog } from "@/lib/catalog";
import { getPropertyLabel, getTransactionLabel } from "@/lib/labels";
import type { CatalogSort, PropertyType, TransactionType } from "@/lib/property";
import { EMPTY_FILTER, isFilterEmpty, parseQuery, type CatalogFilter } from "@/lib/search";
import { t } from "@/i18n";

/**
 * Katalóg = domovská stránka. SEO je hlavný dôvod projektu (Rastio) —
 * verejný zoznam inzerátov patrí na `/`, nie za prihlásenie.
 * Filtre idú cez URL parametre (`?q=&transaction=&type=&sort=`), nie
 * klientský stav — filtrovaný výsledok má vlastnú indexovateľnú URL a
 * funguje aj bez JS (obyčajné odkazy/GET formulár). Každá filtrovaná
 * URL má preto VLASTNÝ title/description a self-referencing canonical
 * (nie zbiehanie na `/`) — je to samostatná, zmysluplná stránka
 * („Byty na prenájom v Bratislave"), nie duplicita domovskej.
 */
type SearchParams = Record<string, string | string[] | undefined>;

function one(v: string | string[] | undefined): string | null {
  return typeof v === "string" && v.length > 0 ? v : null;
}

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }): Promise<Metadata> {
  const params = await searchParams;
  const { filter } = buildFilter(params);

  const transactionLabel = filter.transaction ? getTransactionLabel(t)[filter.transaction] : null;
  const typeLabel = filter.propertyType ? getPropertyLabel(t)[filter.propertyType] : null;
  const parts = [typeLabel, transactionLabel && `na ${transactionLabel.toLowerCase()}`, filter.city && `v ${filter.city}`].filter(
    Boolean
  );
  // `generateMetadata` na koreňovej `/` route z nejasného dôvodu
  // neaplikuje `title.template` z `layout.tsx` (zmerané, nie odvodené
  // — `/dopyty` aj `/login`, obe so statickým `export const metadata`,
  // príponu " | Offerra" dostanú správne, len táto dynamická route
  // nie) — prípona je preto tu explicitne, nie spoliehanie sa na dedenie.
  const baseTitle = parts.length > 0 ? parts.join(" ") : "Nehnuteľnosti";
  const title = `${baseTitle} | Offerra`;

  const qs = new URLSearchParams(
    Object.entries(params).flatMap(([k, v]) => (v == null ? [] : Array.isArray(v) ? v.map((x) => [k, x] as [string, string]) : [[k, v] as [string, string]]))
  ).toString();
  const canonical = qs ? `https://app.offerra.sk/?${qs}` : "https://app.offerra.sk/";

  return {
    title,
    description:
      parts.length > 0
        ? `${baseTitle} — obrátený trh s nehnuteľnosťami, kde predávajúci nemusí povedať cenu.`
        : undefined,
    alternates: { canonical },
  };
}

/**
 * Text v `?q=` sa parsuje ROVNAKO ako appka (`parseQuery`) — „3 izbový
 * byt Bratislava do 150000" sa rozloží na štruktúrovaný filter.
 * Explicitné `?transaction=`/`?type=` z klikacích filtrov MAJÚ PREDNOSŤ
 * pred tým, čo vyplynulo z textu — používateľ klikol zámerne.
 */
function buildFilter(params: SearchParams): { filter: CatalogFilter; understood: string[] } {
  const q = one(params.q);
  const parsed = q ? parseQuery(q) : { filter: EMPTY_FILTER, understood: [] };

  const transaction = (one(params.transaction) as TransactionType | null) ?? parsed.filter.transaction;
  const propertyType = (one(params.type) as PropertyType | null) ?? parsed.filter.propertyType;

  return {
    filter: { ...parsed.filter, transaction, propertyType },
    understood: parsed.understood,
  };
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const { filter, understood } = buildFilter(params);
  const sort: CatalogSort = one(params.sort) === "ENDING_SOON" ? "ENDING_SOON" : "NEWEST";

  const properties = await fetchCatalog(filter, sort);
  const currentSearchParams = new URLSearchParams(
    Object.entries(params).flatMap(([k, v]) =>
      v == null ? [] : Array.isArray(v) ? v.map((x) => [k, x] as [string, string]) : [[k, v] as [string, string]]
    )
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: properties.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://app.offerra.sk/inzerat/${p.id}`,
    })),
  };

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      {properties.length > 0 ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      ) : null}
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-text-primary">Nehnuteľnosti</h1>
        <p className="text-text-secondary">
          Obrátený trh s nehnuteľnosťami — predávajúci nemusí povedať cenu,
          záujemcovia predkladajú vlastné ponuky.
        </p>
      </header>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-10">
        <CatalogFilters
          searchParams={currentSearchParams}
          activeTransaction={filter.transaction}
          activePropertyType={filter.propertyType}
          activeSort={sort}
        />

        <div className="flex flex-1 flex-col gap-4">
          {understood.length > 0 ? (
            <p className="text-sm text-text-muted">
              Rozumiem: {understood.join(", ")}
            </p>
          ) : null}

          {!isFilterEmpty(filter) ? (
            <Link href="/" className="w-fit text-sm text-link hover:underline">
              Vymazať filter
            </Link>
          ) : null}

          {properties.length === 0 ? (
            <p className="text-text-muted">Žiadne inzeráty nezodpovedajú filtru.</p>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
