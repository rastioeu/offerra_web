import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

/**
 * PKCE OAuth callback — Supabase presmeruje sem s `?code=...` po tom, čo
 * si používateľ odsúhlasí prihlásenie cez Google. Vymení kód za session
 * (cookies zapíše `server.ts` klient) a presmeruje ďalej.
 *
 * Route Handler, nie Server Component — presne preto, lebo cookies sa
 * dajú zapisovať len tu alebo v Server Action (viď komentár v
 * `lib/supabase/server.ts`).
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
