import type { Metadata } from "next";

import { CatalogFilters } from "@/components/catalog-filters";
import { DismissibleCard } from "@/components/dismissible-card";
import { HowItWorksCard } from "@/components/how-it-works-card";
import { PropertyCard } from "@/components/property-card";
import { SearchBox } from "@/components/search-box";
import { fetchCatalog } from "@/lib/catalog";
import { getPropertyLabel, getTransactionLabel } from "@/lib/labels";
import { catalogCountLabel, type CatalogSort, type PropertyType, type TransactionType } from "@/lib/property";
import { EMPTY_FILTER, parseQuery, type CatalogFilter } from "@/lib/search";
import { getLocale, getT } from "@/i18n/server";

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
  const t = await getT();
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
  const baseTitle = parts.length > 0 ? parts.join(" ") : t("catalog.title");
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
  const [t, language] = await Promise.all([getT(), getLocale()]);
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
      <header className="mx-auto flex w-full max-w-2xl flex-col items-center gap-4 text-center">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-text-primary">{t("catalog.title")}</h1>
          <p className="text-text-secondary">{t("catalog.lead")}</p>
        </div>
        <div className="w-full max-w-[420px]">
          <SearchBox initialValue={one(params.q) ?? ""} />
        </div>
      </header>

      <div className="mx-auto w-full max-w-md">
        <DismissibleCard storageKey="offerra-hiw-home-dismissed">
          <HowItWorksCard locale={language} />
        </DismissibleCard>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
        <CatalogFilters
          searchParams={currentSearchParams}
          activeTransaction={filter.transaction}
          activePropertyType={filter.propertyType}
          activeSort={sort}
        />

        <div className="flex flex-1 flex-col gap-4">
          {properties.length > 0 ? (
            <p className="text-sm font-medium text-text-secondary">
              {catalogCountLabel(t, language, properties.length)}
            </p>
          ) : null}

          {understood.length > 0 ? (
            <p className="text-sm text-text-muted">
              {t("catalog.understoodPrefix")}
              {understood.join(", ")}
            </p>
          ) : null}

          {properties.length === 0 ? (
            <p className="text-text-muted">{t("catalog.noMatchTitle")}</p>
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
