"use client";

import { useState, useTransition } from "react";

import { submitOffer } from "@/app/inzerat/[id]/actions";
import { OfferValidityPicker } from "@/components/offer-validity-picker";

export function OfferForm({
  propertyId,
  existing,
}: {
  propertyId: string;
  existing: { id: string; amount: number; message: string | null; valid_until: string | null } | null;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        await submitOffer(propertyId, existing?.id ?? null, formData);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Odoslanie zlyhalo");
      }
    });
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-4">
      <h3 className="font-semibold text-text-primary">{existing ? "Upraviť moju ponuku" : "Podať ponuku"}</h3>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="amount" className="text-sm font-medium text-text-primary">
          Suma (€)
        </label>
        <input
          id="amount"
          name="amount"
          type="text"
          inputMode="decimal"
          defaultValue={existing?.amount ?? ""}
          required
          className="w-full rounded-xl border border-border-strong bg-surface px-4 py-2.5 text-text-primary focus:border-accent-deep focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="message" className="text-sm font-medium text-text-primary">
          Odkaz predávajúcemu (nepovinné)
        </label>
        <textarea
          id="message"
          name="message"
          rows={3}
          defaultValue={existing?.message ?? ""}
          className="w-full rounded-xl border border-border-strong bg-surface px-4 py-2.5 text-text-primary focus:border-accent-deep focus:outline-none"
        />
      </div>

      <OfferValidityPicker defaultValue={existing?.valid_until} />

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded-xl bg-primary px-5 py-2.5 font-semibold text-on-primary hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Odosielam…" : existing ? "Uložiť zmenu" : "Podať ponuku"}
      </button>
    </form>
  );
}
