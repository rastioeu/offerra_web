import Link from "next/link";

import { Logo } from "@/components/logo";
import { MobileNav } from "@/components/mobile-nav";
import type { Locale } from "@/i18n";
import { localizeHref } from "@/i18n/href";
import { getLocale } from "@/i18n/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Hlavičkové texty nie sú v `sk.json`/`en.json`/`de.json` (appka
 * takúto navigáciu nemá, je to webová vec) — malá lokálna mapa, rovnaký
 * vzor ako appkové `t()`, len mimo veľkého slovníka.
 */
const LABELS: Record<Locale, { demands: string; myListings: string; myOffers: string; myDemands: string; settings: string; login: string }> = {
  sk: { demands: "Dopyty", myListings: "Moje inzeráty", myOffers: "Moje ponuky", myDemands: "Moje dopyty", settings: "Nastavenia", login: "Prihlásiť sa" },
  en: { demands: "Demands", myListings: "My listings", myOffers: "My offers", myDemands: "My demands", settings: "Settings", login: "Log in" },
  de: { demands: "Gesuche", myListings: "Meine Inserate", myOffers: "Meine Angebote", myDemands: "Meine Gesuche", settings: "Einstellungen", login: "Anmelden" },
};

/**
 * Hlavička so stavom prihlásenia — Server Component, `supabase.auth.getUser()`
 * číta session z cookies (nastavuje ich `proxy.ts` pri každom requeste).
 * Ukazuje e-mail, nie prezývku — výber prezývky pri prvom prihlásení
 * (appka to má) je OTVORENÉ pre web, zatiaľ chýba.
 *
 * Mobilné menu (Rastio, 17.9.2026: „horné menu je namačknuté na mobile"):
 * odkazy v rade sú len `md:flex` (desktop), pod tým je `MobileNav`
 * (hamburger, `md:hidden`) so ROVNAKÝM zoznamom odkazov. Odkazy sú
 * lokalizované (17.9.2026, i18n kolo) — `/dopyty` v SK, `/en/dopyty` v EN.
 */
export async function SiteHeader() {
  const [supabase, locale] = await Promise.all([createClient(), getLocale()]);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const l = LABELS[locale];
  const href = (path: string) => localizeHref(locale, path);

  const loggedInLinks = [
    { href: href("/dopyty"), label: l.demands },
    { href: href("/moje-inzeraty"), label: l.myListings },
    { href: href("/moje-ponuky"), label: l.myOffers },
    { href: href("/moje-dopyty"), label: l.myDemands },
    { href: href("/nastavenia"), label: l.settings },
  ];
  const loggedOutLinks = [{ href: href("/dopyty"), label: l.demands }];

  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href={href("/")} aria-label="Offerra" className="shrink-0">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-5 md:flex">
          <Link href={href("/dopyty")} className="text-sm text-text-secondary hover:text-text-primary">
            {l.demands}
          </Link>
          {user ? (
            <>
              <Link href={href("/moje-inzeraty")} className="text-sm text-text-secondary hover:text-text-primary">
                {l.myListings}
              </Link>
              <Link href={href("/moje-ponuky")} className="text-sm text-text-secondary hover:text-text-primary">
                {l.myOffers}
              </Link>
              <Link href={href("/moje-dopyty")} className="text-sm text-text-secondary hover:text-text-primary">
                {l.myDemands}
              </Link>
              <Link href={href("/nastavenia")} className="text-sm text-text-secondary hover:text-text-primary">
                {l.settings}
              </Link>
            </>
          ) : (
            <Link
              href={href("/login")}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-on-primary hover:opacity-90"
            >
              {l.login}
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          {!user ? (
            <Link
              href={href("/login")}
              className="rounded-xl bg-primary px-3 py-1.5 text-sm font-semibold text-on-primary hover:opacity-90"
            >
              {l.login}
            </Link>
          ) : null}
          <MobileNav links={user ? loggedInLinks : loggedOutLinks} />
        </div>
      </div>
    </header>
  );
}
