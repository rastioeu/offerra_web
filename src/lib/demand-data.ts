/**
 * Dopyty — SERVER-SIDE dátové funkcie, appka: `useRequests`/`useRequest`
 * v `use-offers.ts`. Filter je TEN ISTÝ objekt ako v katalógu inzerátov
 * (`CatalogFilter`) — len NULL-y sa správajú inak (dopyt „akýkoľvek typ"
 * má `property_type = null` a taký dopyt filter NESMIE vyradiť, preto
 * `or (... is null)` pri každom poli).
 */
import type { BuyerRequest, MyOutreach, Outreach } from "@/lib/offers";
import type { CatalogSort } from "@/lib/property";
import { stemQuery, type CatalogFilter } from "@/lib/search";
import { createClient } from "@/lib/supabase/server";

export async function fetchDemands(
  filter?: Partial<CatalogFilter> | null,
  mineOf?: string,
  sort: CatalogSort = "NEWEST"
): Promise<BuyerRequest[]> {
  const supabase = await createClient();
  const db = supabase.schema("offerra");

  let q = db.from("buyer_request").select("*, author:user_id(nickname, avatar_url)");
  q = mineOf ? q.eq("user_id", mineOf) : q.eq("status", "ACTIVE");

  if (filter?.transaction) q = q.eq("transaction_type", filter.transaction);
  if (filter?.propertyType) q = q.or(`property_type.eq.${filter.propertyType},property_type.is.null`);
  if (filter?.city) q = q.eq("city", filter.city);
  if (filter?.roomsMin != null) q = q.or(`rooms_min.gte.${filter.roomsMin},rooms_min.is.null`);
  if (filter?.areaMin != null) q = q.or(`area_min.gte.${filter.areaMin},area_min.is.null`);
  if (filter?.priceMax != null) q = q.or(`budget_max.lte.${filter.priceMax},budget_max.is.null`);
  if (filter?.priceMin != null) q = q.or(`budget_min.gte.${filter.priceMin},budget_min.is.null`);
  if (filter?.text) {
    for (const w of stemQuery(filter.text.replace(/[%,()]/g, " ")).split(" ")) {
      if (w) q = q.like("search_norm", `%${w}%`);
    }
  }

  const { data, error } = await q.order("created_at", { ascending: false }).limit(200);
  if (error) throw error;
  // Appka: dopyty ponúkajú len „Najnovšie" (buyer_request nemá uzávierku,
  // ENDING_SOON tu nemá podľa čoho triediť) — poradie ostáva podľa novosti
  // bez ohľadu na `sort`.
  void sort;
  return (data ?? []) as BuyerRequest[];
}

export async function fetchDemand(id: string): Promise<BuyerRequest | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .schema("offerra")
    .from("buyer_request")
    .select("*, author:user_id(nickname, avatar_url)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data as BuyerRequest) ?? null;
}

export async function fetchOutreach(requestId: string): Promise<Outreach[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .schema("offerra")
    .from("request_outreach")
    .select("*")
    .eq("request_id", requestId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Outreach[];
}

/** Moje oslovenia — appka: `my_request_outreach()` RPC. `requestId` zúži na jeden dopyt. */
export async function fetchMyOutreach(requestId?: string): Promise<MyOutreach[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.schema("offerra").rpc("my_request_outreach");
  if (error) throw error;
  const all = (data ?? []) as MyOutreach[];
  return requestId ? all.filter((o) => o.request_id === requestId) : all;
}
