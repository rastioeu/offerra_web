import type { Metadata } from "next";

import { OznameniaList } from "@/components/oznamenia-list";
import { createClient } from "@/lib/supabase/server";
import { getLocale, getT, redirectLocalized } from "@/i18n/server";
import { loginRedirectPath } from "@/i18n/href";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("oznamenia.title") };
}

/**
 * Zvonček — port appkovej `oznamenia.tsx`. Dáta a živé obnovenie sú v
 * `<NotificationsProvider>` (`app/[locale]/layout.tsx`), táto stránka
 * len overí prihlásenie a odovzdá jazyk klientskému zoznamu.
 */
export default async function OznameniaPage() {
  const [supabase, t, language] = await Promise.all([createClient(), getT(), getLocale()]);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return redirectLocalized(loginRedirectPath(language, "/oznamenia"));

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-text-primary">{t("oznamenia.title")}</h1>
      <OznameniaList language={language} />
    </main>
  );
}
