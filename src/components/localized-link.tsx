"use client";

import Link, { type LinkProps } from "next/link";
import { usePathname } from "next/navigation";
import type { AnchorHTMLAttributes, ReactNode } from "react";

import { isLocale } from "@/i18n";
import { localizeHref } from "@/i18n/href";

/**
 * `<Link>` pre klientské komponenty — samo si zistí aktuálny jazyk z URL
 * (`usePathname()`, klientský hook, `next/headers` tu nie je dostupný) a
 * predponu doplní. `href` sa dáva VŽDY bez predpony (`/dopyty`, nie
 * `/en/dopyty`) — rovnaké volanie funguje v každom jazyku.
 */
export function LocalizedLink({
  href,
  children,
  ...props
}: { href: string; children: ReactNode } & Omit<LinkProps, "href"> & AnchorHTMLAttributes<HTMLAnchorElement>) {
  const pathname = usePathname();
  const maybeLocale = pathname.split("/")[1];
  const locale = isLocale(maybeLocale) && maybeLocale !== "sk" ? maybeLocale : "sk";

  return (
    <Link href={localizeHref(locale, href)} {...props}>
      {children}
    </Link>
  );
}
