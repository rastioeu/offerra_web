"use client";

import { usePathname } from "next/navigation";
import { useTransition } from "react";

import { withdrawOffer } from "@/app/[locale]/inzerat/[id]/actions";
import { createT, isLocale } from "@/i18n";

export function WithdrawOfferButton({ propertyId, offerId }: { propertyId: string; offerId: string }) {
  const pathname = usePathname();
  const maybeLocale = pathname.split("/")[1];
  const locale = isLocale(maybeLocale) && maybeLocale !== "sk" ? maybeLocale : "sk";
  const t = createT(locale);
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!window.confirm(`${t("ponukaForm.withdrawTitle")}\n\n${t("ponukaForm.withdrawBody")}`)) return;
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
      {t("ponukaForm.withdrawButton")}
    </button>
  );
}
