# offerra_web

Verejné stránky aplikácie **Offerra** — ochrana osobných údajov, podmienky
používania a podpora. Slúžia aj ako odkazy v App Store Connect.

## Nesmie sa tu upravovať ručne

`privacy.html` a `terms.html` sa **generujú** zo súboru
[`src/lib/legal.ts`](https://github.com/rastioeu/offerra/blob/main/src/lib/legal.ts)
v repozitári aplikácie. Ten istý text zobrazuje aj appka offline.

Dva ručne udržiavané dokumenty by si o mesiac odporovali — a dokument
o súkromí, ktorý klame, je horší než žiadny.

Prepísať web po zmene textu:

```bash
# v repozitári rastioeu/offerra
node scripts/build-legal-html.mjs ../offerra_web
```

`index.html` a `support.html` generuje ten istý skript.
