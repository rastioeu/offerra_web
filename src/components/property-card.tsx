import Image from "next/image";
import Link from "next/link";

import { DeadlineBadge } from "@/components/deadline-badge";
import { FavoriteHeart } from "@/components/favorite-heart";
import { OfferCountdownPill } from "@/components/offer-countdown-pill";
import { getPropertyLabel, getTransactionLabel } from "@/lib/labels";
import { formatAmount } from "@/lib/offers";
import { offerCountLabel, priceDisplay } from "@/lib/price-display";
import { formatArea, formatPrice, formatRooms, type PropertyWithMedia } from "@/lib/property";
import { getLocale, getT } from "@/i18n/server";
import { localizeHref } from "@/i18n/href";

/**
 * Katalógová karta — desktop rozloženie (foto hore, obsah dole v
 * paddingu), nie zmenšená mobilná karta. Farby výhradne z paletových
 * tried v `globals.css` (`bg-surface`, `text-text-primary`, ...).
 *
 * CENA (Rastio, 17.9.2026): predtým jedno číslo — orientačná cena alebo
 * „Cena na dohodu", vyzeralo to ako bežný realitný portál s pevnou cenou.
 * Hlavné číslo je teraz NAJVYŠŠIA PONUKA, keď nejaká je (`priceDisplay`,
 * port appkového `property-card.tsx`) — akcentovou farbou, orientačná
 * cena vedľa menšia a sivá. Skutočná ponuka je dôležitejšia než želanie
 * predávajúceho, presne ako v appke.
 */
export async function PropertyCard({ property }: { property: PropertyWithMedia }) {
  const [t, language] = await Promise.all([getT(), getLocale()]);
  const photo = property.media[0]?.url;
  const transactionLabel = getTransactionLabel(t)[property.transaction_type];
  const typeLabel = getPropertyLabel(t)[property.property_type];
  const rooms = formatRooms(t, language, property.rooms);
  const area = formatArea(property.area_m2);
  const meta = [property.city, rooms, area].filter(Boolean).join(" · ");

  const pd = priceDisplay(t, property.asking_price_hint, property.top_offer ?? null, property.offer_count ?? 0);
  const isOffer = pd.headline === "TOP_OFFER" && pd.topOffer != null;
  const headlineLabel = isOffer ? t("propertyCard.topOffer") : t("propertyCard.askingPrice");
  const headlineValue = isOffer
    ? formatAmount(t, pd.topOffer as number, property.transaction_type)
    : formatPrice(t, pd.asking, property.transaction_type);
  const asideLines = isOffer
    ? pd.asking != null
      ? [t("priceDisplay.indicative"), formatPrice(t, pd.asking, property.transaction_type) as string]
      : [t("propertyCard.priceNotGiven1"), t("propertyCard.priceNotGiven2")]
    : [
        offerCountLabel(t, language, pd.offerCount) ?? t("propertyCard.noOffersYet1"),
        offerCountLabel(t, language, pd.offerCount) ? "" : t("propertyCard.noOffersYet2"),
      ].filter(Boolean);

  return (
    <Link
      href={localizeHref(language, `/inzerat/${property.id}`)}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-[var(--shadow-card)] transition-transform duration-200 hover:-translate-y-0.5"
    >
      <div className="relative aspect-[4/3] w-full bg-surface-pressed">
        {photo ? (
          <Image
            src={photo}
            alt={property.title}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-text-muted">
            {t("propertyDetail.noPhoto")}
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-[10px] bg-primary px-2 py-[3px] text-xs font-semibold tracking-wide text-on-primary">
          {transactionLabel}
        </span>
        <div className="absolute right-3 top-3">
          <FavoriteHeart propertyId={property.id} />
        </div>
        {/* Uzávierka inzerátu a platnosť najvyššej ponuky — DVE ROZDIELNE
            veci (termín na podanie ponúk vs. platnosť KONKRÉTNEJ ponuky),
            ale JEDEN dizajn systém (Rastio, 17.9.2026: predtým tmavý pruh
            na fotke vs. oranžová pilulka pod fotkou, „musia vyzerať ako
            súčasť jedného dizajn systému"). Obe teraz rovnaká pilulka na
            fotke, stohované v tom istom rohu — líši sa len farba textu
            (`DeadlineBadge`/`OfferCountdownPill` `onPhoto`). */}
        <div className="absolute bottom-3 left-3 flex flex-col items-start gap-1">
          <DeadlineBadge iso={property.offer_deadline} language={language} onPhoto />
          {isOffer && property.top_offer_valid_until ? (
            <OfferCountdownPill status="PENDING" validUntil={property.top_offer_valid_until} language={language} onPhoto />
          ) : null}
        </div>
        {property.media.length > 1 ? (
          <span className="absolute bottom-3 right-3 rounded-full bg-on-photo-surface px-2.5 py-[3px] text-xs font-semibold text-text-secondary">
            1/{property.media.length}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h2 className="line-clamp-1 text-base font-semibold text-text-primary">
          {property.title || typeLabel}
        </h2>
        {meta ? <p className="text-sm text-text-muted">{meta}</p> : null}

        <div className="mt-1 flex items-end justify-between gap-2">
          <div className="flex min-w-0 flex-col gap-0.5">
            {headlineValue ? (
              <>
                <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">{headlineLabel}</p>
                <p className={`font-money text-[22px] font-bold leading-[25px] ${isOffer ? "text-accent" : "text-primary"}`}>
                  {headlineValue}
                </p>
              </>
            ) : (
              <p className="text-sm text-text-muted">{pd.note}</p>
            )}
          </div>
          {headlineValue && asideLines.length > 0 ? (
            <div className="flex shrink-0 flex-col items-end text-right">
              {asideLines.map((line) => (
                <p key={line} className="text-xs text-text-muted">
                  {line}
                </p>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
