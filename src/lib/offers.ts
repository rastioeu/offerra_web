/**
 * Ponuky a dopyty — prenesené z `/root/offerra/src/lib/offers.ts` (appka),
 * len ČISTÉ typy/funkcie (bez `./supabase` importu). Ponuky sú „otvorené,
 * ale pseudonymné" (Rastio, 7.8.2026) — meno a telefón sú chránené
 * stĺpcovými grantmi v DB, nie appkou.
 */
import type { TFunc } from '@/i18n';

export type OfferStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN' | 'EXPIRED';
export type RequestStatus = 'ACTIVE' | 'FULFILLED' | 'EXPIRED' | 'CLOSED';

export type PublicBidder = { nickname: string; avatar_url: string | null };

export type Offer = {
  id: string;
  property_id: string;
  bidder_id: string;
  amount: number;
  message: string | null;
  status: OfferStatus;
  valid_until: string | null;
  created_at: string;
  updated_at: string;
  viewed_by_owner_at: string | null;
  bidder?: PublicBidder | null;
};

export type BuyerRequest = {
  id: string;
  user_id: string;
  transaction_type: 'SALE' | 'RENT';
  property_type: string | null;
  city: string | null;
  district: string | null;
  region: string | null;
  budget_min: number | null;
  budget_max: number | null;
  rooms_min: number | null;
  area_min: number | null;
  description: string | null;
  status: RequestStatus;
  is_seed: boolean;
  created_at: string;
  author?: PublicBidder | null;
};

/** Oslovenie dopytu vlastným inzerátom. */
export type Outreach = {
  id: string;
  request_id: string;
  property_id: string;
  from_id: string;
  message: string | null;
  created_at: string;
};

/**
 * Oslovenie MÔJHO dopytu aj s inzerátom, ktorý mi ponúkajú — appka:
 * `offerra.my_request_outreach()` (SECURITY DEFINER, obmedzí výber na
 * dopyty volajúceho priamo v `where`).
 */
export type MyOutreach = {
  id: string;
  request_id: string;
  property_id: string;
  from_id: string;
  from_nickname: string | null;
  message: string | null;
  created_at: string;
  property_title: string | null;
  property_city: string | null;
  property_price: number | null;
  property_top_offer: number | null;
  property_rooms: number | null;
  property_area: number | null;
  property_status: string | null;
  request_description: string | null;
};

/**
 * Stĺpce ponuky, ktoré smie čítať ktokoľvek — ZÁMERNE bez `message`
 * (nemá naň grant ani `anon`, ani `authenticated`) a ZÁMERNE nie `*`,
 * aby budúci citlivý stĺpec neunikol ticho.
 */
export const OFFER_PUBLIC_COLS =
  'id, property_id, bidder_id, amount, status, valid_until, created_at, updated_at, viewed_by_owner_at';

export function getOfferStatusLabel(t: TFunc): Record<OfferStatus, string> {
  return {
    PENDING: t('offers.statusPending'),
    ACCEPTED: t('offers.statusAccepted'),
    REJECTED: t('offers.statusRejected'),
    WITHDRAWN: t('offers.statusWithdrawn'),
    EXPIRED: t('offers.statusExpired'),
  };
}

export function getRequestStatusLabel(t: TFunc): Record<RequestStatus, string> {
  return {
    ACTIVE: t('offers.requestStatusActive'),
    FULFILLED: t('offers.requestStatusFulfilled'),
    EXPIRED: t('offers.requestStatusExpired'),
    CLOSED: t('offers.requestStatusClosed'),
  };
}

export function formatAmount(t: TFunc, value: number, transaction: 'SALE' | 'RENT'): string {
  const amount = new Intl.NumberFormat('sk-SK', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value);
  return transaction === 'RENT' ? t('property.priceMonthly', { amount }) : amount;
}

export function formatBudget(t: TFunc, min: number | null, max: number | null): string {
  const f = (v: number) =>
    new Intl.NumberFormat('sk-SK', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v);
  if (min != null && max != null) return `${f(min)} – ${f(max)}`;
  if (max != null) return t('offers.budgetUpTo', { amount: f(max) });
  if (min != null) return t('offers.budgetFrom', { amount: f(min) });
  return t('offers.budgetNotGiven');
}
