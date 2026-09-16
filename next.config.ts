import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
