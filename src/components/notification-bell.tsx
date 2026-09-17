"use client";

/**
 * Zvonček s počtom neprečítaných — port appkového `notification-bell.tsx`.
 * Číta stav z `<NotificationsProvider>` (`app/[locale]/layout.tsx`),
 * neposiela žiadny prop cez RSC hranicu okrem `locale` (reťazec).
 */
import Link from "next/link";

import { useNotifications } from "@/hooks/use-notifications";
import type { Locale } from "@/i18n";
import { localizeHref } from "@/i18n/href";

export function NotificationBell({ locale }: { locale: Locale }) {
  const { unread } = useNotifications();

  return (
    <Link
      href={localizeHref(locale, "/oznamenia")}
      aria-label={unread > 0 ? `Oznámenia, ${unread} neprečítaných` : "Oznámenia"}
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-text-secondary hover:bg-surface-pressed hover:text-text-primary"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
      {unread > 0 ? (
        <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold leading-none text-on-primary">
          {unread > 9 ? "9+" : unread}
        </span>
      ) : null}
    </Link>
  );
}
