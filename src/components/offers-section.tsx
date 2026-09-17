import { Avatar } from "@/components/avatar";
import { OfferCountdownPill } from "@/components/offer-countdown-pill";
import { OfferForm } from "@/components/offer-form";
import { OfferTimeline } from "@/components/offer-timeline";
import { OwnerOfferActions } from "@/components/owner-offer-actions";
import { WithdrawOfferButton } from "@/components/withdraw-offer-button";
import { formatAmount, getOfferStatusLabel, type OfferContact, type TenantProfile } from "@/lib/offers";
import type { PropertyDetail } from "@/lib/detail";
import { fetchOffers, fetchOfferContact, fetchTenantProfile } from "@/lib/property-offers";
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
 * Vlastník naviac vidí odkaz na ponuke (`offer_messages()`) a má
 * tlačidlá Prijať/Odmietnuť/Uzavrieť obchod (appka: `OwnerOffers`).
 *
 * Dotazník nájomcu aj `OfferTimeline` (vizuálna história stavu ponuky,
 * odvodená čisto z `created_at`/`viewed_by_owner_at`/`updated_at`,
 * žiadna nová tabuľka) doplnené 17.9.2026.
 */
export async function OffersSection({ property, userId }: { property: PropertyDetail; userId: string | null }) {
  const offers = await fetchOffers(property.id);
  const statusLabel = getOfferStatusLabel(t);
  const isOwner = userId === property.owner_id;
  const isRent = property.transaction_type === "RENT";
  const mine = userId ? offers.find((o) => o.bidder_id === userId && o.status !== "WITHDRAWN") : undefined;

  const contacts: Record<string, OfferContact | null> = {};
  const tenants: Record<string, TenantProfile | null> = {};
  if (isOwner && isRent) {
    for (const offer of offers) {
      tenants[offer.id] = await fetchTenantProfile(offer.id).catch(() => null);
      if (offer.status === "ACCEPTED") {
        contacts[offer.id] = await fetchOfferContact(offer.id).catch(() => null);
      }
    }
  } else if (isOwner) {
    for (const offer of offers) {
      if (offer.status === "ACCEPTED") {
        contacts[offer.id] = await fetchOfferContact(offer.id).catch(() => null);
      }
    }
  }
  const myTenant = isRent && mine ? await fetchTenantProfile(mine.id).catch(() => null) : null;

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-text-primary">Ponuky ({offers.length})</h2>

      {offers.length === 0 ? (
        <p className="text-text-muted">Zatiaľ žiadna ponuka.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {offers.map((offer) => {
            const contact = contacts[offer.id];
            return (
              <div key={offer.id} className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-3">
                <div className="flex items-center justify-between gap-4">
                  <span className="flex items-center gap-2 text-text-secondary">
                    <Avatar name={offer.bidder?.nickname ?? "Záujemca"} uri={offer.bidder?.avatar_url} size={28} />
                    {offer.bidder?.nickname ?? "Záujemca"}
                  </span>
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

                {offer.status === "PENDING" && offer.valid_until ? (
                  <OfferCountdownPill status={offer.status} validUntil={offer.valid_until} />
                ) : null}

                {isOwner && offer.message ? <p className="text-sm italic text-text-secondary">„{offer.message}&quot;</p> : null}

                {isOwner && isRent ? (
                  <TenantProfileView profile={tenants[offer.id]} />
                ) : null}

                {isOwner && offer.status === "ACCEPTED" ? (
                  <div className="grid grid-cols-2 gap-2 rounded-lg bg-surface-pressed p-2 sm:grid-cols-3">
                    <ContactCell label="Meno" value={contact?.full_name} />
                    <ContactCell label="Telefón" value={contact?.phone} />
                    <ContactCell label="E-mail" value={contact?.email} />
                  </div>
                ) : null}

                {isOwner ? (
                  <details className="text-sm">
                    <summary className="cursor-pointer text-text-muted">{t("ownerOffers.progress")}</summary>
                    <div className="pt-2">
                      <OfferTimeline offer={offer} />
                    </div>
                  </details>
                ) : null}

                {isOwner ? (
                  <OwnerOfferActions
                    propertyId={property.id}
                    offerId={offer.id}
                    offerStatus={offer.status}
                    propertyActive={property.status === "ACTIVE"}
                    transaction={property.transaction_type}
                  />
                ) : null}
              </div>
            );
          })}
        </div>
      )}

      {isOwner ? null : userId ? (
        <div className="flex flex-col gap-2">
          {mine ? (
            <div className="rounded-2xl border border-border bg-surface p-4">
              <h3 className="mb-2 font-semibold text-text-primary">{t("ponukaForm.myOfferProgress")}</h3>
              <OfferTimeline offer={mine} />
            </div>
          ) : null}
          <OfferForm
            propertyId={property.id}
            transactionType={property.transaction_type}
            existing={mine ? { id: mine.id, amount: mine.amount, message: mine.message, valid_until: mine.valid_until } : null}
            existingTenant={myTenant}
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

function ContactCell({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-text-muted">{label}</span>
      <span className="text-sm font-medium text-text-primary">{value ?? "—"}</span>
    </div>
  );
}

/**
 * „O nájomcovi" — appka: `owner-offers.tsx`. Vidí len majiteľ (RLS
 * `tenant_select_parties`), preto sa toto renderuje LEN pre `isOwner`.
 */
function TenantProfileView({ profile }: { profile: TenantProfile | null | undefined }) {
  if (!profile) {
    return <p className="text-sm text-text-muted">{t("ownerOffers.noTenantForm")}</p>;
  }
  return (
    <div className="flex flex-col gap-2 rounded-lg bg-surface-pressed p-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">{t("ownerOffers.aboutTenant")}</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <ContactCell label={t("ownerOffers.peopleLabel")} value={profile.num_people != null ? String(profile.num_people) : null} />
        <ContactCell
          label={t("ownerOffers.petsLabel")}
          value={profile.has_pets ? profile.pet_details || "áno" : t("ownerOffers.noPets")}
        />
        {profile.lease_duration_months != null ? (
          <ContactCell label="Doba" value={t("ownerOffers.monthsAbbrev", { count: profile.lease_duration_months })} />
        ) : null}
        <ContactCell label={t("ownerOffers.employmentLabel")} value={profile.employment_status} />
        <ContactCell
          label={t("ownerOffers.incomeLabel")}
          value={profile.monthly_income_hint != null ? `${profile.monthly_income_hint} €` : null}
        />
      </div>
      {profile.note ? <p className="text-sm italic text-text-secondary">„{profile.note}&quot;</p> : null}
    </div>
  );
}
