import type { Metadata } from "next";

import { PrezyvkaForm } from "@/components/prezyvka-form";
import { myProfileExists } from "@/lib/profile";
import { suggestedFullName } from "@/lib/signin-name";
import { createClient } from "@/lib/supabase/server";
import { getLocale, getT, redirectLocalized } from "@/i18n/server";
import { loginRedirectPath } from "@/i18n/href";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("nickname.title") };
}

/**
 * Prezývka — port appkovej `prezyvka.tsx`. Kto sem príde s profilom
 * (napr. sa vrátil po tom, čo ho už založil v inom okne), pošle sa
 * ďalej — táto stránka nemá čo robiť ešte raz.
 */
export default async function PrezyvkaPage() {
  const [supabase, t, language] = await Promise.all([createClient(), getT(), getLocale()]);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return redirectLocalized(loginRedirectPath(language, "/prezyvka"));

  if (await myProfileExists(user.id)) return redirectLocalized("/");

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-text-primary">{t("nickname.title")}</h1>
      <p className="text-text-secondary">{t("nickname.lead")}</p>
      <PrezyvkaForm language={language} suggestedName={suggestedFullName(user)} />
    </main>
  );
}
