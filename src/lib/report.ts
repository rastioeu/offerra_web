/**
 * Nahlasovanie obsahu — prenesené z `/root/offerra/src/lib/report.ts`
 * (appka), len typy a štítky potrebné pre admin konzolu.
 */
import type { TFunc } from '@/i18n';

export type ReportReason = 'SPAM' | 'PODVOD' | 'NEVHODNY_OBSAH' | 'FALOSNY_INZERAT' | 'REALITKA' | 'INE';
export type ReportStatus = 'PENDING' | 'REVIEWED' | 'ACTIONED' | 'DISMISSED';

export function getReportReasonLabel(t: TFunc): Record<ReportReason, string> {
  return {
    FALOSNY_INZERAT: t('report.reasonFakeListing'),
    REALITKA: t('report.reasonAgency'),
    PODVOD: t('report.reasonFraud'),
    SPAM: t('report.reasonSpam'),
    NEVHODNY_OBSAH: t('report.reasonInappropriate'),
    INE: t('report.reasonOther'),
  };
}

export function getReportStatusLabel(t: TFunc): Record<ReportStatus, string> {
  return {
    PENDING: t('report.statusPending'),
    REVIEWED: t('report.statusReviewed'),
    ACTIONED: t('report.statusActioned'),
    DISMISSED: t('report.statusDismissed'),
  };
}
