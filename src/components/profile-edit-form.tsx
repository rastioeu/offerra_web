"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { updateProfileAction } from "@/app/[locale]/prezyvka/actions";
import { Button } from "@/components/button";
import { createT, type Locale } from "@/i18n";
import type { MyProfile } from "@/lib/profile";

export function ProfileEditForm({ profile, language }: { profile: MyProfile; language: Locale }) {
  const t = createT(language);
  const router = useRouter();
  const [nickname, setNickname] = useState(profile.nickname);
  const [fullName, setFullName] = useState(profile.full_name ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    setSavedAt(null);
    startTransition(async () => {
      const result = await updateProfileAction(formData);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setSavedAt(Date.now());
      router.refresh();
    });
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="nickname" className="text-sm font-medium text-text-primary">
          {t("nickname.nicknameLabel")}
        </label>
        <input
          id="nickname"
          name="nickname"
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          required
          className="w-full rounded-xl border border-border-strong bg-surface px-4 py-2.5 text-text-primary focus:border-accent-deep focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="fullName" className="text-sm font-medium text-text-primary">
          {t("nickname.fullNameLabel")}
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full rounded-xl border border-border-strong bg-surface px-4 py-2.5 text-text-primary focus:border-accent-deep focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="phone" className="text-sm font-medium text-text-primary">
          {t("nickname.phoneLabel")}
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded-xl border border-border-strong bg-surface px-4 py-2.5 text-text-primary focus:border-accent-deep focus:outline-none"
        />
      </div>

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <div className="flex items-center gap-3">
        <Button type="submit" variant="secondary" disabled={pending} className="w-fit px-5 py-2 text-sm">
          {pending ? t("nickname.savingButton") : t("inzeratEdit.saveButton")}
        </Button>
        {savedAt ? <span className="text-sm text-text-muted">{t("inzeratEdit.savedToast")}.</span> : null}
      </div>
    </form>
  );
}
