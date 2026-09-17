"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Ikonový odkaz v hornej lište — pre Obľúbené/Nastavenia/Ako funguje
 * (Rastio, 17.9.2026: „daj tam iba nejakú ikonu... to každý pozná" —
 * srdiečko/ozubené koliesko/otáznik sú univerzálne rozpoznateľné,
 * netreba pri nich text, presne ako pri zvončeku, ktorý ikonu-bez-textu
 * mal už predtým). Rovnaký vzhľad ako `NotificationBell`
 * (`h-9 w-9 rounded-full`), rovnaká aktívna logika ako `NavLink`
 * (`usePathname`, tmavšie pozadie na stránke, kde používateľ práve je).
 */
export function IconNavLink({ href, label, children }: { href: string; label: string; children: ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      aria-current={active ? "page" : undefined}
      className={`flex h-9 w-9 items-center justify-center rounded-full ${
        active
          ? "bg-surface-pressed text-text-primary"
          : "text-text-secondary hover:bg-surface-pressed hover:text-text-primary"
      }`}
    >
      {children}
    </Link>
  );
}
