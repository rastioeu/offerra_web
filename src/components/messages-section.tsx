import Link from "next/link";

import { MessageThread } from "@/components/message-thread";
import type { PropertyDetail } from "@/lib/detail";
import { fetchNicknames, fetchThreads } from "@/lib/message-data";
import { t } from "@/i18n";

/**
 * Správy k inzerátu — appka: `messages.ts` + obrazovka vlákien. Vlastník
 * má vlákno s KAŽDÝM záujemcom zvlášť (nevidí ich naraz v jednom chate,
 * záujemcovia o sebe navzájom nevedia), preto pre neho zoznam vlákien
 * namiesto priamej konverzácie.
 */
export async function MessagesSection({ property, userId }: { property: PropertyDetail; userId: string | null }) {
  if (!userId) {
    return (
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-text-primary">{t("messages.messagesTitle")}</h2>
        <p className="text-sm text-text-muted">{t("messages.loginRequired")}</p>
      </section>
    );
  }

  const isOwner = userId === property.owner_id;

  if (!isOwner) {
    return (
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-text-primary">{t("messages.messagesTitle")}</h2>
        <MessageThread
          subject={{ propertyId: property.id }}
          otherId={property.owner_id}
          myId={userId}
          otherName={property.owner?.nickname ?? t("messages.withSellerName")}
        />
      </section>
    );
  }

  const threads = await fetchThreads({ propertyId: property.id }, userId);
  const nicknames = await fetchNicknames(threads.map((th) => th.otherId));

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold text-text-primary">{t("messages.messagesTitle")}</h2>
      {threads.length === 0 ? (
        <p className="text-sm text-text-muted">{t("messages.noOneWroteYet")}</p>
      ) : (
        <div className="flex flex-col gap-2">
          {threads.map((th) => {
            const name = nicknames[th.otherId] ?? t("messages.bidderFallback");
            const preview = th.last.sender_id === userId ? `${t("messages.youPrefix")}${th.last.content}` : th.last.content;
            return (
              <Link
                key={th.otherId}
                href={`/inzerat/${property.id}/spravy/${th.otherId}`}
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
