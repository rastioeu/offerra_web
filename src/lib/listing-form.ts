/**
 * Formulár inzerátu ako DÁTA — prenesené z
 * `/root/offerra/src/lib/listing-form.ts` (appka), bez zmeny logiky.
 * Číselné polia sú ZÁMERNE text, nie čísla — zmazanie posledného znaku by
 * číselné pole vynulovalo na 0 a používateľ by prišiel o rozpísanú
 * hodnotu. Prevod robí `num()` až pri ukladaní.
 */
import type { Furnishing, Property, PropertyType, TransactionType, Utilities } from "./property";

export type ListingForm = {
  transaction_type: TransactionType;
  property_type: PropertyType;
  title: string;
  description: string;
  city: string | null;
  district: string | null;
  region: string | null;
  street: string;
  latitude: number | null;
  longitude: number | null;
  offer_deadline: string | null;

  rooms: string;
  area: string;
  price: string;

  floor: string;
  floorsTotal: string;
  monthlyCosts: string;
  hasElevator: boolean | null;

  deposit: string;
  depositMonths: string;
  availableFrom: string | null;
  minLease: string;
  furnishing: Furnishing | null;
  utilities: Utilities | null;
  internet: boolean | null;
  pets: boolean | null;
};

export function num(text: string): number | null {
  const cleaned = text.replace(",", ".").trim();
  if (cleaned === "") return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function text(n: number | null | undefined): string {
  return n != null ? String(n) : "";
}

export function formFromProperty(p: Property): ListingForm {
  return {
    transaction_type: p.transaction_type,
    property_type: p.property_type,
    title: p.title ?? "",
    description: p.description ?? "",
    city: p.city,
    district: p.district,
    region: p.region,
    street: p.street ?? "",
    latitude: p.latitude,
    longitude: p.longitude,
    offer_deadline: p.offer_deadline,

    rooms: text(p.rooms),
    area: text(p.area_m2),
    price: text(p.asking_price_hint),

    floor: text(p.floor),
    floorsTotal: text(p.floors_total),
    monthlyCosts: text(p.monthly_costs),
    hasElevator: p.has_elevator,

    deposit: text(p.deposit_amount),
    depositMonths: text(p.deposit_months),
    availableFrom: p.available_from,
    minLease: text(p.min_lease_months),
    furnishing: p.furnishing,
    utilities: p.utilities_included,
    internet: p.internet_included,
    pets: p.pets_allowed,
  };
}

/** Formulár → to, čo ide do `update`. Rovnaká logika ako appka: prepnutie
 * predaj/prenájom alebo byt/iné zahodí polia, ktoré tam nepatria. */
export function formToPatch(f: ListingForm): Partial<Property> {
  const isRent = f.transaction_type === "RENT";
  const isFlat = f.property_type === "APARTMENT";
  return {
    transaction_type: f.transaction_type,
    property_type: f.property_type,
    title: f.title,
    description: f.description.trim() || null,
    city: f.city,
    district: f.district,
    region: f.region,
    street: f.street.trim() || null,
    latitude: f.latitude,
    longitude: f.longitude,
    offer_deadline: f.offer_deadline,
    rooms: num(f.rooms),
    area_m2: num(f.area),
    asking_price_hint: num(f.price),
    deposit_amount: isRent ? num(f.deposit) : null,
    deposit_months: isRent ? num(f.depositMonths) : null,
    available_from: isRent ? f.availableFrom : null,
    min_lease_months: isRent ? num(f.minLease) : null,
    furnishing: isRent ? f.furnishing : null,
    utilities_included: isRent ? f.utilities : null,
    internet_included: isRent ? f.internet : null,
    pets_allowed: isRent ? f.pets : null,
    floor: isFlat ? num(f.floor) : null,
    floors_total: isFlat ? num(f.floorsTotal) : null,
    has_elevator: isFlat ? f.hasElevator : null,
    monthly_costs: isFlat ? num(f.monthlyCosts) : null,
  };
}

export function formToCandidate(base: Property, f: ListingForm): Property {
  return { ...base, ...(formToPatch(f) as Partial<Property>) } as Property;
}

/**
 * POVINNÉ POLIA pre zverejnenie — appka: typ obchodu/nehnuteľnosti tu
 * nie sú (nedajú sa nechať prázdne), kraj/ulica/cena sú nepovinné.
 */
export function missingForPublish(
  t: (key: string) => string,
  p: Property,
  photoCount: number
): string[] {
  const missing: string[] = [];
  if (!p.title.trim()) missing.push(t("listingForm.missingTitle"));
  if (!p.city) missing.push(t("listingForm.missingCity"));
  if (p.property_type !== "LAND" && p.rooms == null) missing.push(t("listingForm.missingRooms"));
  if (p.area_m2 == null) missing.push(t("listingForm.missingArea"));
  if (photoCount < 1) missing.push(t("listingForm.missingPhoto"));
  return missing;
}
