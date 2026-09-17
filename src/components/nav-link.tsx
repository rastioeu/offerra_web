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
          ? "text-sm font-semibold text-text-primary"
          : "text-sm text-text-secondary hover:text-text-primary"
      }
    >
      {children}
    </Link>
  );
}
