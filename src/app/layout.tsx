import type { Metadata } from "next";
import "./globals.css";

import { SiteHeader } from "@/components/site-header";

/**
 * Popis prevzatý z appky (`src/i18n/locales/sk.json` → `howItWorks.lead`
 * v `/root/offerra`) — jedna veta, ktorá hovorí presne to, čo si Rastio
 * predstavuje pod "obrátený trh s nehnuteľnosťami". Meta description sa
 * má meniť v tom istom kroku ako appkový text, nie žiť vlastným životom
 * (rovnaká zásada ako CLAUDE.md appky §8 pre "Ako funguje").
 */
const DESCRIPTION =
  "Offerra je obrátený trh s nehnuteľnosťami. Predávajúci nemusí povedať cenu — záujemcovia predkladajú vlastné ponuky a všetci vidia, ako to ide.";

export const metadata: Metadata = {
  metadataBase: new URL("https://app.offerra.sk"),
  title: {
    default: "Offerra — obrátený trh s nehnuteľnosťami",
    template: "%s | Offerra",
  },
  description: DESCRIPTION,
  openGraph: {
    siteName: "Offerra",
    type: "website",
    locale: "sk_SK",
    title: "Offerra — obrátený trh s nehnuteľnosťami",
    description: DESCRIPTION,
    images: ["/brand/wordmark.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Offerra — obrátený trh s nehnuteľnosťami",
    description: DESCRIPTION,
    images: ["/brand/wordmark.png"],
  },
};

/**
 * Organization/WebSite JSON-LD — appka/web nemá appkový vzor (mobilná
 * appka štruktúrované dáta nepotrebuje), toto je čisto pre vyhľadávače
 * a AI asistentov: jedna, jednoznačná identita webu na KAŽDEJ stránke,
 * nie len na detaile inzerátu.
 */
const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Offerra",
  url: "https://app.offerra.sk",
  description: DESCRIPTION,
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="sk" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-text-primary">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
