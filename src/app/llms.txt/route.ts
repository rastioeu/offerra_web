import { SITE_URL } from "@/lib/site";
/**
 * `llms.txt` — vznikajúci štandard (llmstxt.org), obdoba `robots.txt`,
 * ale pre AI asistentov: krátky, čitateľný Markdown popis webu a
 * kľúčových odkazov, aby mu AI rozumela bez toho, aby musela crawlovať
 * a hádať štruktúru. Rastio, 17.9.2026: „aby to aj AI brala všade."
 *
 * Statický text stačí — zoznam odkazov na kategórie, nie na KAŽDÝ
 * inzerát (na to slúži `sitemap.xml`), rovnaký princíp ako appkový
 * `how-it-works.ts`: jeden pravdivý, stručný opis, nie duplicitný
 * dokument, čo môže začať klamať.
 */
const LLMS_TXT = `# Offerra

> Obrátený trh s nehnuteľnosťami na Slovensku. Predávajúci nemusí
> povedať cenu — záujemcovia predkladajú vlastné ponuky (aj na predaj,
> aj na prenájom), všetci vidia, ako súťaž ide, a majiteľ si vyberie
> komu predá/prenajme.

Offerra funguje aj opačne: kto hľadá nehnuteľnosť, môže založiť
verejný dopyt (rozpočet, lokalita, typ) a majitelia ho môžu sami
osloviť.

## Kľúčové stránky

- [Katalóg nehnuteľností](${SITE_URL}/): verejný zoznam
  všetkých aktívnych inzerátov na predaj aj prenájom, s filtrami
  (typ obchodu, typ nehnuteľnosti, lokalita) a voľným textovým
  vyhľadávaním.
- [Dopyty](${SITE_URL}/dopyty): verejný zoznam toho, čo
  ľudia hľadajú.
- [sitemap.xml](${SITE_URL}/sitemap.xml): úplný, strojovo
  čitateľný zoznam všetkých aktívnych inzerátov a dopytov, každý s
  vlastnou URL a dátumom poslednej zmeny.

## Štruktúrované dáta

Každý inzerát (\`/inzerat/{id}\`) má vložené JSON-LD (\`schema.org/RealEstateListing\`)
s cenou, lokalitou, súradnicami, počtom izieb a výmerou — priamo v HTML,
netreba nič dopočítavať.

## Čo na tomto webe NIE JE

Ceny pri inzerátoch sú len orientačné alebo chýbajú úplne — skutočná
cena vzniká z ponúk záujemcov, nie je to pevný cenník. Kontaktné údaje
(telefón, e-mail) sa odkryjú až po prijatí ponuky, nie sú verejne
v HTML.
`;

export async function GET() {
  return new Response(LLMS_TXT, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
