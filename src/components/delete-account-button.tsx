"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

/**
 * Zmazanie účtu — appka aj web volajú tú istú `offerra.delete_my_account()`
 * (SQL funkcia, kaskády zmažú profil/inzeráty/fotky/ponuky/dopyty).
 * Nezvratné, preto DVE potvrdenia (rovnaká zásada ako appka).
 */
export function DeleteAccountButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    if (busy) return;

    const firstOk = window.confirm(
      "Natrvalo sa zmaže tvoj profil, prezývka, všetky inzeráty aj s fotkami, podané ponuky a dopyty. Nedá sa to vrátiť."
    );
    if (!firstOk) return;
    const secondOk = window.confirm("Naozaj zmazať účet? Túto akciu už nepôjde vziať späť.");
    if (!secondOk) return;

    setBusy(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error: rpcError } = await supabase.schema("offerra").rpc("delete_my_account");
      if (rpcError) throw rpcError;

      await supabase.auth.signOut().catch(() => undefined);
      window.alert("Účet zmazaný. Ďakujeme, že si to skúsil.");
      router.push("/");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Zmazanie účtu zlyhalo");
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
        Zmazať účet
      </button>
      <p className="text-xs text-text-muted">Zmazanie účtu je nezvratné a pýta si dve potvrdenia.</p>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
    </div>
  );
}
