import Link from "next/link";

import { MessageThread } from "@/components/message-thread";
import type { BuyerRequest } from "@/lib/offers";
import { fetchNicknames, fetchThreads } from "@/lib/message-data";
import { getT } from "@/i18n/server";

/**
 * Správy pri dopyte — appka: `DemandMessages`, rovnaká mechanika ako pri
 * inzeráte (`MessagesSection`), len druhá strana je zadávateľ dopytu.
 * Dostupné VŽDY, aj pred formálnym oslovením — appka: „pýtať sa má byť
 * možné skôr, než niekto ponúkne svoj inzerát".
 */
export async function DemandMessages({ demand, userId }: { demand: BuyerRequest; userId: string | null }) {
  const t = await getT();
  if (!userId) {
    return (
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-text-primary">{t("messages.messagesTitle")}</h2>
        <p className="text-sm text-text-muted">{t("messages.loginRequired")}</p>
      </section>
    );
  }

  const isMine = userId === demand.user_id;

  if (!isMine) {
    return (
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-text-primary">{t("messages.messagesTitle")}</h2>
        <MessageThread
          subject={{ requestId: demand.id }}
          otherId={demand.user_id}
          myId={userId}
          otherName={t("demandMessages.withRequesterName")}
        />
      </section>
    );
  }

  const threads = await fetchThreads({ requestId: demand.id }, userId);
  const nicknames = await fetchNicknames(threads.map((th) => th.otherId));

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold text-text-primary">{t("messages.messagesTitle")}</h2>
      {threads.length === 0 ? (
        <p className="text-sm text-text-muted">{t("messages.noOneWroteYet")}</p>
      ) : (
        <div className="flex flex-col gap-2">
          {threads.map((th) => {
            const name = nicknames[th.otherId] ?? t("demandMessages.silentOutreachFallback");
            const preview = th.last.sender_id === userId ? `${t("messages.youPrefix")}${th.last.content}` : th.last.content;
            return (
              <Link
                key={th.otherId}
                href={`/dopyt/${demand.id}/spravy/${th.otherId}`}
                className="flex items-center justify-between gap-4 rounded-xl border border-border bg-surface p-3 hover:border-border-strong"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold text-text-primary">{name}</span>
                  <span className="line-clamp-1 text-sm text-text-muted">{preview}</span>
                </div>
                {th.unread > 0 ? (
                  <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-on-primary">
                    {th.unread}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
