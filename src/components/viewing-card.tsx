"use client";

import { useTransition } from "react";

import { confirmViewingAction, requestViewingAction, setViewingStatusAction } from "@/app/[locale]/inzerat/[id]/viewing-actions";
import { Button } from "@/components/button";
import { getViewingConsent, getViewingStatusLabel, REVEALED, type Viewing, type ViewingContact } from "@/lib/viewing";
import { createT, type Locale } from "@/i18n";

/**
 * Prenesené z appky (`viewing-card.tsx`) — rovnaká mechanika, len bez
 * natívneho `Alert.alert` (nahradené `window.confirm`, funkčne to isté:
 * potvrdenie PRED žiadosťou/potvrdením/zrušením s viditeľným textom
 * súhlasu).
 */
export function ViewingCard({
  propertyId,
  viewings,
  contacts,
  myId,
  isOwner,
  closed,
  language,
}: {
  propertyId: string;
  viewings: Viewing[];
  contacts: Record<string, ViewingContact>;
  myId: string;
  isOwner: boolean;
  closed: boolean;
  language: Locale;
}) {
  const t = createT(language);
  const [pending, startTransition] = useTransition();
  const statusLabel = getViewingStatusLabel(t);
  const consent = getViewingConsent(t);

  const mine = !isOwner ? viewings.find((v) => v.requester_id === myId) : undefined;
  const visible = isOwner ? viewings : mine ? [mine] : [];

  function ask() {
    if (!window.confirm(`${mine ? t("viewing.askAgainConfirmTitle") : t("viewing.askConfirmTitle")}\n\n${consent}`)) {
      return;
    }
    startTransition(() => {
      void requestViewingAction(propertyId, mine?.status === "CANCELLED" ? mine.id : null);
    });
  }

  function confirm(v: Viewing) {
    if (!window.confirm(`${t("viewing.confirmConfirmTitle")}\n\n${consent}`)) return;
    startTransition(() => {
      void confirmViewingAction(propertyId, v.id);
    });
  }

  function mark(v: Viewing, status: "COMPLETED" | "CANCELLED") {
    if (status === "CANCELLED" && !window.confirm(`${t("viewing.cancelConfirmTitle")}\n\n${t("viewing.cancelConfirmBody")}`)) {
      return;
    }
    startTransition(() => {
      void setViewingStatusAction(propertyId, v.id, status);
    });
  }

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-text-primary">{t("viewing.eyebrow")}</h2>

      {!isOwner && (!mine || mine.status === "CANCELLED") ? (
        <div className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-4">
          <p className="text-sm text-text-secondary">{consent}</p>
          {mine?.status === "CANCELLED" ? (
            <p className="text-sm text-text-muted">{t("viewing.previousCancelledHint")}</p>
          ) : null}
          {closed ? (
            <p className="text-sm text-text-muted">{t("viewing.closedHint")}</p>
          ) : (
            <Button type="button" onClick={ask} disabled={pending} className="w-fit px-5 py-2.5">
              {pending ? t("viewing.sending") : mine ? t("viewing.askAgain") : t("viewing.ask")}
            </Button>
          )}
        </div>
      ) : null}

      {isOwner && visible.length === 0 ? <p className="text-text-muted">{t("viewing.noRequestsYet")}</p> : null}

      {visible.map((v) => {
        const c = contacts[v.id];
        const revealed = REVEALED.includes(v.status);
        return (
          <div key={v.id} className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-4">
            <span className="font-semibold text-text-primary">{statusLabel[v.status]}</span>

            {v.status === "CANCELLED" ? (
              <p className="text-sm text-text-muted">{t("viewing.cancelledShort")}</p>
            ) : v.status === "REQUESTED" ? (
              isOwner ? (
                <>
                  <p className="text-sm text-text-secondary">{t("viewing.ownerPendingHint")}</p>
                  <div className="flex gap-2">
                    <Button type="button" onClick={() => confirm(v)} disabled={pending} className="px-4 py-2 text-sm">
                      {t("viewing.confirmButton")}
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => mark(v, "CANCELLED")} disabled={pending} className="px-4 py-2 text-sm">
                      {t("viewing.declineButton")}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm text-text-secondary">{t("viewing.requesterPendingHint")}</p>
                  <Button type="button" variant="secondary" onClick={() => mark(v, "CANCELLED")} disabled={pending} className="w-fit px-4 py-2 text-sm">
                    {t("viewing.withdrawButton")}
                  </Button>
                </>
              )
            ) : revealed && c ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Param label={t("viewing.paramNickname")} value={c.nickname ?? "—"} />
                <Param label={t("viewing.paramName")} value={c.full_name ?? t("viewing.paramNameEmpty")} />
                <Param label={t("viewing.paramPhone")} value={c.phone ?? t("viewing.paramPhoneEmpty")} />
                <Param label={t("viewing.paramEmail")} value={c.email ?? t("viewing.paramEmailEmpty")} />
              </div>
            ) : revealed ? (
              <p className="text-sm text-text-muted">{t("viewing.loadingContact")}</p>
            ) : null}

            {revealed ? (
              <div className="flex gap-2 pt-1">
                <Button type="button" variant="secondary" onClick={() => mark(v, "COMPLETED")} disabled={pending} className="px-4 py-2 text-sm">
                  {t("viewing.attendedButton")}
                </Button>
                <Button type="button" variant="danger" onClick={() => mark(v, "CANCELLED")} disabled={pending} className="px-4 py-2 text-sm">
                  {t("common.cancel")}
                </Button>
              </div>
            ) : null}
          </div>
        );
      })}
    </section>
  );
}

function Param({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs uppercase tracking-wide text-text-muted">{label}</span>
      <span className="text-sm font-medium text-text-primary">{value}</span>
    </div>
  );
}
