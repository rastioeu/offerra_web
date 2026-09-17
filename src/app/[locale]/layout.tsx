import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import "../globals.css";

import { FavoritesProvider } from "@/hooks/use-favorites";
import { NotificationsProvider } from "@/hooks/use-notifications";
import { SiteHeader } from "@/components/site-header";
import { isLocale, LOCALES, type Locale } from "@/i18n";
import { createClient } from "@/lib/supabase/server";

/**
 * Popis prevzatý z appky (`src/i18n/locales/sk.json` → `howItWorks.lead`
 * v `/root/offerra`) — jedna veta, ktorá hovorí presne to, čo si Rastio
 * predstavuje pod "obrátený trh s nehnuteľnosťami". Meta description sa
 * má meniť v tom istom kroku ako appkový text, nie žiť vlastným životom
 * (rovnaká zásada ako CLAUDE.md appky §8 pre "Ako funguje").
 */
const DESCRIPTION: Record<Locale, string> = {
  sk: "Offerra je obrátený trh s nehnuteľnosťami. Predávajúci nemusí povedať cenu — záujemcovia predkladajú vlastné ponuky a všetci vidia, ako to ide.",
  en: "Offerra is a reverse real estate market. Sellers don't have to name a price — buyers make their own offers and everyone can see how it's going.",
  de: "Offerra ist ein umgekehrter Immobilienmarkt. Verkäufer müssen keinen Preis nennen — Interessenten machen eigene Angebote, und alle sehen, wie es läuft.",
};
const TITLE: Record<Locale, string> = {
  sk: "Offerra — obrátený trh s nehnuteľnosťami",
  en: "Offerra — a reverse real estate market",
  de: "Offerra — ein umgekehrter Immobilienmarkt",
};
const OG_LOCALE: Record<Locale, string> = { sk: "sk_SK", en: "en_US", de: "de_DE" };

/**
 * `generateMetadata` na layout úrovni — appka nemá web ekvivalent,
 * appka nepotrebuje `<html lang>` ani hreflang. `openGraph.locale` a
 * title/description sa menia podľa `[locale]` segmentu, jednotlivé
 * stránky (appka: appkový `generateMetadata` na `page.tsx`) si toto
 * ešte prepíšu vlastným, konkrétnejším textom.
 */
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "sk";

  return {
    metadataBase: new URL("https://app.offerra.sk"),
    title: { default: TITLE[locale], template: "%s | Offerra" },
    description: DESCRIPTION[locale],
    alternates: {
      languages: Object.fromEntries(LOCALES.map((l) => [l, l === "sk" ? "https://app.offerra.sk" : `https://app.offerra.sk/${l}`])),
    },
    openGraph: {
      siteName: "Offerra",
      type: "website",
      locale: OG_LOCALE[locale],
      title: TITLE[locale],
      description: DESCRIPTION[locale],
      images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: TITLE[locale],
      description: DESCRIPTION[locale],
      images: ["/og-image.png"],
    },
  };
}

/**
 * Organization/WebSite JSON-LD — appka/web nemá appkový vzor (mobilná
 * appka štruktúrované dáta nepotrebuje), toto je čisto pre vyhľadávače
 * a AI asistentov: jedna, jednoznačná identita webu na KAŽDEJ stránke,
 * nie len na detaile inzerátu.
 */
function jsonLdFor(locale: Locale) {
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Offerra",
    url: "https://app.offerra.sk",
    description: DESCRIPTION[locale],
    logo: "https://app.offerra.sk/brand/wordmark.png",
  };
  const siteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Offerra",
    url: "https://app.offerra.sk",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://app.offerra.sk/?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };
  return { orgJsonLd, siteJsonLd };
}

export default async function RootLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "sk";
  if (!isLocale(rawLocale)) notFound();
  const { orgJsonLd, siteJsonLd } = jsonLdFor(locale);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang={locale} className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-text-primary">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />
        <NotificationsProvider userId={user?.id ?? null}>
          <FavoritesProvider userId={user?.id ?? null}>
            <SiteHeader />
            {children}
          </FavoritesProvider>
        </NotificationsProvider>
      </body>
    </html>
  );
}
