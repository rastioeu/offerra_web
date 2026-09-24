@AGENTS.md

# OFFERRA WEB — pravidlá práce

Webová (Next.js, App Router, SSR) verzia realitnej appky Offerra. Sesterský
projekt k mobilnej appke **`/root/offerra`** — **nikdy sa do nej
nezasahuje**, len sa z nej čítajú vzory (pozri `reports/OFFERRA_WEB_PLAN.md`
v `/root/offerra` pre celkový plán a `reports/OFFERRA_WEB_DOMENA.md` pre
doménu/DNS).

- **Táto appka je Next.js 16** — API sa v tejto verzii oproti bežným
  očakávaniam mení (`middleware.ts` → `proxy.ts`, async `params`/
  `searchParams`/`cookies()`, `PageProps`/`LayoutProps` helpery). Pred
  písaním kódu, ktorý sa týka routovania/cachovania/auth, over si to
  v `node_modules/next/dist/docs/01-app/` — netreba spoliehať na
  predchádzajúcu skúsenosť s inou verziou Next.js.
- **Dáta:** rovnaká Supabase databáza/schéma `offerra` ako appka (projekt
  `vxqvpgzwefcehugmhaft`), zdieľaný `auth.users`. Len `NEXT_PUBLIC_SUPABASE_URL`
  a `NEXT_PUBLIC_SUPABASE_ANON_KEY` — **žiadny service role kľúč nikde**,
  autorizácia ide cez RLS presne ako v appke.
- **Zdieľanie logiky s appkou:** zatiaľ ručný prenos čistých modulov
  (bez RN importov) z `/root/offerra/src/lib/*.ts` + i18n JSON, nie
  monorepo (appka má krehký EAS/OTA fingerprint režim, pozri jej
  CLAUDE.md §9 — netreba to riskovať kvôli webu).
- **Hosting:** Hetzner `142.132.187.27` (tento istý server), `systemd`
  (nie pm2 — server to takto má zavedené pre ostatné služby), verejne
  cez Cloudflare Tunnel na **apexe `offerra.sk`** (od 24.9.2026, Rastio:
  „potrebujem to teraz tak aby to išlo na offerra.sk nie na
  app.offerra.sk"). Verejná adresa je JEDNA premenná `SITE_URL`
  (`.env.local`, potom `npm run build` + reštart) — `src/lib/site.ts`,
  nikdy natvrdo v kóde. `www.`/`app.offerra.sk` a staré WordPress URL sa
  301 presmerúvajú v `src/proxy.ts`. **Poštu na `offerra.sk` (MX, SPF,
  DKIM, `mail.`/`webmail.` — Websupport) sa NIKDY nedotýkať**; starý
  WordPress hosting na Websupporte ostal nedotknutý (rollback, pozri
  `reports/OFFERRA_WEB_MILNIK1.md`, sekcia Presun domény).
