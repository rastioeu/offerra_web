# offerra_web

Tento repozitár má DVA nezávislé obsahy:

## 1. Verejné právne stránky (GitHub Pages, koreň repozitára)

`index.html`, `privacy.html`, `terms.html`, `support.html` — ochrana
osobných údajov, podmienky používania a podpora pre appku Offerra.
Slúžia aj ako odkazy v App Store Connect. Servírované cez GitHub Pages
z `main` branchu.

**Nesmú sa upravovať ručne** — `privacy.html`, `terms.html`,
`index.html` a `support.html` sa **generujú** zo súboru
[`src/lib/legal.ts`](https://github.com/rastioeu/offerra/blob/main/src/lib/legal.ts)
v repozitári mobilnej appky. Ten istý text zobrazuje aj appka offline.

Dva ručne udržiavané dokumenty by si o mesiac odporovali — a dokument
o súkromí, ktorý klame, je horší než žiadny.

Prepísať web po zmene textu:

```bash
# v repozitári rastioeu/offerra
node scripts/build-legal-html.mjs ../offerra_web
```

## 2. Webová appka Offerra (Next.js, `src/`)

Plnohodnotná webová verzia mobilnej appky (SSR, App Router) — bežiaca
na Hetzneri, nie na GitHub Pages (Pages nevie spustiť Next.js server).
Pozri `CLAUDE.md` v tomto repozitári a `reports/OFFERRA_WEB_PLAN.md` /
`reports/OFFERRA_WEB_DOMENA.md` v repozitári `rastioeu/offerra` pre
plán, rozsah a DNS/hosting.

```bash
npm install
npm run dev
```

Tieto dva obsahy sa navzájom neovplyvňujú — generovací skript vyššie sa
dotýka len svojich piatich menovaných súborov, nič iné v repozitári
nemaže ani neprepisuje.
