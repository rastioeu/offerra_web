import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { MessageThread } from "@/components/message-thread";
import { fetchProperty } from "@/lib/detail";
import { fetchNicknames } from "@/lib/message-data";
import { createClient } from "@/lib/supabase/server";
import { t } from "@/i18n";

export const metadata: Metadata = {
  title: "Správy",
};

/**
 * Konverzácia MAJITEĽA s jedným konkrétnym záujemcom — appka: rovnaké
 * vlákno, len z druhej strany. `otherId` musí byť jeden z tých, čo
 * majiteľovi naozaj písali — inak je to prázdne vlákno (RLS to aj tak
 * ochráni, toto je len rozumný UX).
 */
export default async function OwnerThreadPage({
  params,
}: {
  params: Promise<{ id: string; otherId: string }>;
}) {
  const { id, otherId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/inzerat/${id}/spravy/${otherId}`);

  const property = await fetchProperty(id);
  if (!property) notFound();
  if (property.owner_id !== user.id) redirect(`/inzerat/${id}`);

  const nicknames = await fetchNicknames([otherId]);
  const otherName = nicknames[otherId] ?? t("messages.bidderFallback");

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <Link href={`/inzerat/${id}`} className="text-sm text-link hover:underline">
        {t("messages.backToList")}
      </Link>
      <h1 className="text-xl font-bold text-text-primary">
        {t("messages.conversationWith", { name: otherName })}
      </h1>
      <MessageThread propertyId={id} otherId={otherId} myId={user.id} otherName={otherName} />
    </main>
  );
}
