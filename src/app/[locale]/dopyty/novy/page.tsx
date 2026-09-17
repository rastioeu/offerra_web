import type { Metadata } from "next";

import { NewDemandForm } from "@/components/new-demand-form";
import { createClient } from "@/lib/supabase/server";
import { getLocale, getT, redirectLocalized } from "@/i18n/server";
import { loginRedirectPath } from "@/i18n/href";

export const metadata: Metadata = {
  title: "Nový dopyt",
};

export default async function NewDemandPage() {
  const [t, language] = await Promise.all([getT(), getLocale()]);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return redirectLocalized(loginRedirectPath(language, "/dopyty/novy"));

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-text-primary">{t("dopytNovy.screenTitle")}</h1>
      <NewDemandForm language={language} />
    </main>
  );
}
