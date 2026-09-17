import type { Metadata } from "next";

import { getHowLead, getHowSections } from "@/lib/how-it-works";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("nastavenia.howItWorks"), description: getHowLead(t) };
}

/**
 * „Ako funguje Offerra" — port appkovej `ako-funguje.tsx`, plná verzia.
 * Dostupná z hlavnej obrazovky aj z Nastavení (appka to má rovnako).
 */
export default async function AkoToFungujePage() {
  const t = await getT();
  const lead = getHowLead(t);
  const sections = getHowSections(t);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-text-primary">{t("nastavenia.howItWorks")}</h1>
      <p className="text-lg font-medium text-text-primary">{lead}</p>

      <div className="flex flex-col gap-4">
        {sections.map((s, i) => (
          <section key={s.title} className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-4">
            <h2 className="text-base font-semibold text-text-primary">
              {i + 1}. {s.title}
            </h2>
            {s.paragraphs.map((para, j) => (
              <p key={j} className="text-text-secondary">
                {para}
              </p>
            ))}
          </section>
        ))}
      </div>
    </main>
  );
}
