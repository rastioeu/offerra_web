/**
 * Uzavretie obchodu a hodnotenia — ČISTÉ typy, prenesené z
 * `/root/offerra/src/lib/rating.ts` (appka). Dátové funkcie sú
 * v `lib/rating-data.ts`.
 *
 * HODNOTENIA SÚ CELÉ VEREJNÉ — hviezdičky aj text (Rastio, 9.8.2026):
 * zmyslom je dôvera pre budúcich záujemcov, priemer sám nestačí, treba
 * kontext. Proti osočovaniu stojí nahlasovanie, nie skrývanie.
 */
export type Rating = {
  id: string;
  property_id: string;
  rater_id: string;
  ratee_id: string;
  stars: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
};

export type RatingSummary = { user_id: string; stars_avg: number; rating_count: number };

/** „4,6 ★ (12)". `null`, keď človek ešte hodnotenie nemá — nula by klamala. */
export function ratingLabel(s: RatingSummary | undefined): string | null {
  if (!s || !s.rating_count) return null;
  return `${String(s.stars_avg).replace(".", ",")} ★ (${s.rating_count})`;
}

export type Review = {
  id: string;
  stars: number;
  comment: string | null;
  created_at: string;
  rater: { nickname: string; avatar_url: string | null } | null;
};
