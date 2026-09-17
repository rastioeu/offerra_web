import { RatingCard } from "@/components/rating-card";
import { Reviews } from "@/components/reviews";
import type { PropertyDetail } from "@/lib/detail";
import { fetchOffers } from "@/lib/property-offers";
import { canRate, fetchMyAndReceivedRating, fetchRatings } from "@/lib/rating-data";
import { getLocale, getT } from "@/i18n/server";

/**
 * Hodnotenia na detaile inzerátu — prenesené z appky (`RatingsTab`).
 * Vlastník hodnotí víťaza ponuky, víťaz hodnotí vlastníka — len po
 * uzavretí obchodu (appka: `can_rate()` v DB rozhoduje, nie appka sama).
 * Verejná povesť predávajúceho (`Reviews`) sa ukazuje VŽDY, nezávisle od
 * stavu inzerátu — je to jeho povesť naprieč všetkými obchodmi.
 */
export async function RatingsSection({ property, userId }: { property: PropertyDetail; userId: string | null }) {
  const t = await getT();
  if (!userId) {
    return (
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-text-primary">Hodnotenia</h2>
        <p className="text-sm text-text-muted">
          <a href="/login" className="text-link hover:underline">
            Prihlás sa
          </a>{" "}
          na zobrazenie hodnotení.
        </p>
      </section>
    );
  }

  const isOwner = userId === property.owner_id;
  const nickname = property.owner?.nickname ?? t("propertyTabs.sellerFallback");
  const ratings = await fetchRatings([property.owner_id]);

  let winnerBidderId: string | undefined;
  if (property.status === "CLOSED" && property.closed_offer_id) {
    const offers = await fetchOffers(property.id);
    winnerBidderId = offers.find((o) => o.id === property.closed_offer_id)?.bidder_id;
  }

  const rateeId = isOwner ? winnerBidderId : property.owner_id;

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-text-primary">Hodnotenia</h2>

      {property.status === "CLOSED" && rateeId ? (
        <RatingCardLoader
          propertyId={property.id}
          rateeId={rateeId}
          rateeNickname={isOwner ? t("propertyTabs.theBidder") : nickname}
          userId={userId}
        />
      ) : null}

      <Reviews userId={property.owner_id} nickname={nickname} summary={ratings[property.owner_id]} />

      <p className="text-sm text-text-muted">
        {isOwner ? t("propertyTabs.ratingsOwnerNote") : t("propertyTabs.ratingsBidderNote", { nickname })}
      </p>
      {property.status !== "CLOSED" ? (
        <p className="text-sm text-text-muted">{t("propertyTabs.ratingsNotYetNote")}</p>
      ) : null}
    </section>
  );
}

async function RatingCardLoader({
  propertyId,
  rateeId,
  rateeNickname,
  userId,
}: {
  propertyId: string;
  rateeId: string;
  rateeNickname: string;
  userId: string;
}) {
  const [allowed, { mine, received }, language] = await Promise.all([
    canRate(propertyId, rateeId),
    fetchMyAndReceivedRating(propertyId, userId),
    getLocale(),
  ]);

  return (
    <RatingCard
      propertyId={propertyId}
      rateeId={rateeId}
      rateeNickname={rateeNickname}
      allowed={allowed}
      mine={mine}
      received={received}
      language={language}
    />
  );
}
