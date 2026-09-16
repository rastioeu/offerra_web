"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export async function createOutreachAction(requestId: string, propertyId: string, message: string | null) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Nie si prihlásený.");

  const { error } = await supabase.schema("offerra").from("request_outreach").insert({
    request_id: requestId,
    property_id: propertyId,
    from_id: user.id,
    message,
  });
  if (error) {
    if (/duplicate key/i.test(error.message)) {
      throw new Error("Týmto inzerátom si tento dopyt už oslovil.");
    }
    throw error;
  }
  revalidatePath(`/dopyt/${requestId}`);
}
