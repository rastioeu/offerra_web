"use client";

import { useTransition } from "react";

import { deleteProperty, setPropertyStatus } from "@/app/[locale]/admin/actions";
import { Button } from "@/components/button";

/**
 * Schválenie / skrytie / trvalé zmazanie inzerátu — appka: `reject`/
 * `destroy`/priame schválenie v `PROPERTIES` tabe. Predtým na webe
 * neexistovalo vôbec (Rastio, 18.9.2026: „v admin konzole na webe to
 * nefunguje rovnako sko v ios appke, daj tam všetky funkcie").
 */
export function AdminPropertyActions({ propertyId, status }: { propertyId: string; status: string }) {
  const [pending, startTransition] = useTransition();

  function approve() {
    startTransition(() => void setPropertyStatus(propertyId, "ACTIVE", null));
  }

  function hide() {
    if (!window.confirm("Skryť inzerát z katalógu? Vlastník ho bude môcť znova upraviť a zverejniť.")) return;
    startTransition(() => void setPropertyStatus(propertyId, "REJECTED", "Skryté administrátorom"));
  }

  function remove() {
    if (!window.confirm("Zmazať inzerát NATRVALO? Táto akcia sa nedá vrátiť späť.")) return;
    startTransition(() => void deleteProperty(propertyId));
  }

  return (
    <div className="flex flex-wrap gap-2">
      {status !== "ACTIVE" ? (
        <Button type="button" onClick={approve} disabled={pending} className="px-3 py-1.5 text-sm">
          Schváliť
        </Button>
      ) : (
        <Button type="button" variant="secondary" onClick={hide} disabled={pending} className="px-3 py-1.5 text-sm">
          Skryť z katalógu
        </Button>
      )}
      <Button type="button" variant="danger" onClick={remove} disabled={pending} className="px-3 py-1.5 text-sm">
        Zmazať natrvalo
      </Button>
    </div>
  );
}
