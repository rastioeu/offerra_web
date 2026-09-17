import Link from "next/link";

import { getDemandLabel, getPropertyLabel } from "@/lib/labels";
import type { BuyerRequest } from "@/lib/offers";
import { formatBudget } from "@/lib/offers";
import { getLocale, getT } from "@/i18n/server";
import { localizeHref } from "@/i18n/href";

export async function DemandCard({ demand }: { demand: BuyerRequest }) {
  const [t, language] = await Promise.all([getT(), getLocale()]);
  const demandLabel = getDemandLabel(t)[demand.transaction_type];
  const typeLabel = demand.property_type
    ? getPropertyLabel(t)[demand.property_type as keyof ReturnType<typeof getPropertyLabel>]
    : t("dopytDetail.typeAny");
  const meta = [demand.city, typeLabel].filter(Boolean).join(" · ");

  return (
    <Link
      href={localizeHref(language, `/dopyt/${demand.id}`)}
      className="flex flex-col gap-1.5 rounded-2xl border border-border bg-surface p-4 hover:border-border-strong hover:shadow-lg"
    >
      <span className="w-fit rounded-full bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent-deep">
        {demandLabel}
      </span>
      <p className="line-clamp-2 text-text-primary">{demand.description}</p>
      {meta ? <p className="text-sm text-text-muted">{meta}</p> : null}
      <p className="font-money font-bold text-accent">{formatBudget(t, demand.budget_min, demand.budget_max)}</p>
    </Link>
  );
}
