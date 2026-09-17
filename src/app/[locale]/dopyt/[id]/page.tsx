import type { Metadata } from "next";
import { notFound } from "next/navigation";

import Link from "next/link";

import { DemandMessages } from "@/components/demand-messages";
import { OutreachPicker } from "@/components/outreach-picker";
import { fetchDemand, fetchMyOutreach, fetchOutreach } from "@/lib/demand-data";
import { getDemandLabel, getPropertyLabel } from "@/lib/labels";
import { formatBudget } from "@/lib/offers";
import { fetchMyProperties } from "@/lib/my-properties";
import { formatArea, formatDate, formatPrice, formatRooms, type PropertyType } from "@/lib/property";
import { createClient } from "@/lib/supabase/server";
import { getLocale, getT } from "@/i18n/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const demand = await fetchDemand(id);
  if (!demand) return { title: "Dopyt nenájdený" };

  const t = await getT();
  const demandLabel = getDemandLabel(t)[demand.transaction_type];
  const typeLabel = demand.property_type
    ? getPropertyLabel(t)[demand.property_type as PropertyType]
    : t("dopytDetail.typeAny");
  const budget = formatBudget(t, demand.budget_min, demand.budget_max);
  const title = [typeLabel, demandLabel, demand.city].filter(Boolean).join(" — ") || t("dopytDetail.screenTitle");
  const description = [demand.city, budget, demand.description?.slice(0, 140)].filter(Boolean).join(" · ");
  const url = `https://app.offerra.sk/dopyt/${demand.id}`;

  return {
    title,
    description: description || undefined,
    alternates: { canonical: url },
    openGraph: { type: "website", url, title, description, images: ["/og-image.png"] },
    twitter: { card: "summary_large_image", title, description, images: ["/og-image.png"] },
  };
}

/**
 * Detail dopytu + oslovenie — appka: `dopyt/[id].tsx`. Verejný (RLS
 * pustí ACTIVE anon kľúču), oslovenie a chat vyžadujú prihlásenie.
 */
export default async function DemandDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const demand = await fetchDemand(id);
  if (!demand) notFound();

  const [supabase, t, language] = await Promise.all([createClient(), getT(), getLocale()]);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const demandLabel = getDemandLabel(t)[demand.transaction_type];
  const typeLabel = demand.property_type
    ? getPropertyLabel(t)[demand.property_type as PropertyType]
    : t("dopytDetail.typeAny");
  const location = [demand.city, demand.district, demand.region].filter(Boolean).join(" · ") || t("dopytDetail.emptyDash");
  const roomsText = demand.rooms_min != null ? t("dopytDetail.roomsAtLeast", { count: demand.rooms_min }) : t("dopytDetail.emptyDash");
  const areaText = demand.area_min != null ? t("dopytDetail.areaAtLeast", { area: formatArea(demand.area_min) ?? "" }) : t("dopytDetail.emptyDash");

  const isMine = user?.id === demand.user_id;

  // `anon` nemá na `request_outreach` grant vôbec (appka: viditeľné len
  // stranám dopytu) — bez `user` by dotaz padol na 42501, nie na prázdny
  // výsledok. Preto sa volá LEN pre prihláseného.
  let myActiveProperties: { id: string; title: string; city: string | null; transaction_type: "SALE" | "RENT"; asking_price_hint: number | null }[] = [];
  let alreadySent = new Set<string>();
  if (user && !isMine) {
    const [mine, outreach] = await Promise.all([fetchMyProperties(user.id), fetchOutreach(demand.id)]);
    myActiveProperties = mine.filter((p) => p.status === "ACTIVE");
    alreadySent = new Set(outreach.filter((o) => o.from_id === user.id).map((o) => o.property_id));
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap gap-2">
        <span className="w-fit rounded-full bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent-deep">
          {demandLabel}
        </span>
        {demand.property_type ? (
          <span className="w-fit rounded-full bg-surface-pressed px-2.5 py-1 text-xs font-semibold text-text-secondary">
            {typeLabel}
          </span>
        ) : null}
      </div>

      <p className="font-money text-3xl font-bold text-primary">{formatBudget(t, demand.budget_min, demand.budget_max)}</p>
      <p className="text-sm text-text-muted">
        {t("dopytDetail.seekingBy", {
          nickname: demand.author?.nickname ?? t("dopytDetail.unknownAuthor"),
          date: formatDate(language, demand.created_at),
        })}
      </p>

      <section className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">{t("dopytDetail.whatSeekingSection")}</h2>
        <Row label={t("dopytDetail.locationLabel")} value={location} />
        <Row label={t("dopytDetail.typeLabel")} value={typeLabel} />
        <Row label={t("dopytDetail.roomsRowLabel")} value={roomsText} />
        <Row label={t("dopytDetail.areaRowLabel")} value={areaText} />
      </section>

      {demand.description ? (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">{t("dopytDetail.descriptionSection")}</h2>
          <p className="whitespace-pre-wrap text-text-primary">{demand.description}</p>
        </section>
      ) : null}

      <DemandMessages demand={demand} userId={user?.id ?? null} />

      {isMine ? <MyOutreachList requestId={demand.id} transaction={demand.transaction_type} /> : null}

      {user && !isMine ? (
        <>
          <OutreachPicker requestId={demand.id} myProperties={myActiveProperties} alreadySent={alreadySent} language={language} />
          {alreadySent.size > 0 ? (
            <p className="text-sm text-text-muted">{t("dopytDetail.alreadyOutreached", { count: alreadySent.size })}</p>
          ) : null}
        </>
      ) : null}
    </main>
  );
}

/** Kto ma oslovil svojím inzerátom — appka: `outreachSection`/`mine` zoznam v `dopyt/[id].tsx`. */
async function MyOutreachList({ requestId, transaction }: { requestId: string; transaction: "SALE" | "RENT" }) {
  const [mine, t, language] = await Promise.all([fetchMyOutreach(requestId), getT(), getLocale()]);

  return (
    <section className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
        {t("dopytDetail.outreachSection", { count: mine.length })}
      </h2>
      {mine.length === 0 ? (
        <p className="text-text-muted">{t("dopytDetail.outreachEmpty")}</p>
      ) : (
        <>
          <p className="text-xs text-text-muted">{t("dopytDetail.outreachHint")}</p>
          {mine.map((o) => {
            const openable = o.property_status === "ACTIVE" || o.property_status === "CLOSED";
            const facts = [o.property_city, formatRooms(t, language, o.property_rooms), formatArea(o.property_area)].filter(
              Boolean
            );
            const price =
              formatPrice(t, o.property_price, transaction) ??
              (o.property_top_offer != null
                ? t("dopytDetail.topOfferPrice", { price: formatPrice(t, o.property_top_offer, transaction) ?? "" })
                : t("dopytDetail.priceNotGiven"));
            const row = (
              <div className="flex flex-col gap-1 rounded-xl border border-border p-3">
                <span className="font-semibold text-text-primary">{o.property_title || t("dopytDetail.noTitle")}</span>
                <span className="font-money font-bold text-primary">{price}</span>
                {facts.length > 0 ? <span className="text-sm text-text-secondary">{facts.join(" · ")}</span> : null}
                {o.message ? <span className="text-sm text-text-primary">{o.message}</span> : null}
                <span className="text-xs text-text-muted">
                  {t("dopytDetail.authorMeta", {
                    nickname: o.from_nickname ?? t("dopytDetail.unknownNickname"),
                    date: formatDate(language, o.created_at),
                  })}
                  {openable ? "" : t("dopytDetail.propertyGone")}
                </span>
              </div>
            );
            return openable ? (
              <Link key={o.id} href={`/inzerat/${o.property_id}`}>
                {row}
              </Link>
            ) : (
              <div key={o.id} className="opacity-60">
                {row}
              </div>
            );
          })}
        </>
      )}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-text-muted">{label}</span>
      <span className="text-right font-medium text-text-primary">{value}</span>
    </div>
  );
}
