import Link from "next/link";

import { getLocale } from "@/i18n/server";
import { localizeHref } from "@/i18n/href";

/**
 * Vlastná 404 namiesto holej Next.js predvolenej (biele pozadie, žiadne
 * značenie Offerra) — zistené pri kontrole (17.9.2026), inzeráty budú
 * časom mazané/predané, takže sem reálne niekto príde zo starého odkazu.
 * Odkaz späť do katalógu namiesto slepej uličky. (Priama trieda, nie
 * `Button` — ten renderuje `<button>`, vnorenie do `<a>` z `Link` by
 * bolo neplatné HTML.)
 */
export default async function NotFound() {
  const locale = await getLocale();
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <p className="font-money text-6xl font-bold text-accent">404</p>
      <h1 className="text-xl font-bold text-text-primary">Túto stránku sa nepodarilo nájsť</h1>
      <p className="text-text-secondary">
        Inzerát alebo stránka mohli medzičasom zmiznúť — napríklad ak sa nehnuteľnosť už predala.
      </p>
      <Link
        href={localizeHref(locale, "/")}
        className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary shadow-[var(--shadow-button)] hover:opacity-90"
      >
        Späť do katalógu
      </Link>
    </main>
  );
}
