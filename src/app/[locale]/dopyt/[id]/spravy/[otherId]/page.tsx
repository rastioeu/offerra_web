import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { MessageThread } from "@/components/message-thread";
import { fetchDemand } from "@/lib/demand-data";
import { fetchNicknames } from "@/lib/message-data";
import { createClient } from "@/lib/supabase/server";
import { getT } from "@/i18n/server";

export const metadata: Metadata = {
  title: "Správy",
};

/** Konverzácia ZADÁVATEĽA dopytu s jedným konkrétnym človekom — rovnaké vlákno ako pri inzeráte, len z druhej strany. */
export default async function DemandThreadPage({
  params,
}: {
  params: Promise<{ id: string; otherId: string }>;
}) {
  const { id, otherId } = await params;
  const t = await getT();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/dopyt/${id}/spravy/${otherId}`);

  const demand = await fetchDemand(id);
  if (!demand) notFound();
  if (demand.user_id !== user.id) redirect(`/dopyt/${id}`);

  const nicknames = await fetchNicknames([otherId]);
  const otherName = nicknames[otherId] ?? t("demandMessages.silentOutreachFallback");

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <Link href={`/dopyt/${id}`} className="text-sm text-link hover:underline">
        {t("messages.backToList")}
      </Link>
      <h1 className="text-xl font-bold text-text-primary">{t("messages.conversationWith", { name: otherName })}</h1>
      <MessageThread subject={{ requestId: id }} otherId={otherId} myId={user.id} otherName={otherName} />
    </main>
  );
}
