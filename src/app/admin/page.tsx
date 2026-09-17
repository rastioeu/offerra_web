import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { resolveReport, setUserBlocked } from "@/app/admin/actions";
import { AdminUserActions } from "@/components/admin-user-actions";
import { fetchAdminStats, fetchAdminUsers, fetchReports, fetchSuspiciousPatterns } from "@/lib/admin-data";
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
  let users;
  let suspicious;
  try {
    [stats, reports, users, suspicious] = await Promise.all([
      fetchAdminStats(),
      fetchReports(),
      fetchAdminUsers(),
      fetchSuspiciousPatterns(),
    ]);
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

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-text-primary">Používatelia</h2>
        <div className="flex flex-col gap-3">
          {users.map((u) => (
            <div key={u.id} className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-text-primary">{u.nickname}</span>
                  {u.role === "ADMIN" ? (
                    <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent-deep">ADMIN</span>
                  ) : null}
                  {u.verified_at ? (
                    <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">OVERENÝ</span>
                  ) : null}
                  {u.is_blocked ? (
                    <span className="rounded-full bg-danger/10 px-2 py-0.5 text-xs font-medium text-danger">Zablokovaný</span>
                  ) : null}
                </div>
                <span className="text-sm text-text-muted">{u.email}</span>
                <span className="text-xs text-text-muted">{u.inzeraty} inzerátov</span>
                {u.verified_note ? (
                  <span className="text-xs text-text-muted">Overené: {u.verified_note}</span>
                ) : null}
              </div>
              {u.id !== user.id ? (
                <div className="flex flex-wrap items-center gap-2">
                  <AdminUserActions
                    userId={u.id}
                    nickname={u.nickname}
                    isVerified={u.verified_at != null}
                    isAdmin={u.role === "ADMIN"}
                  />
                  <form action={setUserBlocked.bind(null, u.id, !u.is_blocked)}>
                    <button
                      type="submit"
                      className={
                        u.is_blocked
                          ? "rounded-xl border border-border-strong bg-surface px-3 py-1.5 text-sm font-medium text-text-primary hover:bg-surface-pressed"
                          : "rounded-xl border border-danger bg-surface px-3 py-1.5 text-sm font-medium text-danger hover:bg-danger/10"
                      }
                    >
                    {u.is_blocked ? "Odblokovať" : "Zablokovať"}
                  </button>
                  </form>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-text-primary">Podozrivé vzorce</h2>
        <p className="text-sm text-text-muted">
          Len signály na ručnú kontrolu — appka ani web nikoho neblokuje sám.
        </p>

        {suspicious.floods.length > 0 ? (
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
              Záplava ponúk ({suspicious.floods.length})
            </h3>
            {suspicious.floods.map((f) => (
              <div key={f.user_id} className="flex items-center justify-between gap-2 rounded-xl border border-border bg-surface p-3 text-sm">
                <span className="font-medium text-text-primary">
                  {f.nickname} {f.is_blocked ? <span className="text-danger">(zablokovaný)</span> : null}
                </span>
                <span className="text-text-muted">
                  {f.pocet_inzeratov} rôznych inzerátov · {f.pocet_ponuk} ponúk
                </span>
              </div>
            ))}
          </div>
        ) : null}

        {suspicious.lowballs.length > 0 ? (
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
              Opakovane nízke ponuky ({suspicious.lowballs.length})
            </h3>
            {suspicious.lowballs.map((l) => (
              <div key={l.user_id} className="flex items-center justify-between gap-2 rounded-xl border border-border bg-surface p-3 text-sm">
                <span className="font-medium text-text-primary">
                  {l.nickname} {l.is_blocked ? <span className="text-danger">(zablokovaný)</span> : null}
                </span>
                <span className="text-text-muted">
                  {l.pocet_nizkych} nízkych ponúk · priemerne {Math.round(l.priemerny_pomer * 100)} % ceny
                </span>
              </div>
            ))}
          </div>
        ) : null}

        {suspicious.shills.length > 0 ? (
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
              Opakovane ponúka tomu istému vlastníkovi ({suspicious.shills.length})
            </h3>
            {suspicious.shills.map((s) => (
              <div key={`${s.bidder_id}-${s.owner_id}`} className="flex items-center justify-between gap-2 rounded-xl border border-border bg-surface p-3 text-sm">
                <span className="font-medium text-text-primary">{s.bidder_nickname}</span>
                <span className="text-text-muted">
                  → vlastníkovi {s.owner_nickname} na {s.pocet_inzeratov} rôznych inzerátoch
                </span>
              </div>
            ))}
          </div>
        ) : null}

        {suspicious.duplicates.length > 0 ? (
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
              Rovnaký kontakt na viacerých účtoch ({suspicious.duplicates.length})
            </h3>
            {suspicious.duplicates.map((d) => (
              <div key={`${d.kind}-${d.value}`} className="flex items-center justify-between gap-2 rounded-xl border border-border bg-surface p-3 text-sm">
                <span className="font-medium text-text-primary">
                  {d.kind === "phone" ? "Telefón" : "E-mail"}: {d.value}
                </span>
                <span className="text-text-muted">
                  {d.accounts} účty · {d.nicknames}
                </span>
              </div>
            ))}
          </div>
        ) : null}

        {suspicious.floods.length === 0 &&
        suspicious.lowballs.length === 0 &&
        suspicious.shills.length === 0 &&
        suspicious.duplicates.length === 0 ? (
          <p className="text-text-muted">Nič také sa nenašlo.</p>
        ) : null}
      </section>
    </main>
  );
}
