import type { Metadata } from "next";

import { ActivityTimeline } from "@/components/activity-timeline";
import { fetchActivityEvents } from "@/lib/activity";
import { createClient } from "@/lib/supabase/server";
import { getLocale, getT, redirectLocalized } from "@/i18n/server";
import { loginRedirectPath } from "@/i18n/href";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("activityTimeline.pageTitle") };
}

/**
 * Moja aktivita — appka to má ako súčasť Profilu (inzeráty, ponuky,
 * dopyty, oslovenia zlúčené do jednej časovej osi). Web má tieto veci
 * rozdelené do samostatných stránok (Moje inzeráty/ponuky/dopyty) —
 * táto stránka je appkový príbeh naprieč nimi, nie náhrada za ne.
 */
export default async function AktivitaPage() {
  const [supabase, t, language] = await Promise.all([createClient(), getT(), getLocale()]);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return redirectLocalized(loginRedirectPath(language, "/aktivita"));

  const events = await fetchActivityEvents(t, user.id);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-text-primary">{t("activityTimeline.pageTitle")}</h1>
      <ActivityTimeline events={events} t={t} language={language} />
    </main>
  );
}
