"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Odkaz v hornej navigácii, ktorý VIE, či je práve na ňom používateľ —
 * predtým mali odkazy len `hover:`, žiadny signál pre AKTUÁLNU stránku
 * (Rastio, 17.9.2026: „keď mám niečo hore stlačené [aktívne], nech je
 * to tiež tmavšie, žeby som videl"). Klientská komponenta (`usePathname`),
 * lebo `SiteHeader` je Server Component a Next App Router nedáva
 * aktuálnu cestu do serverovej hlavičky inak než cez segment stránky.
 *
 * DRUHÉ KOLO (Rastio, 17.9.2026, rovnaká požiadavka zopakovaná) — len
 * tmavší TEXT sa dal ľahko prehliadnuť, keď boli všetky odkazy vedľa
 * seba v jednom riadku. Aktívny odkaz má teraz NAVYŠE jemné pozadie
 * (`bg-surface-pressed`, rovnaký tón ako `hover:` na ostatných
 * odkazoch v appke/webe) — dvojitý signál (farba textu + pozadie), nie
 * len jeden, ľahko prehliadnuteľný.
 */
export function NavLink({ href, children }: { href: string; children: ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={
        active
          ? "rounded-lg bg-surface-pressed px-2.5 py-1 text-sm font-semibold text-text-primary"
          : "rounded-lg px-2.5 py-1 text-sm font-medium text-text-secondary hover:text-text-primary"
      }
    >
      {children}
    </Link>
  );
}
