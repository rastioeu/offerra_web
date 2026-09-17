import type { MetadataRoute } from "next";

/**
 * SEO je hlavný dôvod projektu (Rastio) — verejný katalóg/detail majú
 * byť indexovateľné, prihlásením chránené stránky nie (nemajú čo
 * ponúknuť vyhľadávaču a len by riedili crawl budget).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/login", "/moje-inzeraty", "/moje-ponuky", "/moje-dopyty", "/nastavenia", "/admin", "/auth/"],
    },
    sitemap: "https://app.offerra.sk/sitemap.xml",
  };
}
