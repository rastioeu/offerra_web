"use client";

import { OPEN_CONSENT_EVENT } from "@/components/analytics";

/** „Nastavenia cookies" v pätičke — znovu otvorí lištu so súhlasom (zmena rozhodnutia). */
export function ConsentSettingsButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_CONSENT_EVENT))}
      className="hover:text-text-primary"
    >
      {label}
    </button>
  );
}
