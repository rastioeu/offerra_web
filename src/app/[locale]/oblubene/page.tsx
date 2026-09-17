import type { Metadata } from "next";

import { PropertyCard } from "@/components/property-card";
import { fetchFavoriteProperties } from "@/lib/favorites-data";
import { createClient } from "@/lib/supabase/server";
import { getLocale, getT, redirectLocalized } from "@/i18n/server";
import { loginRedirectPath } from "@/i18n/href";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("search.favoritesChip") };
}

/**
 * Obľúbené inzeráty — appka to má ako sekciu v Profile, web ako
 * samostatnú stránku (appka nemá vlastnú obrazovku na skopírovanie).
 */
export default async function FavoritesPage() {
  const [supabase, t, language] = await Promise.all([createClient(), getT(), getLocale()]);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return redirectLocalized(loginRedirectPath(language, "/oblubene"));

  const properties = await fetchFavoriteProperties(user.id);

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-text-primary">{t("search.favoritesChip")}</h1>

      {properties.length === 0 ? (
        <p className="text-text-muted">{t("profil.favoritesEmptyWeb")}</p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </main>
  );
}
