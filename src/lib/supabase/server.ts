/**
 * Supabase klient pre SERVER (Server Components, Server Actions, Route
 * Handlers) — číta/zapisuje session cez cookies. `cookies()` je v tejto
 * verzii Next.js asynchrónna funkcia (viď proxy.ts), preto je aj tento
 * klient async.
 *
 * Len anon kľúč, nie service role — rovnaké pravidlo ako appka
 * (CLAUDE.md §4). Autorizácia ide cez RLS v `offerra` schéme, nie cez
 * obchádzanie RLS service role kľúčom.
 */
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Volané zo Server Component (nie Server Action/Route Handler) —
            // zápis cookies tam zlyhá vždy, session refresh v tom prípade
            // rieši proxy.ts. Bezpečné ignorovať.
          }
        },
      },
    }
  );
}
