import type { ButtonHTMLAttributes } from "react";

/**
 * Jediný zdroj pravdy pre tlačidlá — predtým každé tlačidlo v appke
 * (weba) kopírovalo tie isté Tailwind triedy zvlášť na ~15 miestach,
 * čo z nich robilo ľahko rozíditeľné (appkové pravidlo CLAUDE.md §5 —
 * „žiadna komponenta nesmie mať vlastnú hardcodovanú farbu" — rozšírené
 * aj na tlačidlá). `primary` má appkový `Shadow.button` (farebný tieň
 * v terakotovej, nie generický sivý).
 */
type Variant = "primary" | "secondary" | "danger";

/**
 * Len farba/tieň/rádius/disabled — NIE padding/veľkosť textu. Volajúci
 * si veľkosť (`px-5 py-2.5`, `text-sm`, `w-fit`...) dá do `className`,
 * lebo sa medzi miestami v appke líši a zjednotenie by ticho zmenilo
 * rozmery tlačidiel, ktoré nevidím (žiadny prehliadač v tomto prostredí).
 */
const VARIANTS: Record<Variant, string> = {
  primary: "rounded-xl bg-primary text-on-primary shadow-[var(--shadow-button)] hover:opacity-90 disabled:opacity-60 disabled:shadow-none",
  secondary: "rounded-xl border border-border-strong bg-surface text-text-primary hover:bg-surface-pressed disabled:opacity-60",
  danger: "rounded-xl border border-danger bg-surface text-danger hover:bg-danger/10 disabled:opacity-60",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button className={`font-semibold transition-opacity ${VARIANTS[variant]} ${className}`} {...props} />;
}
