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
