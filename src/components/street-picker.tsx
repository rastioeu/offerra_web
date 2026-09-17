"use client";

import { useEffect, useRef, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import { normalizeText, stemSk } from "@/lib/search";

/**
 * Ulica — port appkového `street-picker.tsx`. VOĽNÝ TEXT s návrhmi, nie
 * povinný výber (appka: „nie každá obec má register ulíc"). Kaskáduje
 * z obce/okresu — najprv nájde `city_id`, až potom vyhľadáva ulice.
 */
export function StreetPicker({
  city,
  district,
  value,
  onChange,
  placeholder = "bez čísla domu",
}: {
  city: string | null;
  district: string | null;
  value: string;
  onChange: (street: string) => void;
  placeholder?: string;
}) {
  const [cityId, setCityId] = useState<number | null>(null);
  const [results, setResults] = useState<{ id: number; name: string }[]>([]);
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCityId(null);
    if (!city) return;
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      let q = supabase.schema("offerra").from("city").select("id").eq("name_norm", normalizeText(city));
      if (district) q = q.eq("district", district);
      const { data } = await q.limit(2);
      if (!cancelled && data && data.length === 1) setCityId(data[0].id as number);
    })();
    return () => {
      cancelled = true;
    };
  }, [city, district]);

  useEffect(() => {
    if (!open || cityId == null) return;
    const needle = stemSk(value.trim());
    if (needle.length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      const supabase = createClient();
      const { data } = await supabase
        .schema("offerra")
        .from("street")
        .select("id,name")
        .eq("city_id", cityId)
        .like("name_norm", `${needle}%`)
        .order("name")
        .limit(8);
      setResults((data ?? []) as { id: number; name: string }[]);
    }, 220);
    return () => clearTimeout(timer);
  }, [open, cityId, value]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={boxRef} className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-border-strong bg-surface px-4 py-2.5 text-text-primary placeholder:text-text-placeholder focus:border-accent-deep focus:outline-none"
      />
      {open && results.length > 0 ? (
        <ul className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-border bg-surface shadow-[var(--shadow-card)]">
          {results.map((row) => (
            <li key={row.id}>
              <button
                type="button"
                onClick={() => {
                  onChange(row.name);
                  setOpen(false);
                }}
                className="block w-full px-4 py-2 text-left text-text-primary hover:bg-surface-pressed"
              >
                {row.name}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
