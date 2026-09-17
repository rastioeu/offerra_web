"use client";

import { useTransition } from "react";

import { setUserRole, setUserVerified } from "@/app/admin/actions";

/**
 * Overenie a rola správcu — appka: `toggleVerified`/`toggleAdmin`.
 * Poznámka pri overovaní je POVINNÁ (appka to isté cez `Alert.prompt`) —
 * odznak bez dôvodu je len ozdoba.
 */
export function AdminUserActions({
  userId,
  nickname,
  isVerified,
  isAdmin,
}: {
  userId: string;
  nickname: string;
  isVerified: boolean;
  isAdmin: boolean;
}) {
  const [pending, startTransition] = useTransition();

  function verify() {
    if (isVerified) {
      if (!window.confirm(`Odobrať overenie? ${nickname} stratí odznak.`)) return;
      startTransition(() => void setUserVerified(userId, false, ""));
      return;
    }
    const note = window.prompt("Napíš, ČO si overil — táto veta sa zobrazí ľuďom pri jeho odznaku.", "Doklad totožnosti a list vlastníctva");
    if (note == null) return;
    startTransition(() => void setUserVerified(userId, true, note));
  }

  function toggleRole() {
    const granting = !isAdmin;
    const msg = granting
      ? `Naozaj urobiť ${nickname} správcom? Získa plný prístup do tejto konzoly.`
      : `${nickname} stratí prístup do konzoly. Jeho účet a dáta ostanú nedotknuté.`;
    if (!window.confirm(msg)) return;
    startTransition(() => void setUserRole(userId, granting));
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={verify}
        disabled={pending}
        className="rounded-xl border border-border-strong bg-surface px-3 py-1.5 text-sm font-medium text-text-primary hover:bg-surface-pressed disabled:opacity-60"
      >
        {isVerified ? "Odobrať overenie" : "Overiť používateľa"}
      </button>
      <button
        type="button"
        onClick={toggleRole}
        disabled={pending}
        className="rounded-xl border border-border-strong bg-surface px-3 py-1.5 text-sm font-medium text-text-primary hover:bg-surface-pressed disabled:opacity-60"
      >
        {isAdmin ? "Odobrať práva správcu" : "Urobiť správcom"}
      </button>
    </div>
  );
}
