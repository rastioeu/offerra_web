import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

import { DeadlineBadge } from "@/components/deadline-badge";
import { MessagesSection } from "@/components/messages-section";
import { MortgageCalculatorCard } from "@/components/mortgage-calculator";
import { OffersSection } from "@/components/offers-section";
import { PhotoGallery } from "@/components/photo-gallery";
import { RatingsSection } from "@/components/ratings-section";
import { ViewingSection } from "@/components/viewing-section";
import { fetchProperty } from "@/lib/detail";
import { getPropertyLabel, getTransactionLabel } from "@/lib/labels";
import { buildingRows, formatArea, formatPrice, formatRooms, rentalRows } from "@/lib/property";
import { fetchOffers } from "@/lib/property-offers";
import { createClient } from "@/lib/supabase/server";
import { t, language } from "@/i18n";

/**
 * SEO je hlavný dôvod projektu — každý inzerát je vlastná, indexovateľná
 * URL s dynamickým title/description, nie klientská modálna obrazovka.
 * `params` je Promise (Next.js 16, viď CLAUDE.md tohto projektu).
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const property = await fetchProperty(id);
  if (!property) return { title: "Inzerát nenájdený" };

  const price = formatPrice(t, property.asking_price_hint, property.transaction_type);
  const typeLabel = getPropertyLabel(t)[property.property_type];
  const transactionLabel = getTransactionLabel(t)[property.transaction_type];
  const title = property.title || `${typeLabel} — ${transactionLabel}`;
  const description = [property.city, price, property.description?.slice(0, 140)]
    .filter(Boolean)
    .join(" · ");

  const url = `https://app.offerra.sk/inzerat/${property.id}`;
  const images = property.media.map((m) => m.url);

  return {
    title,
    description: description || undefined,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title,
      description,
      images: images.length > 0 ? images : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: images.length > 0 ? [images[0]] : undefined,
    },
  };
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const property = await fetchProperty(id);
  if (!property) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const topOffer =
    property.transaction_type === "SALE"
      ? (await fetchOffers(property.id))
          .filter((o) => o.status === "PENDING")
          .reduce<number | null>((max, o) => (max == null || o.amount > max ? o.amount : max), null)
      : null;

  const transactionLabel = getTransactionLabel(t)[property.transaction_type];
  const typeLabel = getPropertyLabel(t)[property.property_type];
  const price = formatPrice(t, property.asking_price_hint, property.transaction_type);
  const rooms = formatRooms(t, language, property.rooms);
  const area = formatArea(property.area_m2);
  const meta = [property.city, property.district, rooms, area].filter(Boolean).join(" · ");
  const rows = [...buildingRows(t, language, property), ...rentalRows(t, language, property)];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.title,
    description: property.description ?? undefined,
    url: `https://app.offerra.sk/inzerat/${property.id}`,
    image: property.media.map((m) => m.url),
    datePosted: property.created_at,
    address: property.city
      ? {
          "@type": "PostalAddress",
          addressLocality: property.city,
          addressRegion: property.district ?? undefined,
          addressCountry: "SK",
        }
      : undefined,
    geo:
      property.latitude != null && property.longitude != null
        ? { "@type": "GeoCoordinates", latitude: property.latitude, longitude: property.longitude }
        : undefined,
    numberOfRooms: property.rooms ?? undefined,
    floorSize: property.area_m2 != null ? { "@type": "QuantitativeValue", value: property.area_m2, unitCode: "MTK" } : undefined,
    offers: property.asking_price_hint
      ? {
          "@type": "Offer",
          price: property.asking_price_hint,
          priceCurrency: "EUR",
          availability: property.status === "ACTIVE" ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
        }
      : undefined,
  };

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      {/* `<` únik: titulok/popis idú z DB (používateľský vstup) — bez toho
          by "</script>" v texte inzerátu vedel predčasne ukončiť tag. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <Link href="/" className="text-sm text-link hover:underline">
        ← Späť do katalógu
      </Link>

      {/* Desktop: galéria + popis vľavo, cena/ponuky/obhliadka vpravo (sticky) —
          klasický dvojstĺpcový realitný layout, nie appka natiahnutá na šírku. */}
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <PhotoGallery media={property.media} title={property.title} />

          <div className="flex flex-col gap-2">
            <span className="w-fit rounded-full bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent-deep">
              {transactionLabel} · {typeLabel}
            </span>
            <h1 className="text-2xl font-bold text-text-primary">{property.title}</h1>
            {meta ? <p className="text-text-secondary">{meta}</p> : null}
          </div>

          {property.description ? (
            <section className="flex flex-col gap-2">
              <h2 className="text-lg font-semibold text-text-primary">Popis</h2>
              <p className="whitespace-pre-wrap text-text-secondary">{property.description}</p>
            </section>
          ) : null}

          {rows.length > 0 ? (
            <section className="flex flex-col gap-2">
              <h2 className="text-lg font-semibold text-text-primary">Podrobnosti</h2>
              <dl className="grid grid-cols-1 gap-x-6 gap-y-2 rounded-2xl border border-border bg-surface p-4 sm:grid-cols-2">
                {rows.map((row) => (
                  <div key={row.label} className="flex justify-between gap-4 border-b border-border py-1.5 last:border-0 sm:border-0">
                    <dt className="text-text-muted">{row.label}</dt>
                    <dd className="font-medium text-text-primary">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}

          {property.owner?.nickname ? (
            <p className="text-sm text-text-muted">Inzerent: {property.owner.nickname}</p>
          ) : null}

          <RatingsSection property={property} userId={user?.id ?? null} />
          <MessagesSection property={property} userId={user?.id ?? null} />
        </div>

        <div className="flex flex-col gap-5 lg:sticky lg:top-6 lg:w-[380px] lg:shrink-0">
          <div className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-card)]">
            {price ? (
              <p className="font-money text-[27px] font-bold leading-[30px] text-accent">{price}</p>
            ) : (
              <p className="text-text-muted">Cena na dohodu</p>
            )}
            <DeadlineBadge iso={property.offer_deadline} />
          </div>

          <OffersSection property={property} userId={user?.id ?? null} />
          <ViewingSection property={property} userId={user?.id ?? null} />

          {property.transaction_type === "SALE" ? (
            <MortgageCalculatorCard price={property.asking_price_hint} topOffer={topOffer} />
          ) : null}
        </div>
      </div>
    </main>
  );
}
