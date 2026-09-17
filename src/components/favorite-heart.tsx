"use client";

/**
 * Srdiečko — port appkového `favorite-heart.tsx`. Reaguje okamžite
 * (optimisticky, appka: čakať na sieť pri takomto drobnom geste vyzerá
 * rozbito). Appkový kruh pod ikonou (kontrast nezávislý od fotky pod
 * ňou, zmerané appkou na 3,09:1 najhorší prípad) prenesený 1:1.
 *
 * Bez prihlásenia sa vôbec nevykreslí — appka aj web majú obľúbené
 * len pre prihláseného, volajúci (karta/detail) sa o to nemusí starať.
 */
import { usePathname } from "next/navigation";
import { useState } from "react";

import { useFavorites } from "@/hooks/use-favorites";
import { createT, isLocale } from "@/i18n";

const PLATE_ON = "rgba(255,255,255,0.92)";
const PLATE_OFF = "rgba(0,0,0,0.62)";

export function FavoriteHeart({ propertyId, size = 22 }: { propertyId: string; size?: number }) {
  const { ids, loggedIn, toggle } = useFavorites();
  const pathname = usePathname();
  const maybeLocale = pathname.split("/")[1];
  const locale = isLocale(maybeLocale) && maybeLocale !== "sk" ? maybeLocale : "sk";
  const t = createT(locale);
  const [pending, setPending] = useState(false);
  const active = ids.has(propertyId);

  if (!loggedIn) return null;

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (pending) return;
    setPending(true);
    await toggle(propertyId);
    setPending(false);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-label={active ? t("favoriteHeart.removeAccessibility") : t("favoriteHeart.addAccessibility")}
      aria-pressed={active}
      className="flex items-center justify-center rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.45)] transition-transform active:scale-90"
      style={{
        width: size + 14,
        height: size + 14,
        backgroundColor: active ? PLATE_ON : PLATE_OFF,
      }}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill={active ? "var(--color-favorite)" : "none"} stroke={active ? "var(--color-favorite)" : "#FFFFFF"} strokeWidth="2">
        <path d="M12 20.5s-7.5-4.6-10-9.2C.5 8 2 4.5 5.5 3.8 8 3.3 10.3 4.6 12 7c1.7-2.4 4-3.7 6.5-3.2C22 4.5 23.5 8 22 11.3c-2.5 4.6-10 9.2-10 9.2z" />
      </svg>
    </button>
  );
}
