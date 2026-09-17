"use client";

import Link from "next/link";
import { useState } from "react";

/**
 * Hamburger menu pre mobil — Rastio (17.9.2026): „horné menu je
 * namačknuté, keď testujem na mobile." Desktop ukazuje odkazy v rade
 * (`SiteHeader`, `hidden md:flex`), toto je len mobilná náhrada
 * (`md:hidden`) za ten istý zoznam odkazov.
 */
export function MobileNav({ links }: { links: { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Zavrieť menu" : "Otvoriť menu"}
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-border-strong text-text-primary"
      >
        {open ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        )}
      </button>

      {open ? (
        <div className="absolute right-0 top-11 z-20 flex w-56 flex-col gap-1 rounded-2xl border border-border bg-surface p-2 shadow-[var(--shadow-card)]">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-2 text-sm text-text-secondary hover:bg-surface-pressed hover:text-text-primary"
            >
              {link.label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
