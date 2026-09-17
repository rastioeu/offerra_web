"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { createT, isLocale } from "@/i18n";
import { createClient } from "@/lib/supabase/client";
import { stemSk } from "@/lib/search";

/**
 * Výber obce — port appkového `city-picker.tsx`. Dopyt ide do DB (`ilike`
 * cez `name_norm` prefix), nie cez načítanie celého zoznamu (appka: ~2930
 * obcí by sa do pamäte zbytočne ťahalo celé). Debounce 220ms ako appka.
 */
export type PickedCity = {
  city: string;
  district: string | null;
  region: string | null;
  latitude: number | null;
  longitude: number | null;
};

type CityRow = {
  name: string;
  district: string | null;
  region: string | null;
  population: number | null;
  lat: number | null;
  lon: number | null;
};

export function CityPicker({
  value,
  onPick,
  placeholder,
}: {
  value: string | null;
  onPick: (picked: PickedCity) => void;
  placeholder?: string;
}) {
  const pathname = usePathname();
  const maybeLocale = pathname.split("/")[1];
  const locale = isLocale(maybeLocale) && maybeLocale !== "sk" ? maybeLocale : "sk";
  const t = createT(locale);
  const [query, setQuery] = useState(value ?? "");
  const [results, setResults] = useState<CityRow[]>([]);
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const needle = stemSk(query.trim());
    if (needle.length === 0) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      const supabase = createClient();
      const { data } = await supabase
        .schema("offerra")
        .from("city")
        .select("name,district,region,population,lat,lon")
        .like("name_norm", `${needle}%`)
        .order("population", { ascending: false, nullsFirst: false })
        .limit(40);
      setResults((data ?? []) as CityRow[]);
    }, 220);
    return () => clearTimeout(timer);
  }, [open, query]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function pick(row: CityRow) {
    setQuery(row.district ? `${row.name} (${row.district})` : row.name);
    setOpen(false);
    onPick({
      city: row.name,
      district: row.district,
      region: row.region,
      latitude: row.lat,
      longitude: row.lon,
    });
  }

  return (
    <div ref={boxRef} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder ?? t("cityPicker.searchPlaceholder")}
        className="w-full rounded-xl border border-border-strong bg-surface px-4 py-2.5 text-text-primary placeholder:text-text-placeholder focus:border-accent-deep focus:outline-none"
      />
      {open && results.length > 0 ? (
        <ul className="absolute z-10 mt-1 max-h-72 w-full overflow-y-auto rounded-xl border border-border bg-surface shadow-[var(--shadow-card)]">
          {results.map((row) => (
            <li key={`${row.name}-${row.district}`}>
              <button
                type="button"
                onClick={() => pick(row)}
                className="flex w-full flex-col items-start px-4 py-2 text-left hover:bg-surface-pressed"
              >
                <span className="text-text-primary">{row.name}</span>
                {row.district ? <span className="text-xs text-text-muted">{row.district}</span> : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
