"use client";

import { useTransition } from "react";

import { closeDealAction, decideOfferAction } from "@/app/[locale]/inzerat/[id]/owner-offer-actions";
import { Button } from "@/components/button";
import { closedLabel, type TransactionType } from "@/lib/property";
import { createT, type Locale } from "@/i18n";

export function OwnerOfferActions({
  propertyId,
  offerId,
  offerStatus,
  propertyActive,
  transaction,
  language,
}: {
  propertyId: string;
  offerId: string;
  offerStatus: string;
  propertyActive: boolean;
  transaction: TransactionType;
  language: Locale;
}) {
  const t = createT(language);
  const [pending, startTransition] = useTransition();

  function decide(status: "ACCEPTED" | "REJECTED") {
    if (status === "REJECTED" && !window.confirm("Odmietnuť túto ponuku?")) return;
    startTransition(() => {
      void decideOfferAction(propertyId, offerId, status);
    });
  }

  function close() {
    const label = closedLabel(t, transaction);
    if (
      !window.confirm(
        `${label} tomuto záujemcovi? Inzerát zmizne z katalógu, ostatné čakajúce ponuky sa uzavrú. Späť sa to vziať nedá.`
      )
    ) {
      return;
    }
    startTransition(() => {
      void closeDealAction(propertyId, offerId);
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {offerStatus === "PENDING" ? (
        <>
          <Button type="button" onClick={() => decide("ACCEPTED")} disabled={pending} className="px-4 py-2 text-sm">
            Prijať ponuku
          </Button>
          <Button type="button" variant="secondary" onClick={() => decide("REJECTED")} disabled={pending} className="px-4 py-2 text-sm">
            Odmietnuť
          </Button>
        </>
      ) : null}
      {propertyActive && (offerStatus === "ACCEPTED" || offerStatus === "PENDING") ? (
        <button
          type="button"
          onClick={close}
          disabled={pending}
          className="rounded-xl border border-accent-deep bg-surface px-4 py-2 text-sm font-medium text-accent-deep hover:bg-accent-soft disabled:opacity-60"
        >
          Uzavrieť obchod
        </button>
      ) : null}
    </div>
  );
}
