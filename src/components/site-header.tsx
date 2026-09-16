import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

/**
 * Hlavička so stavom prihlásenia — Server Component, `supabase.auth.getUser()`
 * číta session z cookies (nastavuje ich `proxy.ts` pri každom requeste).
 * Ukazuje e-mail, nie prezývku — výber prezývky pri prvom prihlásení
 * (appka to má) je OTVORENÉ pre web, zatiaľ chýba.
 */
export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-lg font-bold text-primary">
            Offerra
          </Link>
          <Link href="/dopyty" className="text-sm text-text-secondary hover:text-text-primary">
            Dopyty
          </Link>
        </div>

        {user ? (
          <div className="flex items-center gap-3">
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
          </div>
        ) : (
          <Link
            href="/login"
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-on-primary hover:opacity-90"
          >
            Prihlásiť sa
          </Link>
        )}
      </div>
    </header>
  );
}
