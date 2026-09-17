"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export async function saveRatingAction(
  propertyId: string,
  rateeId: string,
  stars: number,
  comment: string | null
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Nie si prihlásený.");

  const { error } = await supabase
    .schema("offerra")
    .from("rating")
    .upsert(
      { property_id: propertyId, rater_id: user.id, ratee_id: rateeId, stars, comment },
      { onConflict: "property_id,rater_id" }
    );
  if (error) throw error;
  revalidatePath(`/inzerat/${propertyId}`);
}
