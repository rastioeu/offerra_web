import type { Metadata } from "next";

import { signOut } from "@/app/auth/actions";
import { DeleteAccountButton } from "@/components/delete-account-button";
import { ExportDataButton } from "@/components/export-data-button";
import { HowItWorksCard } from "@/components/how-it-works-card";
import { ProfileEditForm } from "@/components/profile-edit-form";
import { fetchMyProfile } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";
import { getLocale, redirectLocalized } from "@/i18n/server";
import { loginRedirectPath } from "@/i18n/href";

export const metadata: Metadata = {
  title: "Nastavenia",
};

/**
 * Zámerne UŽŠIE než appková obrazovka (push notifikácie, motív) — to,
 * čo web zatiaľ reálne má. Prepínač jazyka (SK/EN/DE) je od 17.9.2026
 * v hlavičke (nie tu — appka ho ani nemá, appka ide podľa systémového
 * jazyka telefónu).
 */
export default async function NastaveniaPage() {
  const [supabase, language] = await Promise.all([createClient(), getLocale()]);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return redirectLocalized(loginRedirectPath(language, "/nastavenia"));

  // Brána v `proxy.ts` zaručuje, že sem prihlásený bez profilu
  // nedôjde (pošle ho na `/prezyvka`) — `null` tu je len obranná
  // poistka pre prípadný pretek, nie bežný stav.
  const profile = await fetchMyProfile();

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

      {profile ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">Prezývka a kontakt</h2>
          <ProfileEditForm profile={profile} language={language} />
        </section>
      ) : null}

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">Moje dáta</h2>
        <ExportDataButton />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">Offerra</h2>
        <HowItWorksCard locale={language} />
      </section>

      <section className="flex flex-col gap-3 border-t border-border pt-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">Nebezpečná zóna</h2>
        <DeleteAccountButton />
      </section>
    </main>
  );
}
