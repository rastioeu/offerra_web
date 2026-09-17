"use client";

import { useState } from "react";

import { sendMessageAction } from "@/app/actions/messages";
import { Avatar } from "@/components/avatar";
import { MessageSendForm } from "@/components/message-send-form";
import { useRealtimeChannel } from "@/hooks/use-realtime-channel";
import { subjectIds, type Message, type MessageSubject } from "@/lib/messages";
import { localeTag } from "@/lib/property";
import { createT, type Locale } from "@/i18n";

/**
 * Živé vlákno — appka message thread realtime NEMÁ (žiadny appkový vzor
 * na skopírovanie), toto je NOVÁ vec pre web, postavená na appkovej
 * generickej Realtime infraštruktúre (`use-realtime-channel.ts`,
 * dokázanej na notifikáciách). Nový riadok príde cez `INSERT` na
 * `message`, filtrovaný na predmet (appka by filtrovala rovnako, keby
 * to mala) — vlastné dvojité doručenie (INSERT po `sendMessageAction`)
 * odfiltruje kontrola `id` už v zozname.
 */
export function MessageThreadClient({
  subject,
  otherId,
  myId,
  otherName,
  initialMessages,
  language,
}: {
  subject: MessageSubject;
  otherId: string;
  myId: string;
  otherName: string;
  initialMessages: Message[];
  language: Locale;
}) {
  const t = createT(language);
  const [messages, setMessages] = useState(initialMessages);
  const { propertyId, requestId } = subjectIds(subject);
  const topic = propertyId ? `messages-property-${propertyId}` : `messages-request-${requestId}`;
  const filter = propertyId ? `property_id=eq.${propertyId}` : `request_id=eq.${requestId}`;

  useRealtimeChannel({
    topic,
    bindings: [{ event: "INSERT", schema: "offerra", table: "message", filter }],
    label: "[SPRÁVY]",
    onChange: (payload) => {
      const row = payload.new as Message | undefined;
      if (!row) return;
      const belongsHere =
        (row.sender_id === otherId && row.recipient_id === myId) ||
        (row.sender_id === myId && row.recipient_id === otherId);
      if (!belongsHere) return;
      setMessages((prev) => (prev.some((m) => m.id === row.id) ? prev : [...prev, row]));
    },
  });

  async function handleSend(content: string) {
    await sendMessageAction(subject, otherId, content);
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
            const time = new Intl.DateTimeFormat(localeTag(language), { hour: "2-digit", minute: "2-digit" }).format(
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

      <MessageSendForm onSend={handleSend} t={t} />
      <p className="flex items-center gap-2 text-xs text-text-muted">
        <Avatar name={otherName} size={20} />
        {t("messages.chattingWith", { name: otherName })}
      </p>
    </div>
  );
}
