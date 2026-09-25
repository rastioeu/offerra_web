import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Koncové lomítko rieši `proxy.ts`, nie Next.js. Vstavané presmerovanie
  // (`/faq/` → `/faq`) skladá cieľ z INTERNEJ adresy (`http://localhost:3001`),
  // nie z verejného hosta za Cloudflare Tunnel — zmerané 24.9.2026 pri
  // presune na `offerra.sk`. Všetky staré WordPress URL končia `/`, takže
  // by každá z nich (SEO!) skončila na neexistujúcej localhost adrese.
  skipTrailingSlashRedirect: true,
  // Fotka inzerátu ide na server ako Server Action s `File` (max 8 MB, viď
  // `photo-actions.ts`). Predvolený limit tela Server Action je 1 MB, takže
  // by fotka z telefónu/fotoaparátu nad 1 MB padla ešte pred nahratím.
  experimental: {
    serverActions: { bodySizeLimit: "10mb" },
  },
  images: {
    // Fotky inzerátov idú zo Supabase Storage (bucket `offerra-media`,
    // rovnaký projekt ako appka) — next/image potrebuje explicitný
    // zoznam povolených hostiteľov pre optimalizáciu.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "vxqvpgzwefcehugmhaft.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
