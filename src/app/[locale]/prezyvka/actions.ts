"use server";

/**
 * Vytvorenie profilu — port appkovej `prezyvka.tsx` logiky. KRITICKÉ:
 * bez tohto riadku web nemá ako založiť inzerát, ponuku, dopyt, správu
 * ani obhliadku — VŠETKY tieto tabuľky majú cudzí kľúč na
 * `offerra.profile` a doteraz ho web nikde nezakladal (zistené
 * 17.9.2026 pri prieskume appkových funkcií — doteraz to nevadilo len
 * preto, že jediné testované účty mali profil už z appky).
 */
import { redirect } from "next/navigation";

import { isUsablePhone } from "@/lib/phone";
import { profileSaveErrorMessage } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";
import { getLocale, getT } from "@/i18n/server";
import { localizeHref } from "@/i18n/href";

export async function createProfileAction(formData: FormData): Promise<{ error: string } | never> {
  const [t, locale] = await Promise.all([getT(), getLocale()]);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Nie si prihlásený." };

  const nickname = String(formData.get("nickname") ?? "").trim();
  const fullName = String(formData.get("fullName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const adult = formData.get("adult") === "on";
  const ownName = formData.get("ownName") === "on";

  if (nickname.length < 3) return { error: t("nickname.nicknameTooShort") };
  if (!adult) return { error: t("nickname.ageRequired") };
  if (!isUsablePhone(phone)) return { error: t("nickname.phoneRequired") };
  if (!ownName) return { error: t("nickname.ownNameRequired") };

  const now = new Date().toISOString();
  const { error } = await supabase
    .schema("offerra")
    .from("profile")
    .insert({
      id: user.id,
      nickname,
      full_name: fullName || null,
      phone: phone || null,
      age_confirmed_at: now,
      agent_declaration_at: now,
    });

  if (error) {
    // Kolízia na primárnom kľúči = profil už existuje (dvojité odoslanie) —
    // nie je to chyba používateľa, appka to isté ošetruje v `saveProfile()`.
    if (/profile_pkey|duplicate key.*pkey/i.test(error.message)) {
      redirect(localizeHref(locale, "/"));
    }
    return { error: profileSaveErrorMessage(error, t("useProfile.nicknameTaken"), t("useProfile.nicknameLength")) };
  }

  redirect(localizeHref(locale, "/"));
}

/**
 * Úprava existujúceho profilu — appka: `Profil` obrazovka, tlačidlo
 * „Uložiť". Vek/vlastné meno sa tu znova NEPÝTAJú — to je jednorazové
 * potvrdenie pri založení, appka to robí rovnako.
 */
export async function updateProfileAction(formData: FormData): Promise<{ error: string } | { ok: true }> {
  const t = await getT();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Nie si prihlásený." };

  const nickname = String(formData.get("nickname") ?? "").trim();
  const fullName = String(formData.get("fullName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (nickname.length < 3) return { error: t("nickname.nicknameTooShort") };
  if (phone && !isUsablePhone(phone)) return { error: t("nickname.phoneRequired") };

  const { error } = await supabase
    .schema("offerra")
    .from("profile")
    .update({ nickname, full_name: fullName || null, phone: phone || null })
    .eq("id", user.id);

  if (error) {
    return { error: profileSaveErrorMessage(error, t("useProfile.nicknameTaken"), t("useProfile.nicknameLength")) };
  }
  return { ok: true };
}
