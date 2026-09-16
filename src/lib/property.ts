/**
 * Dátový model inzerátov (schéma `offerra`) — prenesené z
 * `/root/offerra/src/lib/property.ts` (appka), len ČISTÉ typy a funkcie
 * (bez `./supabase` importu appky, ktorý má AsyncStorage). Stĺpce sú
 * snake_case, presne ako v DB — žiadna mapovacia vrstva.
 */
import type { TFunc } from '@/i18n';

export type TransactionType = 'SALE' | 'RENT';
export type PropertyType = 'APARTMENT' | 'HOUSE' | 'LAND' | 'COMMERCIAL' | 'OTHER';
export type PropertyStatus = 'DRAFT' | 'ACTIVE' | 'REJECTED' | 'ARCHIVED' | 'CLOSED';

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
