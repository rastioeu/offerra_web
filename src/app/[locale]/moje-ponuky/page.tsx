import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { fetchMyOffers } from "@/lib/my-offers";
import { formatAmount, getOfferStatusLabel } from "@/lib/offers";
import { getTransactionLabel } from "@/lib/labels";
import { createClient } from "@/lib/supabase/server";
import { getT } from "@/i18n/server";

export const metadata: Metadata = {
  title: "Moje ponuky",
};

const STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-surface-pressed text-text-secondary",
  ACCEPTED: "bg-success/10 text-success",
  REJECTED: "bg-danger/10 text-danger",
  WITHDRAWN: "bg-surface-pressed text-text-muted",
  EXPIRED: "bg-surface-pressed text-text-muted",
};

export default async function MyOffersPage() {
  const t = await getT();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/moje-ponuky");

  const offers = await fetchMyOffers(user.id);
  const statusLabel = getOfferStatusLabel(t);
  const transactionLabel = getTransactionLabel(t);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-text-primary">Moje ponuky</h1>

      {offers.length === 0 ? (
        <p className="text-text-muted">Zatiaľ si nepodal žiadnu ponuku.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {offers.map((offer) => (
            <Link
              key={offer.id}
              href={`/inzerat/${offer.property_id}`}
              className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-4 hover:border-border-strong"
            >
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold text-text-primary">
                  {offer.property?.title || "Inzerát"}
                </span>
                <span className="text-sm text-text-muted">
                  {offer.property ? transactionLabel[offer.property.transaction_type] : null}
                </span>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="font-money font-bold text-accent">
                  {offer.property ? formatAmount(t, offer.amount, offer.property.transaction_type) : offer.amount}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[offer.status] ?? "bg-surface-pressed text-text-secondary"}`}
                >
                  {statusLabel[offer.status]}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
