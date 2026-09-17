"use client";

/**
 * Oznámenia (zvonček) + živé obnovenie cez Supabase Realtime — port
 * appkového `src/hooks/use-notifications.ts`. Rovnaký dôvod pre JEDEN
 * kanál na celý web namiesto kanála na inštanciu `NotificationBell`
 * (appka: pád pri viacerých naraz namontovaných hlavičkách, 8.8.2026,
 * CLAUDE.md appky §11) — `useRealtimeChannel` (`src/lib/realtime.ts`)
 * to už rieši zdieľaním podľa topicu, jednorazová prípona v názve
 * kanála tu ostáva ako rovnaká poistka ako v appke.
 *
 * Beží raz na web — provider je v `app/[locale]/layout.tsx`, obaľuje
 * `<SiteHeader />` aj `{children}`, aby zvonček fungoval na KAŽDEJ
 * stránke.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { useRealtimeChannel } from "@/hooks/use-realtime-channel";
import type { NotificationType } from "@/lib/notifications";
import { createClient } from "@/lib/supabase/client";

export type AppNotification = {
  id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  property_id: string | null;
  offer_id: string | null;
  request_id: string | null;
  read_at: string | null;
  created_at: string;
};

export type NotificationsState = {
  items: AppNotification[];
  unread: number;
  error: string | null;
  reload: () => Promise<void>;
  markAllRead: () => Promise<void>;
};

const NotificationsContext = createContext<NotificationsState | null>(null);

export function NotificationsProvider({ userId, children }: { userId: string | null; children: ReactNode }) {
  const [items, setItems] = useState<AppNotification[]>([]);
  const [error, setError] = useState<string | null>(null);
  const suffix = useRef(Math.random().toString(36).slice(2, 8));
  const supabase = useMemo(() => createClient(), []);

  const reload = useCallback(async () => {
    if (!userId) {
      setItems([]);
      return;
    }
    try {
      const { data, error: e } = await supabase
        .schema("offerra")
        .from("notification")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (e) throw e;
      setItems((data ?? []) as AppNotification[]);
      setError(null);
    } catch (e) {
      const m = e instanceof Error ? e.message : "Načítanie zlyhalo";
      console.log(`[ZVONČEK] Načítanie zlyhalo: ${m}`);
      setError(m);
    }
  }, [userId, supabase]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useRealtimeChannel({
    topic: userId ? `notif-${userId}-${suffix.current}` : null,
    label: "[ZVONČEK]",
    bindings: userId
      ? [{ event: "INSERT", schema: "offerra", table: "notification", filter: `user_id=eq.${userId}` }]
      : [],
    onChange: (payload) => {
      setItems((prev) => [payload.new as AppNotification, ...prev]);
    },
    onStatus: (status) => {
      if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        console.log(`[ZVONČEK] Kanál sa neotvoril: ${status} — web funguje ďalej bez neho`);
      }
    },
  });

  const unread = items.filter((n) => !n.read_at).length;

  const markAllRead = useCallback(async () => {
    if (unread === 0) return;
    const now = new Date().toISOString();
    setItems((prev) => prev.map((n) => (n.read_at ? n : { ...n, read_at: now })));
    try {
      const { error: e } = await supabase.schema("offerra").rpc("mark_notifications_read");
      if (e) throw e;
    } catch (e) {
      console.log(`[ZVONČEK] Označenie zlyhalo: ${e instanceof Error ? e.message : e}`);
      await reload();
    }
  }, [unread, reload, supabase]);

  const value = useMemo<NotificationsState>(
    () => ({ items, unread, error, reload, markAllRead }),
    [items, unread, error, reload, markAllRead]
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications(): NotificationsState {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications sa dá volať len vnútri <NotificationsProvider>.");
  return ctx;
}
