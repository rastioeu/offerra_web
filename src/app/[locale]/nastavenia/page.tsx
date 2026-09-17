import type { Metadata } from "next";
import Link from "next/link";

import { signOut } from "@/app/auth/actions";
import { DeleteAccountButton } from "@/components/delete-account-button";
import { ExportDataButton } from "@/components/export-data-button";
import { ProfileEditForm } from "@/components/profile-edit-form";
import { fetchMyProfile } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";
import { getLocale, getT, redirectLocalized } from "@/i18n/server";
import { loginRedirectPath, localizeHref } from "@/i18n/href";
import type { Locale } from "@/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("nastavenia.title") };
}

/**
 * Nadpisy, čo appka nemá (profil/rýchle odkazy/nebezpečná zóna sekcie
 * sú webové) — malá lokálna mapa mimo veľkého slovníka, rovnaký vzor
 * ako `site-header.tsx` `LABELS`.
 */
const LABELS: Record<Locale, { profileSection: string; linksSection: string; dangerZone: string }> = {
  sk: { profileSection: "Prezývka a kontakt", linksSection: "Rýchle odkazy", dangerZone: "Nebezpečná zóna" },
  en: { profileSection: "Nickname and contact", linksSection: "Quick links", dangerZone: "Danger zone" },
  de: { profileSection: "Spitzname und Kontakt", linksSection: "Schnellzugriff", dangerZone: "Gefahrenzone" },
};

/** Spoločný appkový vzhľad karty (appka: rovnaký `shadow-card` ako property-card/offer-form) — predtým mali sekcie len nadpis, žiadny vizuálny rámec. */
function cardCls() {
  return "flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-card)]";
}

/**
 * Zámerne UŽŠIE než appková obrazovka (push notifikácie, motív) — to,
 * čo web zatiaľ reálne má. Prepínač jazyka (SK/EN/DE) je od 17.9.2026
 * v hlavičke (nie tu — appka ho ani nemá, appka ide podľa systémového
 * jazyka telefónu). „Ako funguje Offerra" tu ZÁMERNE nie je (Rastio,
 * 17.9.2026: „tam nemusí byť") — ostáva len na hlavnej stránke a
 * v hlavičke.
 */
export default async function NastaveniaPage() {
  const [supabase, language, t] = await Promise.all([createClient(), getLocale(), getT()]);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return redirectLocalized(loginRedirectPath(language, "/nastavenia"));

  // Brána v `proxy.ts` zaručuje, že sem prihlásený bez profilu
  // nedôjde (pošle ho na `/prezyvka`) — `null` tu je len obranná
  // poistka pre prípadný pretek, nie bežný stav.
  const profile = await fetchMyProfile();
  const l = LABELS[language];

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-5 px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-text-primary">{t("nastavenia.title")}</h1>

      <section className={cardCls()}>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">{t("nastavenia.accountSection")}</h2>
        <p className="text-text-secondary">{user.email}</p>
        <form action={signOut}>
          <button
            type="submit"
            className="w-fit rounded-xl border border-border-strong px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface-pressed"
          >
            {t("nastavenia.signOut")}
          </button>
        </form>
      </section>

      {profile ? (
        <section className={cardCls()}>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">{l.profileSection}</h2>
          <ProfileEditForm profile={profile} language={language} />
        </section>
      ) : null}

      <section className={cardCls()}>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">{t("nastavenia.dataSection")}</h2>
        <ExportDataButton />
      </section>

      <section className={cardCls()}>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">{l.linksSection}</h2>
        <div className="flex flex-col items-start gap-2">
          <Link href={localizeHref(language, "/aktivita")} className="text-sm text-link hover:underline">
            {t("activityTimeline.pageTitle")}
          </Link>
          <Link href={localizeHref(language, "/novinky")} className="text-sm text-link hover:underline">
            {t("nastavenia.whatsNew")}
          </Link>
        </div>
      </section>

      <section className={`${cardCls()} border-danger/40`}>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-danger">{l.dangerZone}</h2>
        <DeleteAccountButton />
      </section>
    </main>
  );
}
