import { sendMessageAction } from "@/app/inzerat/[id]/messages-actions";
import { MessageSendForm } from "@/components/message-send-form";
import { fetchThread, markRead } from "@/lib/message-data";
import { t } from "@/i18n";

/**
 * Konverzácia s JEDNÝM človekom pri jednom inzeráte. Server Component —
 * `fetchThread`/`markRead` bežia priamo tu (nie sú „use server" akcie,
 * len čítanie/označenie, appka to robí rovnako pri otvorení vlákna).
 * Posielanie ide cez `sendMessageAction` (skutočná mutácia → Server
 * Action), naviazaná na konkrétne `propertyId`/`otherId`.
 */
export async function MessageThread({
  propertyId,
  otherId,
  myId,
  otherName,
}: {
  propertyId: string;
  otherId: string;
  myId: string;
  otherName: string;
}) {
  const messages = await fetchThread({ propertyId }, otherId);
  if (messages.some((m) => m.recipient_id === myId && !m.read_at)) {
    await markRead({ propertyId }, otherId).catch(() => undefined);
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-text-muted">{t("messages.conversationHint")}</p>

      {messages.length === 0 ? (
        <p className="text-text-muted">{t("messages.nothingYet")}</p>
      ) : (
        <div className="flex flex-col gap-2">
          {messages.map((m) => {
            const mine = m.sender_id === myId;
            const time = new Intl.DateTimeFormat("sk-SK", { hour: "2-digit", minute: "2-digit" }).format(
              new Date(m.created_at)
            );
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    mine ? "bg-primary text-on-primary" : "bg-surface-pressed text-text-primary"
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm">{m.content}</p>
                  <p className={`mt-1 text-xs ${mine ? "text-on-primary/70" : "text-text-muted"}`}>
                    {time}
                    {mine && m.read_at ? t("messages.readSuffix") : ""}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <MessageSendForm onSend={sendMessageAction.bind(null, propertyId, otherId)} />
      <p className="text-xs text-text-muted">Píšeš s {otherName}.</p>
    </div>
  );
}
