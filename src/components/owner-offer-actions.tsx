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
    if (status === "REJECTED" && !window.confirm(`${t("ownerOffers.willBeRejected")}?`)) return;
    startTransition(() => {
      void decideOfferAction(propertyId, offerId, status);
    });
  }

  function close() {
    const label = closedLabel(t, transaction);
    if (!window.confirm(`${t("ownerOffers.closeDealTo", { label })}?\n\n${t("ownerOffers.closeDealConfirmBody")}`)) {
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
            {t("ownerOffers.acceptOffer")}
          </Button>
          <Button type="button" variant="secondary" onClick={() => decide("REJECTED")} disabled={pending} className="px-4 py-2 text-sm">
            {t("ownerOffers.rejectButton")}
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
          {t("ownerOffers.closeDealConfirmYes")}
        </button>
      ) : null}
    </div>
  );
}
