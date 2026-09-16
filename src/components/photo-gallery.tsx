"use client";

import Image from "next/image";
import { useState } from "react";

import type { Media } from "@/lib/property";

/**
 * Hlavná fotka + pás náhľadov. Klientská komponenta LEN kvôli prepínaniu
 * aktívnej fotky (`useState`) — zvyšok stránky okolo nej ostáva Server
 * Component, aby SSR/SEO pokrylo aj text.
 */
export function PhotoGallery({ media, title }: { media: Media[]; title: string }) {
  const [active, setActive] = useState(0);

  if (media.length === 0) {
    return (
      <div className="flex aspect-[16/10] w-full items-center justify-center rounded-2xl bg-surface-pressed text-text-muted">
        Bez fotky
      </div>
    );
  }

  const current = media[Math.min(active, media.length - 1)];

  return (
    <div className="flex flex-col gap-2">
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-surface-pressed">
        <Image
          src={current.url}
          alt={title}
          fill
          priority
          sizes="(min-width: 1024px) 66vw, 100vw"
          className="object-cover"
        />
      </div>
      {media.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {media.map((m, i) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setActive(i)}
              className={`relative h-16 w-20 flex-none overflow-hidden rounded-lg border-2 transition-colors ${
                i === active ? "border-accent" : "border-transparent"
              }`}
            >
              <Image src={m.url} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
