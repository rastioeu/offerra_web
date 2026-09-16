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
 *
 * PREČO `x-forwarded-host`, NIE `request.url` (zistené naživo 2.9.2026,
 * po Rastiovom nahlásení „hádže ma na localhost:3001"): za reverse
 * proxy (Cloudflare Tunnel, neskôr aj `app.offerra.sk`) `request.url`
 * odráža to, čo vidí PÔVODCOVSKÝ server — teda `http://localhost:3001`,
 * lebo presne na tú adresu `cloudflared` pripája — nie verejnú adresu,
 * ktorú má prehliadač v adresnom riadku. Overené priamo (`curl` cez
 * tunel na túto route vrátil `Location: https://localhost:3001/...`).
 * `x-forwarded-host`/`x-forwarded-proto` nesie SKUTOČNÚ verejnú adresu —
 * rovnaký vzor odporúča aj Supabase vo vlastných príkladoch presne pre
 * tento scenár (proxy/load balancer pred appkou).
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/";

  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";
  const origin = forwardedHost ? `${forwardedProto}://${forwardedHost}` : url.origin;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
