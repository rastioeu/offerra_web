"use client";

/**
 * Obľúbené inzeráty — port appkového `src/hooks/use-favorites.ts`.
 * SÚKROMNÉ (appka: „nikto nemá vidieť, čo si niekto iný odložil" — drží
 * to RLS, nie len UI). Jeden zdieľaný stav pre celý web (rovnaký dôvod
 * ako `NotificationsProvider` — karty v katalógu aj detail inzerátu
 * potrebujú vedieť o tom istom srdiečku súčasne).
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { createClient } from "@/lib/supabase/client";

type FavoritesState = {
  ids: Set<string>;
  loggedIn: boolean;
  toggle: (propertyId: string) => Promise<boolean | null>;
};

const FavoritesContext = createContext<FavoritesState | null>(null);

export function FavoritesProvider({ userId, children }: { userId: string | null; children: ReactNode }) {
  const [ids, setIds] = useState<Set<string>>(new Set());
  const supabase = useMemo(() => createClient(), []);

  const reload = useCallback(async () => {
    if (!userId) {
      setIds(new Set());
      return;
    }
    try {
      const { data, error } = await supabase.schema("offerra").from("favorite").select("property_id");
      if (error) throw error;
      setIds(new Set((data ?? []).map((r) => (r as { property_id: string }).property_id)));
    } catch (e) {
      console.log(`[OBĽÚBENÉ] Načítanie zlyhalo: ${e instanceof Error ? e.message : e}`);
    }
  }, [userId, supabase]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const toggle = useCallback(
    async (propertyId: string): Promise<boolean | null> => {
      if (!userId) return null;
      const on = ids.has(propertyId);
      setIds((prev) => {
        const next = new Set(prev);
        if (on) next.delete(propertyId);
        else next.add(propertyId);
        return next;
      });
      try {
        const { error } = on
          ? await supabase.schema("offerra").from("favorite").delete().eq("property_id", propertyId).eq("user_id", userId)
          : await supabase.schema("offerra").from("favorite").insert({ user_id: userId, property_id: propertyId });
        if (error) throw error;
        return !on;
      } catch (e) {
        console.log(`[OBĽÚBENÉ] Zmena zlyhala: ${e instanceof Error ? e.message : e}`);
        await reload();
        return null;
      }
    },
    [ids, userId, reload, supabase]
  );

  const value = useMemo<FavoritesState>(() => ({ ids, loggedIn: userId != null, toggle }), [ids, userId, toggle]);

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites(): FavoritesState {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites sa dá volať len vnútri <FavoritesProvider>.");
  return ctx;
}
