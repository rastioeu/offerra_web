/**
 * Typy pre admin konzolu — prenesené z `/root/offerra/src/lib/admin.ts`
 * (appka). Skutočná ochrana je v databáze (`offerra.is_admin()`), nie
 * tu — každá RPC bežnému účtu vráti chybu alebo prázdno, presne ako
 * v appke.
 */
export type AdminStats = {
  inzeraty_aktivne: number;
  inzeraty_spolu: number;
  ponuky: number;
  dopyty: number;
  pouzivatelia: number;
  zablokovani: number;
  nahlasenia_otvorene: number;
};

export type ReportRow = {
  id: string;
  reporter_id: string;
  target_type: 'PROPERTY' | 'USER' | 'OFFER';
  target_id: string;
  reason: string;
  note: string | null;
  status: string;
  created_at: string;
};

/**
 * Podozriví používatelia — TRI vzorce, LEN signály na ručnú kontrolu
 * (appka nikoho neblokuje sama). Prenesené z appkového `(tabs)/admin.tsx`.
 */
export type SuspiciousFlood = {
  user_id: string;
  nickname: string;
  pocet_inzeratov: number;
  pocet_ponuk: number;
  is_blocked: boolean;
};
export type SuspiciousLowball = {
  user_id: string;
  nickname: string;
  pocet_nizkych: number;
  priemerny_pomer: number;
  is_blocked: boolean;
};
export type SuspiciousShill = {
  bidder_id: string;
  bidder_nickname: string;
  owner_id: string;
  owner_nickname: string;
  pocet_inzeratov: number;
};
export type DuplicateContact = { kind: string; value: string; accounts: number; nicknames: string };

/** Nastaviteľný prah — appka: `ConfigRow` (`app_config` tabuľka). */
export type ConfigRow = { key: string; value: string; label: string; hint: string | null };

/** Upozornenie — TRAJA rôzni nahlasovatelia na to isté (PODVOD už pri prvom). */
export type Alert = { target_type: string; target_id: string; nahlaseni: number; dovody: string; naliehave: boolean };

/** Tri a viac POTVRDENÝCH nahlásení na tú istú osobu, cez všetky jej inzeráty/ponuky. */
export type RepeatOffender = { user_id: string; nickname: string; potvrdene: number; dovody: string; blokovany: boolean };

/** Kto má najviac inzerátov — podnet na pozretie, nie obvinenie. */
export type TopLister = {
  user_id: string;
  nickname: string;
  email: string;
  active_count: number;
  total_count: number;
  agent_declared_at: string | null;
  is_blocked: boolean;
};

export type AdminUser = {
  id: string;
  nickname: string;
  email: string;
  role: 'USER' | 'ADMIN';
  is_blocked: boolean;
  inzeraty: number;
  created_at: string;
  verified_at: string | null;
  verified_note: string | null;
};
