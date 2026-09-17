/**
 * Časová os aktivity — SERVER-SIDE zostavenie appkového `timeline` z
 * appkovej `profil.tsx` (appka: udalosti zo 4 zdrojov zlúčené a
 * zoradené podľa času, aby z plochých zoznamov vznikol príbeh). Presne
 * appkové 4 zdroje, v rovnakom poradí — appka má v type aj
 * `PONUKA_PRIJATA`, ale do zoznamu ho NEPRIDÁVA (zmerané priamo v
 * appkovom kóde, nie odvodené), preto ani web.
 */
import { fetchMyOutreach } from "@/lib/demand-data";
import { fetchMyOffers, fetchMyRequests } from "@/lib/my-offers";
import { fetchMyProperties } from "@/lib/my-properties";
import { formatAmount, formatBudget } from "@/lib/offers";
import { getStatusLabel } from "@/lib/property";
import type { TFunc } from "@/i18n";

export type ActivityKind = "INZERAT" | "PONUKA_ODOSLANA" | "DOPYT" | "OSLOVENIE_DOPYTU";

export type ActivityEvent = {
  id: string;
  at: string;
  kind: ActivityKind;
  title: string;
  detail: string;
  href: string;
};

export function kindLabel(t: TFunc): Record<ActivityKind, string> {
  return {
    INZERAT: t("activityTimeline.kindListing"),
    PONUKA_ODOSLANA: t("activityTimeline.kindOfferSent"),
    DOPYT: t("activityTimeline.kindDemand"),
    OSLOVENIE_DOPYTU: t("activityTimeline.kindOutreach"),
  };
}

export async function fetchActivityEvents(t: TFunc, userId: string): Promise<ActivityEvent[]> {
  const [properties, offers, myOutreach, requests] = await Promise.all([
    fetchMyProperties(userId),
    fetchMyOffers(userId),
    fetchMyOutreach(),
    fetchMyRequests(userId),
  ]);

  const statusLabel = getStatusLabel(t);

  const listingEvents: ActivityEvent[] = properties.map((p) => ({
    id: p.id,
    at: p.created_at,
    kind: "INZERAT",
    title: p.title || t("pridat.noTitle"),
    detail: [p.city, statusLabel[p.status]].filter(Boolean).join(" · "),
    href: `/inzerat/${p.id}`,
  }));

  const offerEvents: ActivityEvent[] = offers.map((o) => ({
    id: o.id,
    at: o.created_at,
    kind: "PONUKA_ODOSLANA",
    title: o.property?.title || t("profil.listingFallback"),
    detail: formatAmount(t, o.amount, o.property?.transaction_type ?? "SALE"),
    href: `/inzerat/${o.property_id}`,
  }));

  // Oslovenia MOJICH dopytov — vedú na PONÚKNUTÝ inzerát, nie na môj
  // dopyt (appka: tam sa dá niečo spraviť — pozrieť si ho, vypýtať obhliadku).
  const outreachEvents: ActivityEvent[] = myOutreach.map((o) => ({
    id: o.id,
    at: o.created_at,
    kind: "OSLOVENIE_DOPYTU",
    title: o.property_title || t("profil.listingFallback"),
    detail: [o.from_nickname, o.property_city].filter(Boolean).join(" · "),
    href: `/inzerat/${o.property_id}`,
  }));

  const demandEvents: ActivityEvent[] = requests.map((r) => ({
    id: r.id,
    at: r.created_at,
    kind: "DOPYT",
    title: r.description?.slice(0, 60) || t("profil.demandFallback"),
    detail: formatBudget(t, r.budget_min, r.budget_max) ?? "",
    href: `/dopyt/${r.id}`,
  }));

  return [...listingEvents, ...offerEvents, ...outreachEvents, ...demandEvents].sort((a, b) =>
    a.at < b.at ? 1 : -1
  );
}
