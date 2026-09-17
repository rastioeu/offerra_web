import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ListingEditorForm } from "@/components/listing-editor-form";
import { PhotoManager } from "@/components/photo-manager";
import { fetchProperty } from "@/lib/detail";
import { getStatusLabel } from "@/lib/property";
import { createClient } from "@/lib/supabase/server";
import { getLocale, getT, redirectLocalized } from "@/i18n/server";
import { loginRedirectPath, localizeHref } from "@/i18n/href";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("inzeratEdit.editScreenTitle") };
}

/**
 * Editor inzerátu (appka: `inzerat/[id].tsx`, jedna obrazovka na
 * vytvorenie AJ úpravu — DRAFT je len inzerát, ktorý ešte nie je
 * zverejnený). ZJEDNODUŠENÉ oproti appke — appka ukladá KAŽDÉ pole
 * priebežne (autosave, `useFormDraft`), web má jedno tlačidlo „Uložiť"
 * pre celý formulár naraz. `CityPicker`/`StreetPicker` (2 925 obcí,
 * rovnaký dopyt do `offerra.city`/`offerra.street`) sú od 17.9.2026
 * prenesené 1:1 — priznané zjednodušenie zostáva len pri autosave.
 */
export default async function ListingEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [t, language] = await Promise.all([getT(), getLocale()]);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return redirectLocalized(loginRedirectPath(language, `/moje-inzeraty/${id}/upravit`));

  const property = await fetchProperty(id);
  if (!property) notFound();
  if (property.owner_id !== user.id) return redirectLocalized(`/inzerat/${id}`);

  const statusLabel = getStatusLabel(t);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <Link href={localizeHref(language, "/moje-inzeraty")} className="text-sm text-link hover:underline">
          ← Moje inzeráty
        </Link>
        <span className="rounded-full bg-surface-pressed px-2.5 py-1 text-xs font-semibold text-text-secondary">
          {statusLabel[property.status]}
        </span>
      </div>

      <h1 className="text-2xl font-bold text-text-primary">{property.title || "Nový inzerát"}</h1>

      <PhotoManager propertyId={property.id} media={property.media} />
      <ListingEditorForm property={property} language={language} />
    </main>
  );
}
