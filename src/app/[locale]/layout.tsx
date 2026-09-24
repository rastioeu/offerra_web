import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import "../globals.css";

import { FavoritesProvider } from "@/hooks/use-favorites";
import { NotificationsProvider } from "@/hooks/use-notifications";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { isLocale, LOCALES, type Locale } from "@/i18n";
import { CONTACT_EMAIL, CONTACT_PHONE_TEL } from "@/lib/contact";
import { createClient } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/site";

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
    metadataBase: new URL(SITE_URL),
    title: { default: TITLE[locale], template: "%s | Offerra" },
    description: DESCRIPTION[locale],
    alternates: {
      languages: Object.fromEntries(LOCALES.map((l) => [l, l === "sk" ? SITE_URL : `${SITE_URL}/${l}`])),
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
    url: SITE_URL,
    description: DESCRIPTION[locale],
    logo: `${SITE_URL}/brand/wordmark.png`,
    // Rastio, 17.9.2026: kontakt aj do štruktúrovaných dát, nech ho
    // Google vie ukázať priamo vo výsledkoch vyhľadávania.
    telephone: CONTACT_PHONE_TEL,
    email: CONTACT_EMAIL,
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: CONTACT_PHONE_TEL,
        email: CONTACT_EMAIL,
        contactType: "customer service",
        areaServed: "SK",
        availableLanguage: ["sk", "en", "de"],
      },
    ],
  };
  const siteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Offerra",
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/?q={search_term_string}`,
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
        <SiteFooter />
      </body>
    </html>
  );
}
