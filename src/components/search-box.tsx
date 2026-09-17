"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { createT, isLocale } from "@/i18n";
import { localizeHref } from "@/i18n/href";

/**
 * Živé vyhľadávanie — appka: `SearchBar`, debounce 350ms, žiadne
 * tlačidlo „Hľadať" (Rastio, 17.9.2026: „v appke keď píšem mesto,
 * hneď vyhľadáva aj pri pár písmenách"). Web parsuje `?q=` na serveri
 * (`buildFilter`/`parseQuery` v `page.tsx`) — tu sa len mení URL, nie
 * duplicitný klientský rozbor textu.
 */
export function SearchBox({ initialValue }: { initialValue: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [text, setText] = useState(initialValue);
  const maybeLocale = pathname.split("/")[1];
  const locale = isLocale(maybeLocale) && maybeLocale !== "sk" ? maybeLocale : "sk";
  const t = createT(locale);

  useEffect(() => {
    const timer = setTimeout(() => {
      const next = new URLSearchParams(searchParams.toString());
      if (text.trim()) next.set("q", text);
      else next.delete("q");
      const qs = next.toString();
      // `replace`, nie `push` — inak by každé písmeno pridalo záznam
      // do histórie a tlačidlo Späť by museli klikať toľkokrát, koľko
      // znakov niekto napísal.
      router.replace(localizeHref(locale, qs ? `/?${qs}` : "/"));
    }, 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  return (
    <div className="relative w-full">
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t("searchBar.placeholderProperty")}
        aria-label={t("searchBar.placeholderProperty")}
        className="w-full rounded-xl border border-border-strong bg-surface py-2.5 pl-10 pr-4 text-text-primary placeholder:text-text-placeholder focus:border-accent-deep focus:outline-none"
      />
    </div>
  );
}
