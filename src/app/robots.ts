import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * SEO je hlavný dôvod projektu (Rastio) — verejný katalóg/detail majú
 * byť indexovateľné, prihlásením chránené stránky nie (nemajú čo
 * ponúknuť vyhľadávaču a len by riedili crawl budget).
 *
 * AI CRAWLERI SÚ EXPLICITNE POVOLENÍ (Rastio, 17.9.2026: „aby to aj AI
 * brala vsade") — `userAgent: "*"` by ich beztak pustil (nič ich
 * neblokuje), ale explicitný riadok pre KAŽDÉHO známeho AI bota je
 * jednoznačný zámer, nie náhoda, a odolá tomu, keby niektorý parser
 * niekedy vyhodnotil `*` inak než ostatní. Rovnaký zoznam
 * disallow-ov ako `*` — AI nemá vidieť prihlásením chránené stránky o
 * nič viac než bežný vyhľadávač.
 */
const PRIVATE_PATH_NAMES = [
  "/login",
  "/moje-inzeraty",
  "/moje-ponuky",
  "/moje-dopyty",
  "/oblubene",
  "/oznamenia",
  "/prezyvka",
  "/aktivita",
  "/nastavenia",
  "/admin",
];

/**
 * SK je bez predpony, EN/DE majú `/en`/`/de` (i18n kolo, 17.9.2026) —
 * bez tohto by `disallow` chránilo len SK cestu a `/en/nastavenia`
 * alebo `/de/moje-inzeraty` by ostali indexovateľné.
 */
const PRIVATE_PATHS = [
  ...PRIVATE_PATH_NAMES,
  ...PRIVATE_PATH_NAMES.map((p) => `/en${p}`),
  ...PRIVATE_PATH_NAMES.map((p) => `/de${p}`),
  "/auth/",
];

const AI_BOTS = [
  "GPTBot", // OpenAI — trénovanie
  "OAI-SearchBot", // OpenAI — vyhľadávanie/ChatGPT search
  "ChatGPT-User", // OpenAI — živé prehliadanie na žiadosť používateľa
  "ClaudeBot", // Anthropic — trénovanie/indexovanie
  "anthropic-ai", // Anthropic — staršie meno
  "Claude-Web", // Anthropic — živé prehliadanie
  "PerplexityBot", // Perplexity
  "Google-Extended", // Google Gemini/AI Overviews trénovanie
  "Applebot-Extended", // Apple Intelligence
  "Bytespider", // ByteDance
  "CCBot", // Common Crawl (vstup mnohých AI trénovacích datasetov)
  "Amazonbot", // Amazon (Alexa/AI)
  "meta-externalagent", // Meta AI
  "DuckAssistBot", // DuckDuckGo AI
];

/**
 * DYNAMICKÝ (nie predgenerovaný pri builde) — `Sitemap:` riadok berie
 * `SITE_URL`, a ten sa mení pri presune domény (24.9.2026,
 * `app.offerra.sk` → `offerra.sk`). Staticky zapečený `robots.txt` by po
 * prepnutí `SITE_URL` bez rebuildu ďalej ukazoval na starú doménu.
 */
export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: PRIVATE_PATHS },
      ...AI_BOTS.map((userAgent) => ({ userAgent, allow: "/", disallow: PRIVATE_PATHS })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
