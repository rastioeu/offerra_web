import type { Metadata } from "next";
import "./globals.css";

/**
 * Popis prevzatý z appky (`src/i18n/locales/sk.json` → `howItWorks.lead`
 * v `/root/offerra`) — jedna veta, ktorá hovorí presne to, čo si Rastio
 * predstavuje pod "obrátený trh s nehnuteľnosťami". Meta description sa
 * má meniť v tom istom kroku ako appkový text, nie žiť vlastným životom
 * (rovnaká zásada ako CLAUDE.md appky §8 pre "Ako funguje").
 */
export const metadata: Metadata = {
  title: {
    default: "Offerra",
    template: "%s | Offerra",
  },
  description:
    "Offerra je obrátený trh s nehnuteľnosťami. Predávajúci nemusí povedať cenu — záujemcovia predkladajú vlastné ponuky a všetci vidia, ako to ide.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="sk" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-text-primary">
        {children}
      </body>
    </html>
  );
}
