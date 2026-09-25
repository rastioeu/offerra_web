"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { getT } from "@/i18n/server";
import { MAX_PHOTOS } from "@/lib/photo-limits";

const BUCKET = "offerra-media";
/** Bucket má limit 10 MB (appka: `lib/photo.ts`) — zastavíme sa skôr, s vysvetlením. */
const MAX_BYTES = 8 * 1024 * 1024;

/**
 * Nahratie fotky — appka: `lib/photo.ts` + `use-photo-upload.ts`, tu ako
 * Server Action (File v FormData Server Actions podporujú priamo).
 * Cesta MUSÍ začínať `auth.uid()` — to isté vynucuje aj Storage RLS.
 */
export async function uploadPhotoAction(propertyId: string, formData: FormData) {
  const [supabase, t] = await Promise.all([createClient(), getT()]);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error(t("common.notLoggedIn"));

  const file = formData.get("file");
  if (!(file instanceof File)) throw new Error(t("common.fileTransferFailed"));
  if (file.size > MAX_BYTES) {
    throw new Error(t("photo.tooLarge", { mb: (file.size / 1048576).toFixed(1) }));
  }

  // Strop stráži server, nie len tlačidlo — viac kariet/rýchle klikanie
  // by ho inak obišlo.
  const db = supabase.schema("offerra");
  const { count } = await db.from("media").select("id", { count: "exact", head: true }).eq("property_id", propertyId);
  if ((count ?? 0) >= MAX_PHOTOS) throw new Error(t("photo.limitReached", { max: MAX_PHOTOS }));

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const safeExt = ["jpg", "jpeg", "png", "webp"].includes(ext) ? ext : "jpg";
  const contentType = safeExt === "png" ? "image/png" : safeExt === "webp" ? "image/webp" : "image/jpeg";
  // Náhodná prípona — viac fotiek sa nahráva za sebou v tej istej milisekunde.
  const path = `${user.id}/${propertyId}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${safeExt}`;

  const bytes = new Uint8Array(await file.arrayBuffer());
  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, bytes, { contentType });
  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);

  const { error: insertError } = await db
    .from("media")
    .insert({ property_id: propertyId, url: urlData.publicUrl, sort_order: count ?? 0 });
  if (insertError) throw insertError;

  revalidatePath(`/moje-inzeraty/${propertyId}/upravit`);
}

/**
 * appka: súbor v Storage je DRUHÝ krok — ak zlyhá, riadok je už preč
 * a používateľ vidí správny stav. Osirelý súbor je menšie zlo než
 * fotka, ktorá sa „nedá zmazať".
 */
export async function removePhotoAction(propertyId: string, mediaId: string, url: string) {
  const [supabase, t] = await Promise.all([createClient(), getT()]);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error(t("common.notLoggedIn"));

  const db = supabase.schema("offerra");
  const { error } = await db.from("media").delete().eq("id", mediaId);
  if (error) throw error;

  const marker = `/${BUCKET}/`;
  const at = url.indexOf(marker);
  if (at >= 0) {
    const path = decodeURIComponent(url.slice(at + marker.length).split("?")[0]);
    await supabase.storage.from(BUCKET).remove([path]);
  }

  revalidatePath(`/moje-inzeraty/${propertyId}/upravit`);
}
