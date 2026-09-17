import Link from "next/link";

import { HeaderContact, MobileNavContact } from "@/components/contact-links";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Logo } from "@/components/logo";
import { MobileNav } from "@/components/mobile-nav";
import { NavLink } from "@/components/nav-link";
import { NotificationBell } from "@/components/notification-bell";
import type { Locale } from "@/i18n";
import { localizeHref } from "@/i18n/href";
import { getLocale, getT } from "@/i18n/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Hlavičkové texty nie sú v `sk.json`/`en.json`/`de.json` (appka
 * takúto navigáciu nemá, je to webová vec) — malá lokálna mapa, rovnaký
 * vzor ako appkové `t()`, len mimo veľkého slovníka.
 */
const LABELS: Record<
  Locale,
  {
    demands: string;
    myListings: string;
    myOffers: string;
    myDemands: string;
    favorites: string;
    activity: string;
    settings: string;
    login: string;
    howItWorks: string;
  }
> = {
  sk: { demands: "Dopyty", myListings: "Moje inzeráty", myOffers: "Moje ponuky", myDemands: "Moje dopyty", favorites: "Obľúbené", activity: "Moja aktivita", settings: "Nastavenia", login: "Prihlásiť sa", howItWorks: "Ako funguje" },
  en: { demands: "Demands", myListings: "My listings", myOffers: "My offers", myDemands: "My demands", favorites: "Favorites", activity: "My activity", settings: "Settings", login: "Log in", howItWorks: "How it works" },
  de: { demands: "Gesuche", myListings: "Meine Inserate", myOffers: "Meine Angebote", myDemands: "Meine Gesuche", favorites: "Favoriten", activity: "Meine Aktivität", settings: "Einstellungen", login: "Anmelden", howItWorks: "So funktioniert's" },
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
 *
 * MOTTO POD LOGOM (Rastio, 17.9.2026: veľký nadpis „Nehnuteľnosti" +
 * dlhý popis na katalógovej stránke „nie je to pekné", presunuté vedľa
 * loga ako motto). DRUHÉ KOLO (Rastio, 17.9.2026): „motto daj pod logo
 * tmavším písmom" — bolo VEDĽA loga (`border-l` oddeľovač) svetlou
 * `text-muted` farbou, teraz je POD logom (`flex-col`, žiadny
 * oddeľovač) v `text-secondary` (tmavšia). Stohovanie namiesto radenia
 * vedľa seba zároveň neberie nav-u vodorovné miesto, takže sa dá
 * ukázať už od `md:` (768px), nie až `lg:`.
 *
 * AKTÍVNY ODKAZ TMAVŠÍ (Rastio, 17.9.2026: „keď mám niečo hore
 * stlačené, nech je to tiež tmavšie, žeby som videl") — odkazy predtým
 * mali len `hover:`, žiadny signál PRE AKTUÁLNU stránku. `NavLink`
 * (klientská komponenta, `usePathname`) zvýrazní odkaz na stránku, na
 * ktorej používateľ práve je — `text-primary` + tučné namiesto
 * `text-secondary`.
 *
 * TRETIE KOLO (Rastio, 17.9.2026, „DIZAJN OPRAVA"): lišta má zostať
 * VŠETKY položky viditeľné a klikateľné, ŽIADNY dropdown/skrývanie
 * (cieľová obrazovka je NB/desktop, kde je na to miesto) — namiesto
 * skrývania sa rieši ROZLOŽENIE. Tri skupiny namiesto dvoch
 * (`justify-between` medzi logom a navom): logo vľavo (`shrink-0`),
 * textové odkazy VYCENTROVANÉ v zvyšnom priestore (`flex-1
 * justify-center`), ikonový klaster (zvonček/jazyk/kontakt/prihlásenie)
 * úplne vpravo (`shrink-0`), oddelený od odkazov tenkou zvislou čiarou
 * (`border-l`) — nie jeden neprerušený rad. Typografia zjednotená
 * (`text-sm font-medium`/`font-semibold` pri aktívnom) naprieč
 * odkazmi AJ prepínačom jazyka (`LanguageSwitcher`), ktorý mal predtým
 * inú konvenciu (vždy `font-semibold`, líšila sa len farba).
 */
export async function SiteHeader() {
  const [supabase, locale, t] = await Promise.all([createClient(), getLocale(), getT()]);
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
    { href: href("/oblubene"), label: l.favorites },
    { href: href("/aktivita"), label: l.activity },
    { href: href("/ako-to-funguje"), label: l.howItWorks },
    { href: href("/nastavenia"), label: l.settings },
  ];
  const loggedOutLinks = [
    { href: href("/dopyty"), label: l.demands },
    { href: href("/ako-to-funguje"), label: l.howItWorks },
  ];

  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex shrink-0 flex-col">
          <Link href={href("/")} aria-label="Offerra" className="shrink-0">
            <Logo />
          </Link>
          <span className="hidden text-xs font-medium text-text-secondary md:block">{t("catalog.motto")}</span>
        </div>

        <nav className="hidden flex-1 items-center justify-center gap-7 md:flex">
          <NavLink href={href("/dopyty")}>{l.demands}</NavLink>
          {user ? (
            <>
              <NavLink href={href("/moje-inzeraty")}>{l.myListings}</NavLink>
              <NavLink href={href("/moje-ponuky")}>{l.myOffers}</NavLink>
              <NavLink href={href("/moje-dopyty")}>{l.myDemands}</NavLink>
              <NavLink href={href("/oblubene")}>{l.favorites}</NavLink>
              <NavLink href={href("/nastavenia")}>{l.settings}</NavLink>
              <NavLink href={href("/ako-to-funguje")}>{l.howItWorks}</NavLink>
            </>
          ) : (
            <NavLink href={href("/ako-to-funguje")}>{l.howItWorks}</NavLink>
          )}
        </nav>

        <div className="hidden shrink-0 items-center gap-3 border-l border-border pl-5 md:flex">
          {user ? <NotificationBell locale={locale} /> : null}
          <LanguageSwitcher />
          <HeaderContact t={t} />
          {!user ? (
            <Link
              href={href("/login")}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-on-primary hover:opacity-90"
            >
              {l.login}
            </Link>
          ) : null}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          {user ? <NotificationBell locale={locale} /> : null}
          <LanguageSwitcher />
          {!user ? (
            <Link
              href={href("/login")}
              className="rounded-xl bg-primary px-3 py-1.5 text-sm font-semibold text-on-primary hover:opacity-90"
            >
              {l.login}
            </Link>
          ) : null}
          <MobileNav links={user ? loggedInLinks : loggedOutLinks} language={locale}>
            <MobileNavContact t={t} />
          </MobileNav>
        </div>
      </div>
    </header>
  );
}
