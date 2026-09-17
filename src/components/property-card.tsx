import Image from "next/image";
import Link from "next/link";

import { DeadlineBadge } from "@/components/deadline-badge";
import { getPropertyLabel, getTransactionLabel } from "@/lib/labels";
import { formatArea, formatPrice, formatRooms, type PropertyWithMedia } from "@/lib/property";
import { getLocale, getT } from "@/i18n/server";
import { localizeHref } from "@/i18n/href";

/**
 * Katalógová karta — desktop rozloženie (foto hore, obsah dole v
 * paddingu), nie zmenšená mobilná karta. Farby výhradne z paletových
 * tried v `globals.css` (`bg-surface`, `text-text-primary`, ...).
 */
export async function PropertyCard({ property }: { property: PropertyWithMedia }) {
  const [t, language] = await Promise.all([getT(), getLocale()]);
  const photo = property.media[0]?.url;
  const transactionLabel = getTransactionLabel(t)[property.transaction_type];
  const typeLabel = getPropertyLabel(t)[property.property_type];
  const price = formatPrice(t, property.asking_price_hint, property.transaction_type);
  const rooms = formatRooms(t, language, property.rooms);
  const area = formatArea(property.area_m2);
  const meta = [property.city, rooms, area].filter(Boolean).join(" · ");

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
            Bez fotky
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-[10px] bg-primary px-2 py-[3px] text-xs font-semibold tracking-wide text-on-primary">
          {transactionLabel}
        </span>
        <div className="absolute bottom-3 left-3">
          <DeadlineBadge iso={property.offer_deadline} language={language} onPhoto />
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
        {price ? (
          <p className="mt-1 font-money text-[22px] font-bold leading-[25px] text-accent">{price}</p>
        ) : (
          <p className="mt-1 text-sm text-text-muted">Cena na dohodu</p>
        )}
      </div>
    </Link>
  );
}
