"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/button";
import { contactBlockedText, contactInText, MESSAGE_MAX } from "@/lib/messages";
import type { TFunc } from "@/i18n";

/**
 * Kontrola kontaktu tu je LEN pohodlie (rovnaká kópia ako appka,
 * `contactInText`) — skutočnú kontrolu robí `send_message()` v databáze,
 * túto sa dá obísť. Zobrazí sa okamžite, bez čakania na server.
 */
export function MessageSendForm({
  onSend,
  t,
}: {
  onSend: (content: string) => Promise<void>;
  t: TFunc;
}) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const blocked = contactInText(value);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const content = value.trim();
    if (!content) return;
    if (blocked) {
      setError(contactBlockedText(t, blocked));
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await onSend(content);
        setValue("");
      } catch (err) {
        setError(err instanceof Error ? err.message : t("common.sendFailed"));
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        maxLength={MESSAGE_MAX}
        rows={2}
        placeholder={t("messages.inputPlaceholder")}
        className="w-full rounded-xl border border-border-strong bg-surface px-4 py-2.5 text-text-primary focus:border-accent-deep focus:outline-none"
      />
      {blocked ? <p className="text-xs text-danger">{contactBlockedText(t, blocked)}</p> : null}
      {error && !blocked ? <p className="text-xs text-danger">{error}</p> : null}
      <Button type="submit" disabled={pending || !value.trim() || !!blocked} className="w-fit px-5 py-2 text-sm">
        {pending ? "Odosielam…" : t("messages.sendButton")}
      </Button>
    </form>
  );
}
