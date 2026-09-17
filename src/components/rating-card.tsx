"use client";

import { useState, useTransition } from "react";

import { saveRatingAction } from "@/app/inzerat/[id]/rating-actions";
import { Button } from "@/components/button";
import type { Rating } from "@/lib/rating";
import { t } from "@/i18n";

/**
 * Hodnotenie druhej strany po uzavretom obchode — prenesené z appky.
 * Zobrazí sa LEN keď to dovolí databáza (`can_rate`, vyhodnotené server-
 * side v `RatingsSection`) — appka sa nepýta „som vlastník?", odpoveď je
 * v DB.
 */
export function RatingCard({
  propertyId,
  rateeId,
  rateeNickname,
  allowed,
  mine,
  received,
}: {
  propertyId: string;
  rateeId: string;
  rateeNickname: string;
  allowed: boolean;
  mine: Rating | null;
  received: Rating | null;
}) {
  const [stars, setStars] = useState(mine?.stars ?? 0);
  const [comment, setComment] = useState(mine?.comment ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!allowed && !mine && !received) return null;

  function submit() {
    if (stars < 1) {
      setError(t("ratingCard.starsRequired"));
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await saveRatingAction(propertyId, rateeId, stars, comment.trim() || null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Uloženie zlyhalo");
      }
    });
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-text-muted">{t("ratingCard.title")}</h3>

      {allowed ? (
        <>
          <p className="text-sm text-text-secondary">{t("ratingCard.howWasIt", { nickname: rateeNickname })}</p>

          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setStars(n)}
                aria-label={t("ratingCard.starOutOfFive", { n })}
                className="text-3xl leading-none"
                style={{ color: n <= stars ? "var(--color-accent-deep)" : "var(--color-border)" }}
              >
                ★
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-primary">{t("ratingCard.commentLabel")}</label>
            <p className="text-xs text-text-muted">{t("ratingCard.commentHint")}</p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t("ratingCard.commentPlaceholder")}
              rows={3}
              className="w-full rounded-xl border border-border-strong bg-surface px-4 py-2.5 text-text-primary focus:border-accent-deep focus:outline-none"
            />
          </div>

          {error ? <p className="text-sm text-danger">{error}</p> : null}

          <Button type="button" onClick={submit} disabled={pending} className="w-fit px-5 py-2 text-sm">
            {pending ? t("ratingCard.savingButton") : mine ? t("ratingCard.editButton") : t("ratingCard.submitButton")}
          </Button>
          <p className="text-xs text-text-muted">{t("ratingCard.editAnytime")}</p>
        </>
      ) : null}

      {received ? (
        <div className="flex flex-col gap-1 pt-2">
          <p className="text-sm text-text-muted">{t("ratingCard.howTheyRatedYou", { nickname: rateeNickname })}</p>
          <p className="text-2xl text-accent-deep">{"★".repeat(received.stars)}</p>
          {received.comment ? <p className="text-sm text-text-secondary">„{received.comment}&quot;</p> : null}
        </div>
      ) : null}
    </div>
  );
}
