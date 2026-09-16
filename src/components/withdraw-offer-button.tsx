"use client";

import { useTransition } from "react";

import { withdrawOffer } from "@/app/inzerat/[id]/actions";

export function WithdrawOfferButton({ propertyId, offerId }: { propertyId: string; offerId: string }) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!window.confirm("Naozaj stiahnuť ponuku?")) return;
    startTransition(() => {
      void withdrawOffer(propertyId, offerId);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="w-fit text-sm text-danger hover:underline disabled:opacity-60"
    >
      Stiahnuť ponuku
    </button>
  );
}
