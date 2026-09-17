"use client";

/**
 * Prezývka — port appkovej `prezyvka.tsx`. Povinný krok po prvom
 * prihlásení: appka aj web na tom stoja (ponuky sú verejné a podpisuje
 * ich prezývka, cudzí kľúč z `property`/`property_offer`/... mieri na
 * `offerra.profile`).
 */
import { useState, useTransition } from "react";

import { createProfileAction } from "@/app/[locale]/prezyvka/actions";
import { Button } from "@/components/button";
import { createT, type Locale } from "@/i18n";

export function PrezyvkaForm({ language, suggestedName }: { language: Locale; suggestedName: string }) {
  const t = createT(language);
  const [nickname, setNickname] = useState("");
  const [fullName, setFullName] = useState(suggestedName);
  const [phone, setPhone] = useState("");
  const [adult, setAdult] = useState(false);
  const [ownName, setOwnName] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const trimmed = nickname.trim();
  const tooShort = trimmed.length > 0 && trimmed.length < 3;

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createProfileAction(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="nickname" className="text-sm font-medium text-text-primary">
          {t("nickname.nicknameLabel")}
        </label>
        <p className="text-xs text-text-muted">{t("nickname.nicknameHint")}</p>
        <input
          id="nickname"
          name="nickname"
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder={t("nickname.nicknamePlaceholder")}
          required
          className="w-full rounded-xl border border-border-strong bg-surface px-4 py-2.5 text-text-primary focus:border-accent-deep focus:outline-none"
        />
        {tooShort ? (
          <p className="text-xs text-warning">{t("nickname.atLeastMoreChars", { count: 3 - trimmed.length })}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="fullName" className="text-sm font-medium text-text-primary">
          {t("nickname.fullNameLabel")}
        </label>
        <p className="text-xs text-text-muted">
          {suggestedName ? t("nickname.fullNameHintSuggested") : t("nickname.fullNameHintManual")}
        </p>
        <input
          id="fullName"
          name="fullName"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder={t("nickname.fullNamePlaceholder")}
          className="w-full rounded-xl border border-border-strong bg-surface px-4 py-2.5 text-text-primary focus:border-accent-deep focus:outline-none"
        />
        <p className="text-xs text-text-muted">{t("nickname.hiddenNote")}</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="phone" className="text-sm font-medium text-text-primary">
          {t("nickname.phoneLabel")}
        </label>
        <p className="text-xs text-text-muted">{t("nickname.phoneHint")}</p>
        <input
          id="phone"
          name="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder={t("nickname.phonePlaceholder")}
          required
          className="w-full rounded-xl border border-border-strong bg-surface px-4 py-2.5 text-text-primary focus:border-accent-deep focus:outline-none"
        />
      </div>

      <label className="flex items-start gap-2 text-sm text-text-secondary">
        <input type="checkbox" name="adult" checked={adult} onChange={(e) => setAdult(e.target.checked)} className="mt-0.5" />
        <span>
          {t("nickname.adultLabel")}
          <span className="block text-xs text-text-muted">{t("nickname.adultHint")}</span>
        </span>
      </label>

      <label className="flex items-start gap-2 text-sm text-text-secondary">
        <input type="checkbox" name="ownName" checked={ownName} onChange={(e) => setOwnName(e.target.checked)} className="mt-0.5" />
        <span>
          {t("nickname.ownNameLabel")}
          <span className="block text-xs text-text-muted">{t("nickname.ownNameHint")}</span>
        </span>
      </label>

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <Button type="submit" disabled={pending} className="w-fit px-6 py-3">
        {pending ? t("nickname.savingButton") : t("nickname.continueButton")}
      </Button>
    </form>
  );
}
