import Link from "next/link";

import type { ActivityEvent, ActivityKind } from "@/lib/activity";
import { kindLabel } from "@/lib/activity";
import { localeTag } from "@/lib/property";
import type { Locale, TFunc } from "@/i18n";
import { localizeHref } from "@/i18n/href";

/**
 * Časová os aktivity — port appkovej `activity-timeline.tsx`. Zvislá os
 * s bodkou (appka: „vďaka nej sa to číta ako postupnosť, nie ako
 * zoznam"), udalosti zoskupené podľa dňa presne ako appka (Dnes/Včera/
 * dátum). Server Component — čisté zobrazenie, žiadny vlastný stav.
 */
function dayLabel(t: TFunc, language: string, iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (sameDay) return t("activityTimeline.today");
  if (d.toDateString() === yesterday.toDateString()) return t("activityTimeline.yesterday");
  return new Intl.DateTimeFormat(localeTag(language), { day: "numeric", month: "long" }).format(d);
}

export function ActivityTimeline({ events, t, language }: { events: ActivityEvent[]; t: TFunc; language: Locale }) {
  const KIND_LABEL: Record<ActivityKind, string> = kindLabel(t);

  if (events.length === 0) {
    return <p className="text-sm text-text-muted">{t("activityTimeline.empty")}</p>;
  }

  let lastDay = "";

  return (
    <div className="flex flex-col">
      {events.map((e, i) => {
        const day = dayLabel(t, language, e.at);
        const newDay = day !== lastDay;
        lastDay = day;
        const isLast = i === events.length - 1;

        return (
          <div key={`${e.kind}-${e.id}`}>
            {newDay ? (
              <p className="mb-1 mt-3 text-xs font-bold uppercase tracking-wide text-text-muted first:mt-0">{day}</p>
            ) : null}
            <Link href={localizeHref(language, e.href)} className="flex gap-3 hover:opacity-80">
              <div className="flex w-3 flex-col items-center">
                <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-secondary" />
                {!isLast ? <span className="my-0.5 w-0.5 flex-1 rounded-full bg-border" /> : null}
              </div>
              <div className="flex flex-col gap-0.5 pb-4">
                <span className="text-xs font-semibold text-link">{KIND_LABEL[e.kind]}</span>
                <span className="line-clamp-2 text-sm font-medium text-text-primary">{e.title}</span>
                {e.detail ? <span className="text-xs text-text-muted">{e.detail}</span> : null}
              </div>
            </Link>
          </div>
        );
      })}
    </div>
  );
}
