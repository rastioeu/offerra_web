/**
 * Slová pre typ obchodu a typ nehnuteľnosti — prenesené 1:1 z
 * `/root/offerra/src/lib/labels.ts` (appka), čistý modul, žiadna zmena.
 */
import type { TFunc } from '@/i18n';
import type { PropertyType, TransactionType } from './property';

export function getTransactionLabel(t: TFunc): Record<TransactionType, string> {
  return { SALE: t('labels.transactionSale'), RENT: t('labels.transactionRent') };
}

export function getPropertyLabel(t: TFunc): Record<PropertyType, string> {
  return {
    APARTMENT: t('labels.propertyApartment'),
    HOUSE: t('labels.propertyHouse'),
    LAND: t('labels.propertyLand'),
    COMMERCIAL: t('labels.propertyCommercial'),
    OTHER: t('labels.propertyOther'),
  };
}
