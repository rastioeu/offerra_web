import Link from "next/link";

import { IconNavLink } from "@/components/icon-nav-link";
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
 * loga ako motto). DRUHÉ KOLO: „motto daj pod logo tmavším písmom" —
 * bolo VEDĽA loga (`border-l` oddeľovač) svetlou `text-muted` farbou,
 * presunuté POD logo (`flex-col`, žiadny oddeľovač) v `text-secondary`
 * (tmavšia). TRETIE KOLO: „ešte trochu zvýrazni to motto" — veľkosť
 * `text-xs` → `text-sm`, váha `font-medium` → `font-semibold`. Farba
 * ostáva `text-secondary`, nie `text-primary` — motto je stále vedľajší
 * text, nesmie súperiť s logom o pozornosť, len je teraz čitateľnejšie.
 *
 * AKTÍVNY ODKAZ TMAVŠÍ (Rastio, 17.9.2026: „keď mám niečo hore
 * stlačené, nech je to tiež tmavšie, žeby som videl", zopakované
 * o kolo neskôr) — odkazy predtým mali len `hover:`, žiadny signál PRE
 * AKTUÁLNU stránku. `NavLink` (klientská komponenta, `usePathname`)
 * zvýrazní odkaz na stránku, na ktorej používateľ práve je —
 * `text-primary` + tučné + jemné pozadie (`bg-surface-pressed`, pridané
 * v druhom kole — samotná farba textu sa v jednom riadku vedľa seba
 * dala ľahko prehliadnuť).
 *
 * TRETIE KOLO (Rastio, 17.9.2026, „DIZAJN OPRAVA"): lišta má zostať
 * VŠETKY položky viditeľné a klikateľné, ŽIADNY dropdown/skrývanie
 * (cieľová obrazovka je NB/desktop, kde je na to miesto) — namiesto
 * skrývania sa rieši ROZLOŽENIE. Tri skupiny namiesto dvoch
 * (`justify-between` medzi logom a navom): logo vľavo (`shrink-0`),
 * textové odkazy VYCENTROVANÉ v zvyšnom priestore (`flex-1
 * justify-center`), ikonový klaster (pôvodne zvonček/jazyk/kontakt/
 * prihlásenie, od piateho kola bez kontaktu — viď nižšie) úplne
 * vpravo (`shrink-0`), oddelený od odkazov tenkou zvislou čiarou
 * (`border-l`) — nie jeden neprerušený rad. Typografia zjednotená
 * (`text-sm font-medium`/`font-semibold` pri aktívnom) naprieč
 * odkazmi AJ prepínačom jazyka (`LanguageSwitcher`), ktorý mal predtým
 * inú konvenciu (vždy `font-semibold`, líšila sa len farba).
 *
 * ŠTVRTÉ KOLO (Rastio, 17.9.2026: „Ako funguje daj pred nastavenia,
 * daj tam iba nejakú ikonu, daj to ku zvončeku" + „aj Obľúbené daj
 * ikonu aj Nastavenia, veď to každý pozná") — Obľúbené/Nastavenia/Ako
 * funguje sú preč z TEXTOVÉHO riadku, sú to teraz IKONY
 * (`IconNavLink`, rovnaký vzhľad ako `NotificationBell`) v ikonovom
 * klastri vpravo, hneď VEDĽA zvončeka — srdiečko/ozubené koliesko/
 * otáznik sú univerzálne rozpoznateľné bez textu. Textový riadok
 * v strede teraz nesie len obsahovú navigáciu (Dopyty/Moje inzeráty/
 * Moje ponuky/Moje dopyty). Toto sa týka LEN desktopovej lišty —
 * mobilný hamburger (`MobileNav`) necháva plné textové odkazy, tam
 * priestor nie je taký stiesnený problém ako v jednom riadku vedľa
 * seba (a cieľová obrazovka tejto úpravy je „primárne NB/desktop").
 *
 * PIATE KOLO (Rastio, 17.9.2026: „tie ikony zmeň, nie sú dobré, a
 * telefón a mail nemusia byť hore na lište") — dve samostatné veci:
 * (1) `HeaderContact`/`MobileNavContact` (telefón + e-mail) sú PREČ,
 * úplne zmazané z `contact-links.tsx`, nič iné ich nepoužívalo —
 * kontakt ostáva len v pätičke, kde je aj tak plný a výrazný.
 * (2) Ozubené koliesko a otáznik boli VLASTNÉ, narýchlo nakreslené
 * SVG cesty — nahradené známymi, overenými ikonami (Heroicons
 * `Cog6Tooth`/`QuestionMarkCircle`, rovnaký `outline` štýl ako
 * zvyšok appky/webu), nie ďalší vlastný pokus bez možnosti si to
 * tu reálne pozrieť. Srdiečko ostáva — je to ten istý overený tvar
 * ako appkové/webové `FavoriteHeart`, nie nový návrh.
 *
 * ŠIESTE KOLO — CTA „+ Pridať inzerát" bolo TU (v lište, vpravo), potom
 * PRESUNUTÉ (Rastio, 17.9.2026: „pridať inzerát by som dal niekde
 * vedľa vyhľadávacieho poľa... aby to nebolo prázdne") — `AddListingCta`
 * (`src/components/add-listing-cta.tsx`) teraz býva na katalógovej
 * stránke vedľa `SearchBox` (`src/app/[locale]/page.tsx`), nie v tejto
 * zdieľanej hlavičke. Komponenta aj `createDraftAction` flow ostávajú
 * rovnaké, len sa zmenilo, KDE sa vykresľujú.
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
          <span className="hidden text-sm font-semibold text-text-secondary md:block">{t("catalog.motto")}</span>
        </div>

        <nav className="hidden flex-1 items-center justify-center gap-7 md:flex">
          <NavLink href={href("/dopyty")}>{l.demands}</NavLink>
          {user ? (
            <>
              <NavLink href={href("/moje-inzeraty")}>{l.myListings}</NavLink>
              <NavLink href={href("/moje-ponuky")}>{l.myOffers}</NavLink>
              <NavLink href={href("/moje-dopyty")}>{l.myDemands}</NavLink>
            </>
          ) : null}
        </nav>

        <div className="hidden shrink-0 items-center gap-1.5 border-l border-border pl-4 md:flex">
          {user ? (
            <IconNavLink href={href("/oblubene")} label={l.favorites}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                <path d="M12 20.5s-7.5-4.6-10-9.2C.5 8 2 4.5 5.5 3.8 8 3.3 10.3 4.6 12 7c1.7-2.4 4-3.7 6.5-3.2C22 4.5 23.5 8 22 11.3c-2.5 4.6-10 9.2-10 9.2z" />
              </svg>
            </IconNavLink>
          ) : null}
          {user ? (
            <IconNavLink href={href("/nastavenia")} label={l.settings}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
                />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            </IconNavLink>
          ) : null}
          <IconNavLink href={href("/ako-to-funguje")} label={l.howItWorks}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"
              />
            </svg>
          </IconNavLink>
          {user ? <NotificationBell locale={locale} /> : null}
          <LanguageSwitcher />
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
          <MobileNav links={user ? loggedInLinks : loggedOutLinks} language={locale} />
        </div>
      </div>
    </header>
  );
}
