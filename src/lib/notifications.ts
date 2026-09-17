/**
 * Typ notifikácie — port appkového `src/lib/notifications.ts`
 * (`NotificationType`). Preferencie/frekvencia (appka ich má v
 * Nastaveniach) sú mimo rozsahu tejto fázy — web zatiaľ len ZOBRAZUJE
 * oznámenia (zvonček), nemení, čo appka posiela.
 */
export type NotificationType =
  | 'NOVA_PONUKA'
  | 'PONUKA_AKCEPTOVANA'
  | 'PONUKA_ZAMIETNUTA'
  | 'PONUKA_EXPIROVANA'
  | 'NOVY_DOPYT_ZODPOVEDA_INZERATU'
  | 'OSLOVENIE_DOPYTU'
  | 'NOVA_ZHODA'
  | 'ZIADOST_O_OBHLIADKU'
  | 'OBHLIADKA_POTVRDENA'
  | 'OBHLIADKA_ZAMIETNUTA'
  | 'NOVA_SPRAVA'
  | 'SYSTEMOVE';
