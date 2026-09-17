import type { Metadata } from "next";

import { CHANGELOG } from "@/lib/changelog";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("novinky.screenTitle") };
}

/**
 * „Čo je nové" — port appkovej `novinky.tsx`, dostupné z Nastavení.
 * Obsah je zámerne len po slovensky (`CHANGELOG` — pozri komentár tam
 * prečo), okolitý text (nadpis, úvod) preložený je.
 */
export default async function NovinkyPage() {
  const t = await getT();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-text-primary">{t("novinky.screenTitle")}</h1>
        <p className="text-sm text-text-muted">{t("novinky.leadWeb")}</p>
      </div>

      <div className="flex flex-col gap-4">
        {CHANGELOG.map((entry, i) => (
          <section key={`${entry.date}-${entry.title}`} className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-4">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-semibold text-text-primary">{entry.title}</h2>
              {i === 0 ? (
                <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-accent-deep">
                  {t("novinky.newest")}
                </span>
              ) : null}
            </div>
            <p className="text-xs text-text-muted">{entry.date}</p>
            <ul className="flex list-disc flex-col gap-1 pl-5">
              {entry.items.map((item) => (
                <li key={item} className="text-sm text-text-secondary">
                  {item}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
