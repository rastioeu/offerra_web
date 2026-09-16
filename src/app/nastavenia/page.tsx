import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { signOut } from "@/app/auth/actions";
import { DeleteAccountButton } from "@/components/delete-account-button";
import { ExportDataButton } from "@/components/export-data-button";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Nastavenia",
};

/**
 * Zámerne UŽŠIE než appková obrazovka (push notifikácie, motív, kontaktné
 * údaje) — to, čo web zatiaľ reálne má. Prepínač jazyka (SK/EN/DE) tu
 * ZÁMERNE nie je: web zatiaľ renderuje len SK (otvorené rozhodnutie,
 * `reports/OFFERRA_WEB_MILNIK1.md`) — vypínač, čo nič neprepne, by len
 * klamal.
 */
export default async function NastaveniaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/nastavenia");

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-text-primary">Nastavenia</h1>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">Účet</h2>
        <p className="text-text-secondary">{user.email}</p>
        <form action={signOut}>
          <button type="submit" className="w-fit text-sm text-link hover:underline">
            Odhlásiť sa
          </button>
        </form>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">Moje dáta</h2>
        <ExportDataButton />
      </section>

      <section className="flex flex-col gap-3 border-t border-border pt-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">Nebezpečná zóna</h2>
        <DeleteAccountButton />
      </section>
    </main>
  );
}
