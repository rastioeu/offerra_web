/**
 * Čo sa má o cene a ponukách napísať — prenesené 1:1 z
 * `/root/offerra/src/lib/price-display.ts` (appka), čistá funkcia bez zmeny
 * logiky.
 *
 * PREČO TOTO NA WEBE CHÝBALO (Rastio, 17.9.2026): karta v katalógu ukazovala
 * len JEDNO číslo (orientačnú cenu, alebo „Cena na dohodu") — vyzeralo to
 * ako bežný realitný portál s pevnou cenou. Appka pritom rozlišuje
 * ORIENTAČNÚ CENU od NAJVYŠŠEJ PONUKY, čo je jadro celého konceptu Offerra
 * (reverzný trh — kupujúci ponúkajú, nie predávajúci diktuje). Bez tohto
 * modulu web to nemal ako zobraziť.
 */
import type { TFunc } from '@/i18n';

export type PriceDisplay = {
  /** Orientačná cena predávajúceho, ak ju uviedol. */
  asking: number | null;
  /** Najvyššia ŽIVÁ ponuka (PENDING alebo ACCEPTED). */
  topOffer: number | null;
  /** Počet živých ponúk. */
  offerCount: number;
  /** Čo je hlavné číslo na obrazovke. */
  headline: 'ASKING' | 'TOP_OFFER' | 'NONE';
  /** Text pod hlavným číslom. `null` = nič nepíš. */
  note: string | null;
};

export function priceDisplay(
  t: TFunc,
  asking: number | null,
  topOffer: number | null,
  offerCount: number
): PriceDisplay {
  const hasOffers = offerCount > 0 && topOffer != null;

  if (asking == null && !hasOffers) {
    return { asking, topOffer, offerCount, headline: 'NONE', note: t('priceDisplay.noPriceNoOffers') };
  }

  if (asking == null && hasOffers) {
    return { asking, topOffer, offerCount, headline: 'TOP_OFFER', note: t('priceDisplay.noPriceGiven') };
  }

  if (asking != null && !hasOffers) {
    return { asking, topOffer, offerCount, headline: 'ASKING', note: t('priceDisplay.indicative') };
  }

  // Cena aj ponuky — hlavné číslo je PONUKA, orientačná cena vedľa
  // (mockup „Dôveryhodne teplá", schválené 8.8.2026: skutočná ponuka je
  // dôležitejšia než želanie predávajúceho).
  return { asking, topOffer, offerCount, headline: 'TOP_OFFER', note: t('priceDisplay.indicative') };
}

/**
 * „2 ponuky" so správnym tvarom. `null` keď niet čo písať.
 */
export function offerCountLabel(t: TFunc, language: string, n: number): string | null {
  if (n <= 0) return null;
  if (language === 'sk') {
    const key = n === 1 ? 'offerCountOne' : n < 5 ? 'offerCountFew' : 'offerCountMany';
    return t(`priceDisplay.${key}`, { count: n });
  }
  return t(n === 1 ? 'priceDisplay.offerCountOne' : 'priceDisplay.offerCountMany', { count: n });
}
