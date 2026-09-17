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
    <input
      type="text"
      value={text}
      onChange={(e) => setText(e.target.value)}
      placeholder={t("searchBar.placeholderProperty")}
      className="w-full rounded-xl border border-border-strong bg-surface px-4 py-2.5 text-text-primary placeholder:text-text-placeholder focus:border-accent-deep focus:outline-none"
    />
  );
}
