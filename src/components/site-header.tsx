import Link from "next/link";

import { Logo } from "@/components/logo";
import { MobileNav } from "@/components/mobile-nav";
import { createClient } from "@/lib/supabase/server";

/**
 * Hlavička so stavom prihlásenia — Server Component, `supabase.auth.getUser()`
 * číta session z cookies (nastavuje ich `proxy.ts` pri každom requeste).
 * Ukazuje e-mail, nie prezývku — výber prezývky pri prvom prihlásení
 * (appka to má) je OTVORENÉ pre web, zatiaľ chýba.
 *
 * Mobilné menu (Rastio, 17.9.2026: „horné menu je namačknuté na mobile"):
 * odkazy v rade sú len `md:flex` (desktop), pod tým je `MobileNav`
 * (hamburger, `md:hidden`) so ROVNAKÝM zoznamom odkazov.
 */
export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const loggedInLinks = [
    { href: "/dopyty", label: "Dopyty" },
    { href: "/moje-inzeraty", label: "Moje inzeráty" },
    { href: "/moje-ponuky", label: "Moje ponuky" },
    { href: "/moje-dopyty", label: "Moje dopyty" },
    { href: "/nastavenia", label: "Nastavenia" },
  ];
  const loggedOutLinks = [{ href: "/dopyty", label: "Dopyty" }];

  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" aria-label="Offerra" className="shrink-0">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-5 md:flex">
          <Link href="/dopyty" className="text-sm text-text-secondary hover:text-text-primary">
            Dopyty
          </Link>
          {user ? (
            <>
              <Link href="/moje-inzeraty" className="text-sm text-text-secondary hover:text-text-primary">
                Moje inzeráty
              </Link>
              <Link href="/moje-ponuky" className="text-sm text-text-secondary hover:text-text-primary">
                Moje ponuky
              </Link>
              <Link href="/moje-dopyty" className="text-sm text-text-secondary hover:text-text-primary">
                Moje dopyty
              </Link>
              <Link href="/nastavenia" className="text-sm text-text-secondary hover:text-text-primary">
                Nastavenia
              </Link>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-on-primary hover:opacity-90"
            >
              Prihlásiť sa
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          {!user ? (
            <Link
              href="/login"
              className="rounded-xl bg-primary px-3 py-1.5 text-sm font-semibold text-on-primary hover:opacity-90"
            >
              Prihlásiť sa
            </Link>
          ) : null}
          <MobileNav links={user ? loggedInLinks : loggedOutLinks} />
        </div>
      </div>
    </header>
  );
}
