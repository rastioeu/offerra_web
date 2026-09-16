/**
 * Supabase klient pre PREHLIADAČ (Client Components). Len anon kľúč —
 * nikdy service role, ten sem podľa CLAUDE.md pravidiel appky nesmie.
 */
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
