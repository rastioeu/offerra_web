/**
 * Dátový model inzerátov (schéma `offerra`) — prenesené z
 * `/root/offerra/src/lib/property.ts` (appka), len ČISTÉ typy a funkcie
 * (bez `./supabase` importu appky, ktorý má AsyncStorage). Stĺpce sú
 * snake_case, presne ako v DB — žiadna mapovacia vrstva.
 */
import type { TFunc } from '@/i18n';
import { deadlineUrgency } from './deadline';

export type TransactionType = 'SALE' | 'RENT';
export type PropertyType = 'APARTMENT' | 'HOUSE' | 'LAND' | 'COMMERCIAL' | 'OTHER';
export type PropertyStatus = 'DRAFT' | 'ACTIVE' | 'REJECTED' | 'ARCHIVED' | 'CLOSED';
export type Furnishing = 'FURNISHED' | 'PARTIAL' | 'UNFURNISHED';
export type Utilities = 'YES' | 'NO' | 'PARTIAL';

export type Property = {
  id: string;
  owner_id: string;
  transaction_type: TransactionType;
  property_type: PropertyType;
  status: PropertyStatus;
  title: string;
  description: string | null;
  city: string | null;
  district: string | null;
  region: string | null;
  street: string | null;
  address_hidden: boolean;
  latitude: number | null;
  longitude: number | null;
  area_m2: number | null;
  rooms: number | null;
  asking_price_hint: number | null;
  offer_deadline: string | null;
  floor: number | null;
  floors_total: number | null;
  has_elevator: boolean | null;
  monthly_costs: number | null;
  deposit_amount: number | null;
  deposit_months: number | null;
  available_from: string | null;
  min_lease_months: number | null;
  furnishing: Furnishing | null;
  utilities_included: Utilities | null;
  internet_included: boolean | null;
  pets_allowed: boolean | null;
  /** Kedy vlastník obchod uzavrel. `null` = beží ďalej. */
  closed_at: string | null;
  /** Víťazná ponuka. `null` znamená obchod uzavretý mimo Offerry. */
  closed_offer_id: string | null;
  /** Suma, za ktorú sa to naozaj stalo — nemusí sedieť s ponukou. */
  final_amount: number | null;
  view_count: number;
  is_seed: boolean;
  created_at: string;
  updated_at: string;
};

export type Media = {
  id: string;
  property_id: string;
  url: string;
  sort_order: number;
  created_at: string;
};

export type PropertyWithMedia = Property & {
  media: Media[];
};

/** Rovnaká i18n cesta ako appka (`property.priceMonthly`). */
export function formatPrice(t: TFunc, value: number | null, transaction: TransactionType): string | null {
  if (value == null) return null;
  const amount = new Intl.NumberFormat('sk-SK', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value);
  return transaction === 'RENT' ? t('property.priceMonthly', { amount }) : amount;
}

/** „3 izby" so správnym skloňovaním — SK má tri tvary, appka rovnako. */
export function formatRooms(t: TFunc, language: string, value: number | null): string | null {
  if (value == null) return null;
  if (language === 'sk') {
    const key = value === 1 ? 'roomsOne' : value < 5 ? 'roomsFew' : 'roomsMany';
    return t(`property.${key}`, { count: value });
  }
  return t(value === 1 ? 'property.roomsOne' : 'property.roomsMany', { count: value });
}

export function formatArea(value: number | null): string | null {
  return value == null ? null : `${new Intl.NumberFormat('sk-SK').format(value)} m²`;
}

/** „Predané" alebo „Prenajaté" — podľa toho, o aký obchod išlo. */
export function closedLabel(t: TFunc, transaction: TransactionType): string {
  return transaction === 'RENT' ? t('property.closedRent') : t('property.closedSale');
}

export function getStatusLabel(t: TFunc): Record<PropertyStatus, string> {
  return {
    DRAFT: t('property.statusDraft'),
    ACTIVE: t('property.statusActive'),
    REJECTED: t('property.statusRejected'),
    ARCHIVED: t('property.statusArchived'),
    CLOSED: t('property.statusClosed'),
  };
}

function localeTag(language: string): string {
  return language === 'sk' ? 'sk-SK' : language === 'de' ? 'de-DE' : 'en-GB';
}

/** Dátum (s časom v `iso`, ale zobrazí sa len deň) podľa jazyka. */
export function formatDate(language: string, iso: string): string {
  return new Intl.DateTimeFormat(localeTag(language), {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(iso));
}

/** Deň bez času (`YYYY-MM-DD`) naformátovaný podľa jazyka. */
export function formatDay(language: string, day: string | null): string | null {
  if (!day) return null;
  const [y, m, d] = day.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Intl.DateTimeFormat(localeTag(language), {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(y, m - 1, d));
}

export function getFurnishingLabel(t: TFunc): Record<Furnishing, string> {
  return {
    FURNISHED: t('property.furnishingFurnished'),
    PARTIAL: t('property.furnishingPartial'),
    UNFURNISHED: t('property.furnishingUnfurnished'),
  };
}

export function getUtilitiesLabel(t: TFunc): Record<Utilities, string> {
  return { YES: t('property.utilitiesYes'), NO: t('property.utilitiesNo'), PARTIAL: t('property.utilitiesPartial') };
}

/**
 * Vlastnosti BUDOVY — len pre BYT (poschodie, výťah, mesačné náklady).
 * Prenesené 1:1 z appky.
 */
export function buildingRows(t: TFunc, language: string, p: Property): { label: string; value: string }[] {
  if (p.property_type !== 'APARTMENT') return [];
  const rows: { label: string; value: string }[] = [];

  if (p.floor != null) {
    const where =
      p.floor < 0
        ? t('property.basement')
        : p.floor === 0
          ? t('property.groundFloor')
          : t('property.floorN', { n: p.floor });
    rows.push({
      label: t('property.floorLabel'),
      value: p.floors_total != null ? t('property.floorOfTotal', { where, total: p.floors_total }) : where,
    });
  } else if (p.floors_total != null) {
    rows.push({ label: t('property.floorsTotalLabel'), value: String(p.floors_total) });
  }

  if (p.has_elevator != null) {
    rows.push({ label: t('property.elevatorLabel'), value: p.has_elevator ? t('common.yes') : t('common.no') });
  }
  if (p.monthly_costs != null) {
    rows.push({
      label: t('property.monthlyCostsLabel'),
      value: formatPrice(t, p.monthly_costs, 'SALE') ?? '—',
    });
  }
  return rows;
}

/** Vlastnosti PRENÁJMU — zábezpeka, dostupnosť, zariadenie... Prenesené 1:1 z appky. */
export function rentalRows(t: TFunc, language: string, p: Property): { label: string; value: string }[] {
  if (p.transaction_type !== 'RENT') return [];
  const rows: { label: string; value: string }[] = [];

  if (p.deposit_amount != null) {
    const eur = formatPrice(t, p.deposit_amount, 'SALE');
    rows.push({
      label: t('property.depositLabel'),
      value:
        p.deposit_months != null
          ? t('property.depositWithMonths', { amount: eur as string, months: p.deposit_months })
          : (eur as string),
    });
  } else if (p.deposit_months != null) {
    rows.push({ label: t('property.depositLabel'), value: t('property.depositMonthsOnly', { months: p.deposit_months }) });
  }

  const from = formatDay(language, p.available_from);
  if (from) rows.push({ label: t('property.availableFromLabel'), value: from });
  if (p.min_lease_months != null) {
    rows.push({ label: t('property.minLeaseLabel'), value: t('property.monthsCount', { count: p.min_lease_months }) });
  }
  if (p.furnishing) rows.push({ label: t('property.furnishingLabel'), value: getFurnishingLabel(t)[p.furnishing] });
  if (p.utilities_included) {
    rows.push({ label: t('property.utilitiesLabel'), value: getUtilitiesLabel(t)[p.utilities_included] });
  }
  if (p.internet_included != null) {
    rows.push({
      label: t('property.internetLabel'),
      value: p.internet_included ? t('common.yes') : t('common.no'),
    });
  }
  if (p.pets_allowed != null) {
    rows.push({
      label: t('property.petsLabel'),
      value: p.pets_allowed ? t('property.petsAllowed') : t('property.petsNotAllowed'),
    });
  }
  return rows;
}

/** Podľa čoho je katalóg zoradený. */
export type CatalogSort = 'NEWEST' | 'ENDING_SOON';

/**
 * Zoradenie katalógu — prenesené 1:1 z appky. `ENDING_SOON` má TRI
 * skupiny (bežiace, uplynuté, bez termínu), nie dve — inak by `order by
 * offer_deadline asc` dalo hore inzeráty, ktorým termín dávno vypršal.
 */
export function sortProperties<T extends { created_at: string; offer_deadline: string | null }>(
  items: T[],
  sort: CatalogSort
): T[] {
  const byNewest = (a: T, b: T) => (a.created_at < b.created_at ? 1 : a.created_at > b.created_at ? -1 : 0);
  if (sort === 'NEWEST') return [...items].sort(byNewest);

  const bucket = (p: T): number => {
    const u = deadlineUrgency(p.offer_deadline);
    return u === 'NONE' ? 2 : u === 'PASSED' ? 1 : 0;
  };

  return [...items].sort((a, b) => {
    const ba = bucket(a);
    const bb = bucket(b);
    if (ba !== bb) return ba - bb;
    if (ba === 2) return byNewest(a, b);
    const ta = new Date(a.offer_deadline as string).getTime();
    const tb = new Date(b.offer_deadline as string).getTime();
    return ba === 0 ? ta - tb : tb - ta;
  });
}
