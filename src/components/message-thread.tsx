import { MessageThreadClient } from "@/components/message-thread-client";
import { getLocale } from "@/i18n/server";
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
  const [messages, language] = await Promise.all([fetchThread(subject, otherId), getLocale()]);
  if (messages.some((m) => m.recipient_id === myId && !m.read_at)) {
    await markRead(subject, otherId).catch(() => undefined);
  }

  return (
    <MessageThreadClient
      subject={subject}
      otherId={otherId}
      myId={myId}
      otherName={otherName}
      initialMessages={messages}
      language={language}
    />
  );
}
