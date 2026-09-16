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

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

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
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    }
  );

  // Vyvolá refresh tokenu, ak treba — výsledok nepoužívame priamo,
  // dôležitý je vedľajší efekt (setAll vyššie) v cookies.
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    // Vynechať statické assety a obrázkovú optimalizáciu — inak by
    // proxy bežal aj na nich zbytočne.
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
