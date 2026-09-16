/**
 * Hodnotenia — SERVER-SIDE dátové funkcie, prenesené z appkového
 * `rating.ts`.
 */
import type { Rating, RatingSummary, Review } from "@/lib/rating";
import { createClient } from "@/lib/supabase/server";

/** Priemery pre viacerých ľudí naraz. */
export async function fetchRatings(userIds: string[]): Promise<Record<string, RatingSummary>> {
  if (userIds.length === 0) return {};
  const supabase = await createClient();
  const { data, error } = await supabase.schema("offerra").rpc("user_ratings", { p_users: userIds });
  if (error) throw error;
  const map: Record<string, RatingSummary> = {};
  for (const r of (data ?? []) as RatingSummary[]) map[r.user_id] = r;
  return map;
}

/** Verejné hodnotenia jedného človeka — len tie S TEXTOM. */
export async function fetchReviews(userId: string, limit = 10): Promise<Review[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .schema("offerra")
    .from("rating")
    .select("id, stars, comment, created_at, rater:rater_id(nickname, avatar_url)")
    .eq("ratee_id", userId)
    .not("comment", "is", null)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as unknown as Review[];
}

/** Smiem hodnotiť tohto človeka za tento obchod? Odpovedá DB, nie appka. */
export async function canRate(propertyId: string, rateeId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase.schema("offerra").rpc("can_rate", { p_property: propertyId, p_ratee: rateeId });
  if (error) throw error;
  return data === true;
}

/** Moje aj prijaté hodnotenie za TENTO obchod (appkový `RatingCard.load`). */
export async function fetchMyAndReceivedRating(
  propertyId: string,
  myId: string
): Promise<{ mine: Rating | null; received: Rating | null }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .schema("offerra")
    .from("rating")
    .select("id, property_id, rater_id, ratee_id, stars, comment, created_at, updated_at")
    .eq("property_id", propertyId);
  if (error) throw error;
  const rows = (data ?? []) as Rating[];
  return {
    mine: rows.find((x) => x.rater_id === myId) ?? null,
    received: rows.find((x) => x.ratee_id === myId) ?? null,
  };
}
