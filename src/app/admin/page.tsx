import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { resolveReport } from "@/app/admin/actions";
import { fetchAdminStats, fetchReports } from "@/lib/admin-data";
import { getReportReasonLabel, getReportStatusLabel } from "@/lib/report";
import { createClient } from "@/lib/supabase/server";
import { t } from "@/i18n";

export const metadata: Metadata = {
  title: "Správa",
};

const STAT_LABELS: { key: keyof Awaited<ReturnType<typeof fetchAdminStats>>; label: string }[] = [
  { key: "inzeraty_aktivne", label: "Aktívne inzeráty" },
  { key: "inzeraty_spolu", label: "Inzeráty spolu" },
  { key: "ponuky", label: "Ponuky" },
  { key: "dopyty", label: "Dopyty" },
  { key: "pouzivatelia", label: "Používatelia" },
  { key: "zablokovani", label: "Zablokovaní" },
  { key: "nahlasenia_otvorene", label: "Otvorené nahlásenia" },
];

/**
 * Admin konzola — ZATIAĽ len prehľad a nahlásenia (Fáza 6, časť).
 * Skrytie za prihlásením je pohodlie, nie ochrana — skutočná ochrana je
 * `offerra.is_admin()` V DATABÁZE (presne ako appka): bežnému účtu
 * `admin_stats` vráti chybu, tá sa tu vyhodnotí ako „nemáš prístup",
 * nie ako pád stránky.
 */
export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/admin");

  let stats;
  let reports;
  try {
    [stats, reports] = await Promise.all([fetchAdminStats(), fetchReports()]);
  } catch {
    return (
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-2 px-4 py-16 text-center">
        <h1 className="text-xl font-bold text-text-primary">Nemáš prístup</h1>
        <p className="text-text-muted">Táto stránka je len pre správcov.</p>
      </main>
    );
  }

  const reasonLabel = getReportReasonLabel(t);
  const statusLabel = getReportStatusLabel(t);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-text-primary">Správa</h1>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {STAT_LABELS.map(({ key, label }) => (
          <div key={key} className="rounded-2xl border border-border bg-surface p-4">
            <div className="text-2xl font-bold text-text-primary">{stats[key]}</div>
            <div className="text-sm text-text-muted">{label}</div>
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-text-primary">Nahlásenia</h2>
        {reports.length === 0 ? (
          <p className="text-text-muted">Žiadne nahlásenia.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {reports.map((report) => (
              <div key={report.id} className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold text-text-primary">
                    {reasonLabel[report.reason as keyof typeof reasonLabel] ?? report.reason} ·{" "}
                    {report.target_type}
                  </span>
                  <span className="rounded-full bg-surface-pressed px-2 py-0.5 text-xs font-medium text-text-secondary">
                    {statusLabel[report.status as keyof typeof statusLabel] ?? report.status}
                  </span>
                </div>
                {report.note ? <p className="text-sm text-text-secondary">{report.note}</p> : null}
                <p className="text-xs text-text-muted">Cieľ: {report.target_id}</p>

                {report.status === "PENDING" ? (
                  <div className="flex gap-2 pt-1">
                    <form action={resolveReport.bind(null, report.id, false)}>
                      <button
                        type="submit"
                        className="rounded-xl border border-border-strong bg-surface px-3 py-1.5 text-sm font-medium text-text-primary hover:bg-surface-pressed"
                      >
                        Vybaviť
                      </button>
                    </form>
                    <form action={resolveReport.bind(null, report.id, true)}>
                      <button
                        type="submit"
                        className="rounded-xl border border-danger bg-surface px-3 py-1.5 text-sm font-medium text-danger hover:bg-danger/10"
                      >
                        Skryť inzerát a vybaviť
                      </button>
                    </form>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
