import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { NewDemandForm } from "@/components/new-demand-form";
import { createClient } from "@/lib/supabase/server";
import { t } from "@/i18n";

export const metadata: Metadata = {
  title: "Nový dopyt",
};

export default async function NewDemandPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dopyty/novy");

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-text-primary">{t("dopytNovy.screenTitle")}</h1>
      <NewDemandForm />
    </main>
  );
}
