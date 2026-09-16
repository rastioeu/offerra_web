"use client";

import { useState, useTransition } from "react";

import { createOutreachAction } from "@/app/dopyt/[id]/actions";
import { formatPrice } from "@/lib/property";
import type { PropertyWithMedia } from "@/lib/property";
import { t } from "@/i18n";

type PickableProperty = Pick<
  PropertyWithMedia,
  "id" | "title" | "city" | "transaction_type" | "asking_price_hint"
>;

/**
 * „Osloviť so svojím inzerátom" — prenesené z appky (`dopyt/[id].tsx`,
 * modálny picker). Vyberie sa JEDEN z vlastných zverejnených inzerátov,
 * nepovinná správa, `request_outreach` je unikátny na (dopyt, inzerát) —
 * duplicitné oslovenie tým istým inzerátom odmietne DB, akcia to premení
 * na zrozumiteľnú hlášku.
 */
export function OutreachPicker({
  requestId,
  myProperties,
  alreadySent,
}: {
  requestId: string;
  myProperties: PickableProperty[];
  alreadySent: Set<string>;
}) {
  const [open, setOpen] = useState(false);
  const [chosen, setChosen] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (myProperties.length === 0) {
    return !open ? (
      <button
        type="button"
        onClick={() => setError(t("dopytDetail.nothingToOfferBody"))}
        className="w-fit rounded-xl bg-primary px-5 py-2.5 font-semibold text-on-primary hover:opacity-90"
      >
        {t("dopytDetail.outreachButton")}
      </button>
    ) : null;
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-fit rounded-xl bg-primary px-5 py-2.5 font-semibold text-on-primary hover:opacity-90"
      >
        {t("dopytDetail.outreachButton")}
      </button>
    );
  }

  function submit() {
    if (!chosen) return;
    setError(null);
    startTransition(async () => {
      try {
        await createOutreachAction(requestId, chosen, message.trim() || null);
        setOpen(false);
        setChosen(null);
        setMessage("");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Odoslanie zlyhalo");
      }
    });
  }

  // appka tu vie navyše dosadiť najvyššiu živú ponuku, keď orientačná
  // cena chýba — `fetchMyProperties` ju zatiaľ nedoťahuje (jednoduchšie
  // priznané zjednodušenie, viď report).
  const priceOf = (p: PickableProperty) => formatPrice(t, p.asking_price_hint, p.transaction_type) ?? t("dopytDetail.priceNotGiven");

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4">
      <h3 className="font-semibold text-text-primary">{t("dopytDetail.pickerTitle")}</h3>
      <div className="flex flex-col gap-2">
        {myProperties.map((p) => {
          const used = alreadySent.has(p.id);
          const active = chosen === p.id;
          return (
            <button
              key={p.id}
              type="button"
              disabled={used}
              onClick={() => setChosen(p.id)}
              className={`flex flex-col gap-0.5 rounded-xl border p-3 text-left disabled:opacity-50 ${
                active ? "border-primary bg-surface-pressed" : "border-border"
              }`}
            >
              <span className="font-semibold text-text-primary">{p.title || t("dopytDetail.noTitle")}</span>
              <span className="font-money font-bold text-primary">{priceOf(p)}</span>
              <span className="text-sm text-text-muted">{used ? t("dopytDetail.alreadySentWith") : p.city}</span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-text-primary">{t("dopytDetail.messageLabel")}</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t("dopytDetail.messagePlaceholder")}
          rows={3}
          className="w-full rounded-xl border border-border-strong bg-surface px-4 py-2.5 text-text-primary focus:border-accent-deep focus:outline-none"
        />
      </div>

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={submit}
          disabled={pending || !chosen}
          className="rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-on-primary hover:opacity-90 disabled:opacity-60"
        >
          {pending ? t("dopytDetail.sendingButton") : t("dopytDetail.sendButton")}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-xl border border-border-strong bg-surface px-5 py-2 text-sm font-medium text-text-primary hover:bg-surface-pressed"
        >
          Zrušiť
        </button>
      </div>
    </div>
  );
}
