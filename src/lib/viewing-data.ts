/**
 * Obhliadky — SERVER-SIDE dátové funkcie. `fetchViewings` vracia VŠETKO,
 * čo volajúci smie vidieť — RLS to zúži samo (záujemcovi na tú jeho,
 * vlastníkovi na všetky na jeho inzerát), appka sa preto nemusí pýtať
 * „som vlastník?", odpoveď už je v dátach.
 */
import type { Viewing, ViewingContact } from "@/lib/viewing";
import { createClient } from "@/lib/supabase/server";

export async function fetchViewings(propertyId: string): Promise<Viewing[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .schema("offerra")
    .from("viewing")
    .select("id, property_id, requester_id, status, created_at, updated_at")
    .eq("property_id", propertyId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Viewing[];
}

export async function fetchViewingContact(viewingId: string): Promise<ViewingContact | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.schema("offerra").rpc("viewing_contact", { p_viewing_id: viewingId });
  if (error) throw error;
  return ((data ?? []) as ViewingContact[])[0] ?? null;
}
