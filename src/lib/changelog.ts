/**
 * „Čo je nové" pre web — appkový vzor (appka: `src/lib/changelog.ts`,
 * CLAUDE.md §7 appky: „Čo je nové" je PRE POUŽÍVATEĽA, nie pracovný
 * denník; register (`OFFERRA_WEB_MILNIK1.md`) má statusy a dôkazy, toto
 * má len čo sa zmenilo a čo to dá).
 *
 * NIE port appkového changelogu — appkový je plný appkovo-špecifických
 * vecí (natívne gestá, TestFlight buildy), ktoré sa na webe nikdy
 * nestali. Vlastný, webový, so skutočnými dátumami zo `git log`
 * (16.–17.9.2026, kedy web reálne vznikol), zoskupený do
 * zmysluplných záznamov — nie jeden záznam na commit.
 *
 * ZÁMERNE LEN PO SLOVENSKY, rovnako ako appkový changelog (ten je tiež
 * SK-only napriek tomu, že appka má EN/DE) — je to historický záznam,
 * nie časť appky/webu, ktorú niekto používa. Titulok/úvod okolo neho
 * preložené sú (`novinky.*`).
 */
export type ChangelogEntry = {
  date: string;
  title: string;
  items: string[];
};

export const CHANGELOG: ChangelogEntry[] = [
  {
    date: '17. septembra 2026',
    title: 'Angličtina a nemčina, zvonček, obľúbené',
    items: [
      'Web sa dá prezerať aj po anglicky a po nemecky — prepínač jazyka je v hlavičke, hneď vedľa zvončeka.',
      'Zvonček upozornení — rovnaký princíp ako appka: nová ponuka, prijatie, správa, žiadosť o obhliadku prídu živo, bez obnovenia stránky.',
      'Srdiečko pri inzeráte — obľúbené si nájdeš na vlastnej stránke, prehľadne na jednom mieste.',
      'Karta „Ako funguje Offerra" na hlavnej stránke aj v Nastaveniach, s plnou verziou na vlastnej stránke.',
      'Prezývka, meno a telefón sa teraz dajú upraviť priamo v Nastaveniach.',
    ],
  },
  {
    date: '17. septembra 2026',
    title: 'Vlastná značka namiesto predvolenej Next.js stránky',
    items: [
      'Vlastná 404 stránka, značkové favicon a obrázok pri zdieľaní odkazu (predtým holé Next.js predvolené).',
      'Web je teraz viditeľný aj pre AI asistentov (ChatGPT, Perplexity, Claude a ďalšie) — predtým chýbal `robots.txt` aj `sitemap.xml` úplne.',
      'Živé vyhľadávanie v katalógu — píšeš a výsledky sa menia hneď, bez tlačidla „Hľadať".',
      'Nové správy na detaile inzerátu sa objavia samé, bez obnovenia stránky.',
    ],
  },
  {
    date: '17. septembra 2026',
    title: 'Vzhľad prispôsobený počítaču, nie naťahovaný mobil',
    items: [
      'Katalóg a detail inzerátu majú teraz vzhľad stavaný pre širokú obrazovku, nie zväčšenú mobilnú appku.',
      'Živý, po sekundách tikajúci odpočet uzávierky ponúk aj platnosti jednotlivej ponuky — rovnaká appková paritа.',
      'Výber mesta a ulice našepkáva z registra 2 925 slovenských obcí — rovnaký zoznam ako appka.',
      'Dotazník o nájomcovi pri ponuke na prenájom.',
      'Vizuálna história priebehu ponuky (podaná → videná → rozhodnutá).',
    ],
  },
  {
    date: '16. septembra 2026',
    title: 'Offerra Web spustená',
    items: [
      'Verejný katalóg nehnuteľností aj dopytov, filtrovanie podľa typu obchodu, nehnuteľnosti a voľného textu.',
      'Prihlásenie cez Google aj Apple.',
      'Podanie, úprava a stiahnutie ponuky, rozhodovanie majiteľa (prijať/odmietnuť/uzavrieť obchod).',
      'Pridanie a úprava vlastného inzerátu s fotkami, správa vlastných inzerátov, ponúk aj dopytov.',
      'Správy 1:1, žiadosti o obhliadku, hypotekárna kalkulačka, hodnotenia po uzavretom obchode.',
      'Nastavenia — stiahnutie vlastných dát (GDPR export), zmazanie účtu.',
    ],
  },
];
