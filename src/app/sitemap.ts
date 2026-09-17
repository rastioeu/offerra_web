import type { MetadataRoute } from "next";

import { createClient } from "@/lib/supabase/server";

const BASE_URL = "https://app.offerra.sk";

/**
 * SEO je hlavný dôvod projektu (Rastio) — každý zverejnený inzerát a
 * dopyt má vlastnú indexovateľnú URL, sitemap ich vyhľadávaču povie
 * priamo namiesto spoliehania sa na to, že ich niekedy nájde cez
 * odkazy z katalógu.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();
  const db = supabase.schema("offerra");

  const [{ data: properties }, { data: demands }] = await Promise.all([
    db.from("property").select("id,updated_at").eq("status", "ACTIVE").limit(5000),
    db.from("buyer_request").select("id,created_at").eq("status", "ACTIVE").limit(5000),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: "hourly", priority: 1 },
    { url: `${BASE_URL}/dopyty`, changeFrequency: "hourly", priority: 0.8 },
    { url: `${BASE_URL}/ako-to-funguje`, changeFrequency: "monthly", priority: 0.4 },
  ];

  const propertyRoutes: MetadataRoute.Sitemap = (properties ?? []).map((p) => ({
    url: `${BASE_URL}/inzerat/${p.id}`,
    lastModified: p.updated_at as string,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  const demandRoutes: MetadataRoute.Sitemap = (demands ?? []).map((d) => ({
    url: `${BASE_URL}/dopyt/${d.id}`,
    lastModified: d.created_at as string,
    changeFrequency: "daily",
    priority: 0.5,
  }));

  return [...staticRoutes, ...propertyRoutes, ...demandRoutes];
}
