import Link from "next/link";

import type { Locale } from "@/i18n";
import { localizeHref } from "@/i18n/href";
import { getHowLead } from "@/lib/how-it-works";
import { getT } from "@/i18n/server";

/**
 * Krátka karta „Ako funguje Offerra" — port appkovej `how-it-works-card.tsx`.
 * Appka má zatváranie uložené v profile (appka: nedôveruje appkovému
 * stavu pre trvalé rozhodnutia) — web zatiaľ nemá kam takú preferenciu
 * uložiť z tejto karty, preto je BEZ zatvárania (appkové `onDismiss` je
 * nepovinné aj v appke — na hlavnej appkovej obrazovke sa nepoužíva vždy).
 */
export async function HowItWorksCard({ locale }: { locale: Locale }) {
  const t = await getT();
  const lead = getHowLead(t);

  return (
    <Link
      href={localizeHref(locale, "/ako-to-funguje")}
      className="flex flex-col gap-1.5 rounded-2xl border border-accent bg-surface p-4 shadow-[var(--shadow-card)] transition-opacity hover:opacity-90"
    >
      <span className="font-bold text-text-primary">{t("nastavenia.howItWorks")}</span>
      <p className="text-text-secondary">{lead}</p>
      <span className="mt-0.5 text-xs font-bold text-accent-deep">{t("howItWorks.readMore")}</span>
    </Link>
  );
}
