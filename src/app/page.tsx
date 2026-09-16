import type { Metadata } from "next";

import { PropertyCard } from "@/components/property-card";
import { fetchCatalog } from "@/lib/catalog";

/**
 * Katalóg = domovská stránka. SEO je hlavný dôvod projektu (Rastio) —
 * verejný zoznam inzerátov patrí na `/`, nie za prihlásenie.
 * Server Component bez `"use client"` → beží na serveri, Google dostane
 * hotové HTML, nie prázdnu stránku čakajúcu na JS.
 */
export const metadata: Metadata = {
  title: "Nehnuteľnosti",
};

export default async function CatalogPage() {
  const properties = await fetchCatalog();

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-text-primary">Nehnuteľnosti</h1>
        <p className="text-text-secondary">
          Obrátený trh s nehnuteľnosťami — predávajúci nemusí povedať cenu,
          záujemcovia predkladajú vlastné ponuky.
        </p>
      </header>

      {properties.length === 0 ? (
        <p className="text-text-muted">Momentálne nie sú žiadne inzeráty.</p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </main>
  );
}
