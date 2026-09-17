"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { createT, isLocale } from "@/i18n";
import { localizeHref } from "@/i18n/href";
import { createClient } from "@/lib/supabase/client";

/**
 * Zmazanie účtu — appka aj web volajú tú istú `offerra.delete_my_account()`
 * (SQL funkcia, kaskády zmažú profil/inzeráty/fotky/ponuky/dopyty).
 * Nezvratné, preto DVE potvrdenia (rovnaká zásada ako appka).
 */
export function DeleteAccountButton() {
  const router = useRouter();
  const pathname = usePathname();
  const maybeLocale = pathname.split("/")[1];
  const locale = isLocale(maybeLocale) && maybeLocale !== "sk" ? maybeLocale : "sk";
  const t = createT(locale);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    if (busy) return;

    const firstOk = window.confirm(`${t("nastavenia.deleteAccountTitle")}\n\n${t("nastavenia.deleteAccountBody")}`);
    if (!firstOk) return;
    const secondOk = window.confirm(`${t("nastavenia.confirmAgainTitle")}\n\n${t("nastavenia.confirmAgainBody")}`);
    if (!secondOk) return;

    setBusy(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error: rpcError } = await supabase.schema("offerra").rpc("delete_my_account");
      if (rpcError) throw rpcError;

      await supabase.auth.signOut().catch(() => undefined);
      window.alert(`${t("nastavenia.accountDeletedTitle")}\n\n${t("nastavenia.accountDeletedBody")}`);
      router.push(localizeHref(locale, "/"));
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("nastavenia.deleteAccountFailedTitle"));
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={busy}
        className="w-fit rounded-xl border border-danger bg-surface px-4 py-2 text-sm font-semibold text-danger hover:bg-danger/10 disabled:opacity-60"
      >
        {t("nastavenia.deleteAccount")}
      </button>
      <p className="text-xs text-text-muted">{t("nastavenia.deleteAccountConfirmHint")}</p>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
    </div>
  );
}
