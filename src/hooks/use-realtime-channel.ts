"use client";

/**
 * JEDINÝ povolený spôsob, ako si v Offerra webe otvoriť Supabase Realtime
 * kanál — port appkového `use-realtime-channel.ts` (appka: CLAUDE.md §11).
 * Dôvod a koreňová príčina sú zapísané v `src/lib/realtime.ts` (1:1 port,
 * bez zmeny), sem sa to needuplikuje.
 */
import { useEffect, useRef } from "react";

import {
  bindingsKey,
  createRealtimeRegistry,
  type PgBinding,
  type PgPayload,
  type RealtimeStatus,
} from "@/lib/realtime";
import { createClient } from "@/lib/supabase/client";

/** Register aj klient sú JEDEN na celý modul (browser), rovnaký dôvod ako appka. */
const supabase = createClient();
export const realtimeRegistry = createRealtimeRegistry({
  channel: (topic) => supabase.channel(topic) as never,
  removeChannel: (ch) => supabase.removeChannel(ch as never),
});

export type UseRealtimeChannelOptions = {
  topic: string | null | undefined;
  bindings: PgBinding[];
  onChange: (payload: PgPayload) => void;
  onStatus?: (status: RealtimeStatus) => void;
  label?: string;
  enabled?: boolean;
};

export function useRealtimeChannel({
  topic,
  bindings,
  onChange,
  onStatus,
  label,
  enabled = true,
}: UseRealtimeChannelOptions) {
  const onChangeRef = useRef(onChange);
  const onStatusRef = useRef(onStatus);
  onChangeRef.current = onChange;
  onStatusRef.current = onStatus;

  const key = bindings.length ? bindingsKey(bindings) : "";
  const bindingsRef = useRef(bindings);
  bindingsRef.current = bindings;

  useEffect(() => {
    if (!enabled || !topic || !bindingsRef.current.length) return;
    return realtimeRegistry.subscribe({
      topic,
      bindings: bindingsRef.current,
      label,
      onChange: (payload) => onChangeRef.current(payload),
      onStatus: (status) => onStatusRef.current?.(status),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic, key, enabled, label]);
}
