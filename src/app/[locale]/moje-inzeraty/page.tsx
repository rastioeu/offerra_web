import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { createDraftAction } from "@/app/[locale]/moje-inzeraty/actions";
import { Button } from "@/components/button";
import { formatArea, formatPrice, formatRooms, getStatusLabel } from "@/lib/property";
import { fetchMyProperties } from "@/lib/my-properties";
import { createClient } from "@/lib/supabase/server";
import { getLocale, getT } from "@/i18n/server";

export const metadata: Metadata = {
  title: "Moje inzeráty",
};

/**
 * Chránená stránka — bez prihlásenia rovno na `/login` s návratom sem
 * (`?next=/moje-inzeraty`), rovnaký vzor ako appka pri appkových
 * obrazovkách za prihlásením.
 */
export default async function MyPropertiesPage() {
  const [supabase, t, language] = await Promise.all([createClient(), getT(), getLocale()]);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/moje-inzeraty");

  const properties = await fetchMyProperties(user.id);
  const statusLabel = getStatusLabel(t);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-text-primary">Moje inzeráty</h1>
        <form action={createDraftAction}>
          <Button type="submit" className="px-5 py-2.5 text-sm">
            Pridať inzerát
          </Button>
        </form>
      </div>

      {properties.length === 0 ? (
        <p className="text-text-muted">Zatiaľ nemáš žiadny inzerát.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {properties.map((property) => {
            const price = formatPrice(t, property.asking_price_hint, property.transaction_type);
            const rooms = formatRooms(t, language, property.rooms);
            const area = formatArea(property.area_m2);
            const meta = [property.city, rooms, area].filter(Boolean).join(" · ");
            const photo = property.media[0]?.url;

            return (
              <div
                key={property.id}
                className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-3 hover:border-border-strong"
              >
                <Link href={`/inzerat/${property.id}`} className="relative h-16 w-20 flex-none overflow-hidden rounded-lg bg-surface-pressed">
                  {photo ? <Image src={photo} alt="" fill sizes="80px" className="object-cover" /> : null}
                </Link>
                <Link href={`/inzerat/${property.id}`} className="flex flex-1 flex-col gap-0.5">
                  <span className="font-semibold text-text-primary">{property.title || "Bez názvu"}</span>
                  {meta ? <span className="text-sm text-text-muted">{meta}</span> : null}
                </Link>
                <div className="flex flex-col items-end gap-1">
                  {price ? <span className="font-money font-bold text-accent">{price}</span> : null}
                  <span className="rounded-full bg-surface-pressed px-2 py-0.5 text-xs font-medium text-text-secondary">
                    {statusLabel[property.status]}
                  </span>
                  <Link href={`/moje-inzeraty/${property.id}/upravit`} className="text-xs font-semibold text-link hover:underline">
                    Upraviť
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
