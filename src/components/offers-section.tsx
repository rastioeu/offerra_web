import { OfferForm } from "@/components/offer-form";
import { WithdrawOfferButton } from "@/components/withdraw-offer-button";
import { formatAmount, getOfferStatusLabel } from "@/lib/offers";
import type { PropertyDetail } from "@/lib/detail";
import { fetchOffers } from "@/lib/property-offers";
import { t } from "@/i18n";

const STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-surface-pressed text-text-secondary",
  ACCEPTED: "bg-success/10 text-success",
  REJECTED: "bg-danger/10 text-danger",
  WITHDRAWN: "bg-surface-pressed text-text-muted",
  EXPIRED: "bg-surface-pressed text-text-muted",
};

/**
 * Ponuky na inzeráte — verejný zoznam (appka: `useOffers` + `OffersTab`).
 * Otvorené, ale pseudonymné (Rastio, 7.8.2026) — vidí ich aj neprihlásený.
 *
 * CHÝBA oproti appke: rozhodovanie MAJITEĽA (prijať/odmietnuť, odkrytie
 * kontaktu po prijatí — appkový `OwnerOffers`) a dotazník nájomcu pri
 * prenájme. Priznané v `reports/OFFERRA_WEB_MILNIK1.md`, nie tichá
 * medzera — majiteľ zatiaľ musí ponuky vybaviť v appke.
 */
export async function OffersSection({ property, userId }: { property: PropertyDetail; userId: string | null }) {
  const offers = await fetchOffers(property.id);
  const statusLabel = getOfferStatusLabel(t);
  const isOwner = userId === property.owner_id;
  const mine = userId ? offers.find((o) => o.bidder_id === userId && o.status !== "WITHDRAWN") : undefined;

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-text-primary">Ponuky ({offers.length})</h2>

      {offers.length === 0 ? (
        <p className="text-text-muted">Zatiaľ žiadna ponuka.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="flex items-center justify-between gap-4 rounded-xl border border-border bg-surface p-3"
            >
              <span className="text-text-secondary">{offer.bidder?.nickname ?? "Záujemca"}</span>
              <div className="flex items-center gap-2">
                <span className="font-money font-bold text-text-primary">
                  {formatAmount(t, offer.amount, property.transaction_type)}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[offer.status] ?? "bg-surface-pressed text-text-secondary"}`}
                >
                  {statusLabel[offer.status]}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {isOwner ? (
        <p className="text-sm text-text-muted">
          Si vlastník tohto inzerátu — prijatie/odmietnutie ponúk zatiaľ funguje len v appke.
        </p>
      ) : userId ? (
        <div className="flex flex-col gap-2">
          <OfferForm
            propertyId={property.id}
            existing={mine ? { id: mine.id, amount: mine.amount, message: mine.message, valid_until: mine.valid_until } : null}
          />
          {mine ? <WithdrawOfferButton propertyId={property.id} offerId={mine.id} /> : null}
        </div>
      ) : (
        <p className="text-sm text-text-muted">
          <a href="/login" className="text-link hover:underline">
            Prihlás sa
          </a>{" "}
          a podaj vlastnú ponuku.
        </p>
      )}
    </section>
  );
}
