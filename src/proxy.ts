/**
 * Obnovenie Supabase session na KAŽDOM requeste (Next.js 16 premenoval
 * „middleware" na „proxy" — funkčne to isté, len iný názov súboru/exportu,
 * pozri node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md).
 *
 * Bez tohto by expirovaný access token v cookies ostal nerefreshnutý až
 * do ďalšej interakcie — Server Components samé cookies prepisovať
 * nemôžu (viď komentár v lib/supabase/server.ts).
 */
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

import { DEFAULT_LOCALE, isLocale } from '@/i18n';

/**
 * Cesty MIMO `[locale]` stromu — root-level metadata routy (appka
 * nemá, appka nemá web routing vôbec). Tie sa NIKDY neprepisujú na
 * `/sk/...`, inak by `sitemap.xml` skončilo na neexistujúcej
 * `/sk/sitemap.xml` route.
 */
const LOCALE_EXEMPT = ['/robots.txt', '/sitemap.xml', '/llms.txt', '/icon.png', '/apple-icon.png', '/favicon.ico'];
/** `/auth/callback` naviac — pevná URL registrovaná v Supabase/Apple, nesmie sa prepísať. */
function isLocaleExempt(pathname: string): boolean {
  return LOCALE_EXEMPT.includes(pathname) || pathname.startsWith('/_next') || pathname.startsWith('/auth/');
}

/**
 * SK je BEZ prefixu (appka: rozhodnutie Rastia 17.9.2026, najlepšie pre
 * SEO/hreflang), EN/DE MAJÚ `/en`/`/de` prefix. Next.js App Router
 * routing (`app/[locale]/...`) potrebuje prefix VŽDY na disku — takže
 * SK požiadavka na `/dopyty` sa tu PREPÍŠE (nie presmeruje, adresný
 * riadok sa nemení) na `/sk/dopyty`. `x-locale` hlavička nesie jazyk
 * ďalej pre `getLocale()`/`getT()` v `src/i18n/index.ts`.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const exempt = isLocaleExempt(pathname);

  let locale: string = DEFAULT_LOCALE;
  let rewriteUrl: URL | null = null;
  if (!exempt) {
    const [, first] = pathname.split('/');
    if (isLocale(first) && first !== DEFAULT_LOCALE) {
      locale = first;
    } else {
      rewriteUrl = request.nextUrl.clone();
      rewriteUrl.pathname = `/${DEFAULT_LOCALE}${pathname}`;
    }
  }

  // Klon hlavičiek s doplneným `x-locale` — POUŽÍVA sa pre KAŽDÚ
  // odpoveď nižšie (aj tú, čo Supabase prestaví v `setAll`), nech sa
  // prepis/jazyk nestratí, keď sa cookies menia.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-locale', locale);
  const buildResponse = () =>
    rewriteUrl
      ? NextResponse.rewrite(rewriteUrl, { request: { headers: requestHeaders } })
      : NextResponse.next({ request: { headers: requestHeaders } });

  let response = buildResponse();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = buildResponse();
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    }
  );

  // Vyvolá refresh tokenu, ak treba — vedľajší efekt (setAll vyššie) v
  // cookies sa použije bez ohľadu na to, čo vráti nižšie.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // BRÁNA prezývky — appka: `_layout.tsx`, „profile === null" pošle na
  // `/prezyvka" skôr, než čokoľvek iné. KRITICKÉ pre web (zistené
  // 17.9.2026): `property`/`property_offer`/`buyer_request`/`message`/...
  // majú cudzí kľúč na `offerra.profile`, a web doteraz NIKDE ten riadok
  // nezakladal — nový človek, čo sa prihlási len cez web, by na prvý
  // pokus o ponuku/inzerát/správu dostal surovú chybu cudzieho kľúča.
  const bare = locale === DEFAULT_LOCALE ? pathname : pathname.slice(locale.length + 1) || '/';
  if (user && !exempt && bare !== '/login' && bare !== '/prezyvka') {
    const { data: profile } = await supabase
      .schema('offerra')
      .from('profile')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();
    if (!profile) {
      const target = request.nextUrl.clone();
      target.pathname = locale === DEFAULT_LOCALE ? '/prezyvka' : `/${locale}/prezyvka`;
      target.search = '';
      const redirectResponse = NextResponse.redirect(target);
      for (const cookie of response.cookies.getAll()) {
        redirectResponse.cookies.set(cookie);
      }
      return redirectResponse;
    }
  }

  return response;
}

export const config = {
  matcher: [
    // Vynechať statické assety a obrázkovú optimalizáciu — inak by
    // proxy bežal aj na nich zbytočne.
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
