import { MessageThreadClient } from "@/components/message-thread-client";
import { fetchThread, markRead } from "@/lib/message-data";
import type { MessageSubject } from "@/lib/messages";

/**
 * Konverzácia s JEDNÝM človekom pri jednom predmete (inzerát ALEBO
 * dopyt). Server Component pre PRVOTNÉ načítanie a označenie prečítaného
 * (rovnaké ako predtým) — samotné vykreslenie a živé doručovanie nových
 * správ (Realtime) je v `MessageThreadClient`.
 */
export async function MessageThread({
  subject,
  otherId,
  myId,
  otherName,
}: {
  subject: MessageSubject;
  otherId: string;
  myId: string;
  otherName: string;
}) {
  const messages = await fetchThread(subject, otherId);
  if (messages.some((m) => m.recipient_id === myId && !m.read_at)) {
    await markRead(subject, otherId).catch(() => undefined);
  }

  return (
    <MessageThreadClient subject={subject} otherId={otherId} myId={myId} otherName={otherName} initialMessages={messages} />
  );
}
