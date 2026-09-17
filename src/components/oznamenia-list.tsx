"use client";

/**
 * Zoznam oznámení — port appkovej `oznamenia.tsx`. Kam vedie klik,
 * rozhoduje `notificationRoute()` (appka: rovnaký dôvod — jedno miesto
 * rozhoduje, appka aj web na to majú vlastnú kópiu, appky sa nedotýka).
 * Otvorením sa oznámenia označia za prečítané, presne ako appka.
 */
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useNotifications } from "@/hooks/use-notifications";
import { createT, type Locale } from "@/i18n";
import { localizeHref } from "@/i18n/href";
import { notificationRoute } from "@/lib/notification-route";
import { formatDate } from "@/lib/property";

export function OznameniaList({ language }: { language: Locale }) {
  const t = createT(language);
  const router = useRouter();
  const { items, unread, error, markAllRead } = useNotifications();

  useEffect(() => {
    if (unread > 0) void markAllRead();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col gap-3">
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <p className="text-sm text-text-muted">{t("oznamenia.lead")}</p>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-1 rounded-2xl border border-border bg-surface p-8 text-center">
          <p className="font-semibold text-text-primary">{t("oznamenia.emptyTitle")}</p>
          <p className="text-sm text-text-muted">{t("oznamenia.emptyBody")}</p>
        </div>
      ) : null}

      {items.map((n) => {
        const path = notificationRoute(n.type, {
          propertyId: n.property_id,
          offerId: n.offer_id,
          requestId: n.request_id,
        });
        const clickable = Boolean(path);
        return (
          <button
            key={n.id}
            type="button"
            disabled={!clickable}
            onClick={() => {
              if (path) router.push(localizeHref(language, path));
            }}
            className={`flex flex-col gap-1 rounded-2xl border p-4 text-left ${
              n.read_at ? "border-border bg-surface" : "border-accent-deep bg-accent-soft/30"
            } ${clickable ? "cursor-pointer hover:border-border-strong" : "cursor-default"}`}
          >
            <div className="flex items-center gap-2">
              <span className="font-semibold text-text-primary">{n.title}</span>
              {!n.read_at ? <span className="h-2 w-2 shrink-0 rounded-full bg-accent-deep" /> : null}
            </div>
            {n.body ? <p className="text-sm text-text-secondary">{n.body}</p> : null}
            <span className="text-xs text-text-muted">{formatDate(language, n.created_at)}</span>
          </button>
        );
      })}
    </div>
  );
}
