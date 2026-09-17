import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { OfferCountdownPill } from "@/components/offer-countdown-pill";
import { fetchMyOffers } from "@/lib/my-offers";
import { formatAmount, getOfferStatusLabel } from "@/lib/offers";
import { formatDate } from "@/lib/property";
import { createClient } from "@/lib/supabase/server";
import { getLocale, getT, redirectLocalized } from "@/i18n/server";
import { loginRedirectPath, localizeHref } from "@/i18n/href";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("pridat.myOffersTitle") };
}

const STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-surface-pressed text-text-secondary",
  ACCEPTED: "bg-success/10 text-success",
  REJECTED: "bg-danger/10 text-danger",
  WITHDRAWN: "bg-surface-pressed text-text-muted",
  EXPIRED: "bg-surface-pressed text-text-muted",
};

export default async function MyOffersPage() {
  const [t, locale] = await Promise.all([getT(), getLocale()]);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return redirectLocalized(loginRedirectPath(locale, "/moje-ponuky"));

  const offers = await fetchMyOffers(user.id);
  const statusLabel = getOfferStatusLabel(t);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-text-primary">{t("pridat.myOffersTitle")}</h1>

      {offers.length === 0 ? (
        <p className="text-text-muted">{t("pridat.myOffersEmpty")}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {offers.map((offer) => {
            // Rovnaká meta skladačka ako appkový `SectionList` v profile:
            // mesto, kedy sa ponuka podala, „videná" pri čakajúcej ponuke
            // (jediné, čo sa medzi podaním a rozhodnutím zmení) — predtým
            // web ukazoval len sumu a typ obchodu, nič z toho, čo ponuku
            // reálne opisuje.
            const meta = [
              offer.property?.city,
              formatDate(locale, offer.created_at),
              offer.status === "PENDING" && offer.viewed_by_owner_at ? t("profil.seenByOwner") : null,
            ]
              .filter(Boolean)
              .join(" · ");

            return (
              <Link
                key={offer.id}
                href={localizeHref(locale, `/inzerat/${offer.property_id}`)}
                className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3 hover:border-border-strong sm:gap-4 sm:p-4"
              >
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-surface-pressed sm:h-20 sm:w-20">
                  {offer.property?.photo ? (
                    <Image src={offer.property.photo} alt="" fill sizes="80px" className="object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-text-muted">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                        <path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V9.5Z" />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate font-semibold text-text-primary">
                    {offer.property?.title || t("profil.listingFallback")}
                  </span>
                  {meta ? <span className="text-sm text-text-muted">{meta}</span> : null}
                  <OfferCountdownPill status={offer.status} validUntil={offer.valid_until} language={locale} />
                </div>

                <div className="flex shrink-0 flex-col items-end gap-1">
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
            );
          })}
        </div>
      )}
    </main>
  );
}
