import { fetchReviews } from "@/lib/rating-data";
import { ratingLabel, type RatingSummary } from "@/lib/rating";
import { formatDate } from "@/lib/property";
import { t, language } from "@/i18n";

/**
 * Verejné hodnotenia človeka — prenesené z appky (`Reviews`). Zobrazuje
 * sa pri inzeráte, presne tam, kde sa niekto rozhoduje, či s tým
 * človekom obchodovať — nie v profile, kam nikto cudzí nechodí.
 */
export async function Reviews({
  userId,
  nickname,
  summary,
}: {
  userId: string;
  nickname: string;
  summary: RatingSummary | undefined;
}) {
  const items = await fetchReviews(userId);
  const label = ratingLabel(summary);

  if (!label && items.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
        {t("reviews.title", { nickname })}
      </h3>
      {label ? <p className="text-lg font-bold text-accent-deep">{label}</p> : null}
      <p className="text-xs text-text-muted">{t("reviews.whoCanRate")}</p>

      {items.map((r) => (
        <div key={r.id} className="flex flex-col gap-1 border-t border-border pt-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-text-primary">{r.rater?.nickname ?? t("reviews.unknown")}</span>
            <span className="text-accent-deep">{"★".repeat(r.stars)}</span>
          </div>
          {r.comment ? <p className="text-sm italic text-text-secondary">„{r.comment}&quot;</p> : null}
          <p className="text-xs text-text-muted">{formatDate(language, r.created_at)}</p>
        </div>
      ))}
    </div>
  );
}
