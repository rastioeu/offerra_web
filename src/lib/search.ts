/**
 * Rozumenie slovenskej otázke — prenesené 1:1 z
 * `/root/offerra/src/lib/search.ts` (appka), čistý modul bez zmeny
 * logiky. Slovenské skloňovanie/diakritika MUSÍ dávať rovnaký výsledok
 * ako v appke a v DB (`offerra.norm()`) — je to jeden zdroj pravidiel,
 * nie kópia, ktorá sa časom rozíde.
 */
import type { TFunc } from '@/i18n';

import { getDemandLabel, getPropertyLabel, getTransactionLabel } from './labels';
import type { PropertyType, TransactionType } from './property';

export type FilterSide = 'PROPERTY' | 'DEMAND';

export type CatalogFilter = {
  text: string | null;
  transaction: TransactionType | null;
  propertyType: PropertyType | null;
  city: string | null;
  priceMin: number | null;
  priceMax: number | null;
  roomsMin: number | null;
  areaMin: number | null;
  onlyFavorites: true | null;
};

export const EMPTY_FILTER: CatalogFilter = {
  text: null,
  transaction: null,
  propertyType: null,
  city: null,
  priceMin: null,
  priceMax: null,
  roomsMin: null,
  areaMin: null,
  onlyFavorites: null,
};

export function isFilterEmpty(f: CatalogFilter): boolean {
  return (Object.keys(EMPTY_FILTER) as (keyof CatalogFilter)[]).every((k) => f[k] == null);
}

export function normalizeText(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

const SK_ENDINGS = [
  'iach', 'ach', 'ami', 'ovi', 'ove', 'ova', 'ymi', 'ych', 'ich', 'emu', 'eho',
  'iam', 'om', 'ou', 'ej', 'mi', 'ch', 'im', 'ym', 'am', 'ie',
  'a', 'e', 'i', 'o', 'u', 'y',
];

export const MIN_STEM = 4;

export function stemSk(word: string): string {
  const w = normalizeText(word);
  if (w.length <= MIN_STEM) return w;
  for (const end of SK_ENDINGS) {
    if (w.endsWith(end) && w.length - end.length >= MIN_STEM) {
      return w.slice(0, w.length - end.length);
    }
  }
  return w;
}

export function stemQuery(text: string): string {
  return normalizeText(text)
    .split(/\s+/)
    .filter(Boolean)
    .map(stemSk)
    .join(' ');
}

const TRANSACTION_WORDS: [RegExp, TransactionType][] = [
  [/\b(prenaj|najom|najm|podnaj)/, 'RENT'],
  [/\b(predaj|predam|kupa|kupit|kupim|na predaj)/, 'SALE'],
];

const TYPE_WORDS: [RegExp, PropertyType][] = [
  [/\b(byt|garsonk|garzonk|mezonet)/, 'APARTMENT'],
  [/\b(dom|chat|vil|chalup|novostavb)/, 'HOUSE'],
  [/\b(pozemok|pozemk|parcel|zahrad(a|u)\b|orn)/, 'LAND'],
  [/\b(priestor|kancelari|obchod|komerc|prevadzk|sklad)/, 'COMMERCIAL'],
];

const ROOM_WORDS: [RegExp, number][] = [
  [/\bgarsonk|garzonk/, 1],
  [/\bjednoizb/, 1],
  [/\bdvojizb/, 2],
  [/\btrojizb/, 3],
  [/\bstvorizb/, 4],
  [/\bpatizb|pätizb/, 5],
];

function scale(value: number, suffix: string): number {
  if (/^(tis|tisic)/.test(suffix)) return value * 1000;
  if (/^(mil|milion)/.test(suffix)) return value * 1_000_000;
  return value;
}

export type Parsed = {
  filter: CatalogFilter;
  understood: string[];
  cityGuess: string | null;
  cityCandidates: string[];
};

export function parseQuery(raw: string): Parsed {
  const f: CatalogFilter = { ...EMPTY_FILTER };
  const understood: string[] = [];
  let s =
    ' ' +
    normalizeText(raw)
      .replace(/(\d),(\d)/g, '$1.$2')
      .replace(/[,;]/g, ' ')
      .replace(/\.(?!\d)/g, ' ')
      .replace(/\s+/g, ' ') +
    ' ';

  const eat = (re: RegExp) => {
    s = s.replace(re, ' ');
  };

  for (const [re, v] of TRANSACTION_WORDS) {
    if (re.test(s)) {
      f.transaction = v;
      understood.push(v === 'RENT' ? 'prenájom' : 'predaj');
      eat(new RegExp(re.source + '\\w*', 'g'));
      break;
    }
  }

  for (const [re, v] of TYPE_WORDS) {
    if (re.test(s)) {
      f.propertyType = v;
      understood.push(
        v === 'APARTMENT' ? 'byt' : v === 'HOUSE' ? 'dom' : v === 'LAND' ? 'pozemok' : 'komerčný priestor'
      );
      eat(new RegExp(re.source + '\\w*', 'g'));
      break;
    }
  }

  for (const [re, n] of ROOM_WORDS) {
    if (re.test(s)) {
      f.roomsMin = n;
      understood.push(`${n} izb.`);
      eat(new RegExp(re.source + '\\w*', 'g'));
      break;
    }
  }

  const rooms = s.match(/\b(\d)\s*-?\s*izb\w*/);
  if (rooms && f.roomsMin == null) {
    f.roomsMin = Number(rooms[1]);
    understood.push(`${rooms[1]} izb.`);
    eat(/\b\d\s*-?\s*izb\w*/g);
  }

  const area = s.match(/\b(?:od|nad|aspon|min)?\s*(\d{1,5})\s*(?:m2|m²|metrov)\b/);
  if (area) {
    f.areaMin = Number(area[1]);
    understood.push(`od ${area[1]} m²`);
    eat(/\b(?:od|nad|aspon|min)?\s*\d{1,5}\s*(?:m2|m²|metrov)\b/g);
  }

  const NUM = '(\\d+(?:\\.\\d+)?(?:\\s\\d{3})*)\\s*(tis\\w*|mil\\w*)?\\s*(?:eur|€)?';

  const upTo = s.match(new RegExp('\\b(?:do|max|maximalne|pod)\\s+' + NUM));
  if (upTo) {
    f.priceMax = scale(Number(upTo[1].replace(/\s/g, '')), upTo[2] ?? '');
    understood.push(`do ${f.priceMax.toLocaleString('sk-SK')} €`);
    eat(new RegExp('\\b(?:do|max|maximalne|pod)\\s+' + NUM, 'g'));
  }

  const from = s.match(new RegExp('\\b(?:od|nad|min|aspon)\\s+' + NUM));
  if (from) {
    f.priceMin = scale(Number(from[1].replace(/\s/g, '')), from[2] ?? '');
    understood.push(`od ${f.priceMin.toLocaleString('sk-SK')} €`);
    eat(new RegExp('\\b(?:od|nad|min|aspon)\\s+' + NUM, 'g'));
  }

  if (f.priceMax == null && f.priceMin == null) {
    const bare = s.match(new RegExp('\\b' + NUM + '(?=\\s|$)'));
    if (bare) {
      const v = scale(Number(bare[1].replace(/\s/g, '')), bare[2] ?? '');
      if (v >= 200) {
        f.priceMax = v;
        understood.push(`do ${v.toLocaleString('sk-SK')} €`);
        eat(new RegExp('\\b' + NUM + '(?=\\s|$)', 'g'));
      }
    }
  }

  const STOP = new Set([
    'v', 've', 'na', 'pri', 'do', 'od', 'a', 'so', 's', 'z', 'zo', 'okres',
    'okrese', 'meste', 'obci', 'hladam', 'hlada', 'hladaju', 'chcem', 'kupim',
    'kupujem', 'najdi', 'nieco',
    'izb', 'izba', 'izby', 'izieb', 'eur', 'e',
  ]);
  const words = s.split(' ').map((w) => w.trim()).filter((w) => w.length > 1 && !STOP.has(w) && !/^\d+$/.test(w));

  const cityCandidates = [
    ...(words.length > 1 ? [words.join(' ')] : []),
    ...[...words].sort((a, b) => b.length - a.length),
  ];
  f.text = words.length > 0 ? words.join(' ') : null;

  return { filter: f, understood, cityGuess: cityCandidates[0] ?? null, cityCandidates };
}

export function describeFilter(t: TFunc, f: CatalogFilter, side: FilterSide = 'PROPERTY'): string[] {
  const out: string[] = [];
  if (f.onlyFavorites) out.push(t('search.favoritesChip'));
  if (f.transaction) {
    out.push((side === 'DEMAND' ? getDemandLabel(t) : getTransactionLabel(t))[f.transaction]);
  }
  if (f.propertyType) out.push(getPropertyLabel(t)[f.propertyType]);
  if (f.city) out.push(f.city);
  if (f.roomsMin != null) out.push(t('search.roomsMinChip', { count: f.roomsMin }));
  if (f.areaMin != null) out.push(t('search.areaMinChip', { count: f.areaMin }));
  if (f.priceMin != null) {
    out.push(
      t(side === 'DEMAND' ? 'search.priceMinDemandChip' : 'search.priceMinChip', {
        amount: f.priceMin.toLocaleString('sk-SK'),
      })
    );
  }
  if (f.priceMax != null) {
    out.push(
      t(side === 'DEMAND' ? 'search.priceMaxDemandChip' : 'search.priceMaxChip', {
        amount: f.priceMax.toLocaleString('sk-SK'),
      })
    );
  }
  if (f.text) out.push(`„${f.text}"`);
  return out;
}
