import type { Metadata } from "next";
import Link from "next/link";

import { dismissReport, resolveReport, setUserBlocked } from "@/app/[locale]/admin/actions";
import { AdminConfigRow } from "@/components/admin-config-row";
import { AdminPropertyActions } from "@/components/admin-property-actions";
import { AdminUserActions } from "@/components/admin-user-actions";
import { Button } from "@/components/button";
import {
  fetchAdminAttention,
  fetchAdminProperties,
  fetchAdminStats,
  fetchAdminUsers,
  fetchAppConfig,
  fetchReports,
  fetchSuspiciousPatterns,
} from "@/lib/admin-data";
import { getStatusLabel } from "@/lib/property";
import { getReportReasonLabel, getReportStatusLabel } from "@/lib/report";
import { createClient } from "@/lib/supabase/server";
import { getLocale, getT, redirectLocalized } from "@/i18n/server";
import { loginRedirectPath, localizeHref } from "@/i18n/href";

export const metadata: Metadata = {
  title: "Správa",
};

const STAT_LABELS: { key: keyof Awaited<ReturnType<typeof fetchAdminStats>>; label: string; href?: string }[] = [
  { key: "inzeraty_aktivne", label: "Aktívne inzeráty", href: "?propertyStatus=ACTIVE#nehnutelnosti" },
  { key: "inzeraty_spolu", label: "Inzeráty spolu", href: "#nehnutelnosti" },
  { key: "ponuky", label: "Ponuky" },
  { key: "dopyty", label: "Dopyty" },
  { key: "pouzivatelia", label: "Používatelia", href: "#pouzivatelia" },
  { key: "zablokovani", label: "Zablokovaní", href: "?onlyBlocked=1#pouzivatelia" },
  { key: "nahlasenia_otvorene", label: "Otvorené nahlásenia", href: "?onlyPending=1#nahlasenia" },
];

/**
 * Admin konzola — appkovú paritu (Rastio, 18.9.2026: „v admin konzole na
 * webe to nefunguje rovnako ako v iOS appke, daj tam všetky funkcie").
 * Predtým chýbala CELÁ appková sekcia „Nehnuteľnosti" (schváliť/skryť/
 * zmazať inzerát priamo, nie len cez nahlásenie), zamietnutie nahlásenia
 * (dalo sa len vybaviť — čo VŽDY počíta ako potvrdené) a klikacie
 * dlaždice štatistík (appka: ťuknutie vedie do vyfiltrovaného zoznamu).
 * Web je server-rendered stránka bez appkových tabov/lokálneho stavu —
 * filtre preto idú cez `?query=` parametre + kotvy (`#nahlasenia`...),
 * rovnaký vzor ako katalógové filtre (`src/app/[locale]/page.tsx`),
 * nie klientský React state.
 *
 * Skrytie za prihlásením je pohodlie, nie ochrana — skutočná ochrana je
 * `offerra.is_admin()` V DATABÁZE (presne ako appka): bežnému účtu
 * `admin_stats` vráti chybu, tá sa tu vyhodnotí ako „nemáš prístup",
 * nie ako pád stránky.
 */
export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [t, locale] = await Promise.all([getT(), getLocale()]);
  const params = await searchParams;
  const one = (v: string | string[] | undefined) => (typeof v === "string" && v.length > 0 ? v : null);
  const propertyStatusFilter = one(params.propertyStatus);
  const onlyBlocked = one(params.onlyBlocked) === "1";
  const onlyPending = one(params.onlyPending) === "1";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return redirectLocalized(loginRedirectPath(locale, "/admin"));

  let stats;
  let reports;
  let users;
  let suspicious;
  let config;
  let attention;
  let properties;
  try {
    [stats, reports, users, suspicious, config, attention, properties] = await Promise.all([
      fetchAdminStats(),
      fetchReports(),
      fetchAdminUsers(),
      fetchSuspiciousPatterns(),
      fetchAppConfig(),
      fetchAdminAttention(),
      fetchAdminProperties(),
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
  const propertyStatusLabel = getStatusLabel(t);
  const shownProperties = propertyStatusFilter ? properties.filter((p) => p.status === propertyStatusFilter) : properties;
  const shownReports = onlyPending ? reports.filter((r) => r.status === "PENDING") : reports;
  const shownUsers = onlyBlocked ? users.filter((u) => u.is_blocked) : users;

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-text-primary">Správa</h1>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {STAT_LABELS.map(({ key, label, href }) => {
          const tile = (
            <>
              <div className="text-2xl font-bold text-text-primary">{stats[key]}</div>
              <div className="text-sm text-text-muted">{label}</div>
            </>
          );
          return href ? (
            <Link key={key} href={href} className="rounded-2xl border border-border bg-surface p-4 hover:border-border-strong">
              {tile}
            </Link>
          ) : (
            <div key={key} className="rounded-2xl border border-border bg-surface p-4">
              {tile}
            </div>
          );
        })}
      </section>

      {attention.alerts.length > 0 ? (
        <section className="flex flex-col gap-3 rounded-2xl border border-danger bg-danger/5 p-4">
          <h2 className="text-lg font-semibold text-danger">
            {t("admin.needsAttention", { count: attention.alerts.length })}
          </h2>
          <p className="text-xs text-text-muted">{t("admin.needsAttentionHint")}</p>
          <div className="flex flex-col gap-2">
            {attention.alerts.map((a) => (
              <div key={`${a.target_type}-${a.target_id}`} className="flex flex-col gap-1 rounded-xl border border-border bg-surface p-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-text-primary">
                    {a.target_type === "PROPERTY" ? t("admin.targetProperty") : a.target_type === "USER" ? t("admin.targetUser") : t("admin.targetOffer")}
                  </span>
                  {a.naliehave ? (
                    <span className="rounded-full bg-danger px-2 py-0.5 text-xs font-bold text-on-primary">{t("admin.fraudBadge")}</span>
                  ) : null}
                </div>
                <span className="text-text-muted">{a.nahlaseni}× · {a.dovody}</span>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {attention.repeatOffenders.length > 0 ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-text-primary">
            {t("admin.repeatOffenders", { count: attention.repeatOffenders.length })}
          </h2>
          <p className="text-xs text-text-muted">{t("admin.repeatOffendersHint")}</p>
          <div className="flex flex-col gap-2">
            {attention.repeatOffenders.map((r) => (
              <div key={r.user_id} className="flex items-center justify-between gap-2 rounded-xl border border-border bg-surface p-3 text-sm">
                <span className="font-medium text-text-primary">
                  {r.nickname} {r.blokovany ? <span className="text-danger">({t("admin.blockedBadge")})</span> : null}
                </span>
                <span className="text-text-muted">{r.potvrdene}× · {r.dovody}</span>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {attention.topListers.length > 0 ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-text-primary">{t("admin.topListersSection")}</h2>
          <p className="text-xs text-text-muted">{t("admin.topListersHint")}</p>
          <div className="flex flex-col gap-2">
            {attention.topListers.map((l) => (
              <div key={l.user_id} className="flex items-center justify-between gap-2 rounded-xl border border-border bg-surface p-3 text-sm">
                <span className="font-medium text-text-primary">
                  {l.nickname} {l.is_blocked ? <span className="text-danger">({t("admin.blockedBadge")})</span> : null}
                </span>
                <span className="text-text-muted">
                  {l.active_count} aktívnych · {l.total_count} spolu · {l.email}
                </span>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section id="nahlasenia" className="flex flex-col gap-3 scroll-mt-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-text-primary">Nahlásenia</h2>
          {onlyPending ? (
            <Link href={`${localizeHref(locale, "/admin")}#nahlasenia`} className="text-xs font-medium text-link hover:underline">
              Zrušiť filter „len otvorené"
            </Link>
          ) : null}
        </div>
        {shownReports.length === 0 ? (
          <p className="text-text-muted">{onlyPending ? "Žiadne otvorené nahlásenia." : "Žiadne nahlásenia."}</p>
        ) : (
          <div className="flex flex-col gap-3">
            {shownReports.map((report) => (
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
                <p className="text-xs text-text-muted">
                  Cieľ: {report.target_id}
                  {report.target_type === "PROPERTY" ? (
                    <>
                      {" · "}
                      <a
                        href={`/inzerat/${report.target_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-link hover:underline"
                      >
                        zobraziť inzerát
                      </a>
                    </>
                  ) : null}
                </p>

                {report.status === "PENDING" ? (
                  <div className="flex flex-wrap gap-2 pt-1">
                    <form action={resolveReport.bind(null, report.id, false)}>
                      <Button type="submit" variant="secondary" className="px-3 py-1.5 text-sm">
                        Vybaviť
                      </Button>
                    </form>
                    <form action={resolveReport.bind(null, report.id, true)}>
                      <Button type="submit" variant="danger" className="px-3 py-1.5 text-sm">
                        Skryť inzerát a vybaviť
                      </Button>
                    </form>
                    <form action={dismissReport.bind(null, report.id)}>
                      <Button type="submit" variant="secondary" className="px-3 py-1.5 text-sm">
                        Zamietnuť (neopodstatnené)
                      </Button>
                    </form>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </section>

      <section id="nehnutelnosti" className="flex flex-col gap-3 scroll-mt-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-text-primary">Nehnuteľnosti</h2>
          {propertyStatusFilter ? (
            <Link href={`${localizeHref(locale, "/admin")}#nehnutelnosti`} className="text-xs font-medium text-link hover:underline">
              Zrušiť filter stavu
            </Link>
          ) : null}
        </div>
        <p className="text-sm text-text-muted">
          Schvaľovanie, skrytie z katalógu a trvalé zmazanie inzerátov — nezávisle od nahlásení vyššie.
        </p>
        {shownProperties.length === 0 ? (
          <p className="text-text-muted">Žiadne inzeráty v tomto stave.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {shownProperties.map((p) => (
              <div key={p.id} className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <a
                    href={`/inzerat/${p.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-text-primary hover:underline"
                  >
                    {p.title || "Bez názvu"}
                  </a>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      p.status === "ACTIVE" ? "bg-accent-soft text-accent-deep" : "bg-surface-pressed text-text-secondary"
                    }`}
                  >
                    {p.status === "REJECTED" ? "Skrytý" : propertyStatusLabel[p.status]}
                  </span>
                </div>
                <p className="text-xs text-text-muted">
                  {[p.city, new Intl.DateTimeFormat("sk-SK", { day: "numeric", month: "long", year: "numeric" }).format(new Date(p.created_at))]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                {p.rejection_reason ? <p className="text-sm text-warning">{p.rejection_reason}</p> : null}
                <AdminPropertyActions propertyId={p.id} status={p.status} />
              </div>
            ))}
          </div>
        )}
      </section>

      <section id="pouzivatelia" className="flex flex-col gap-3 scroll-mt-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-text-primary">Používatelia</h2>
          {onlyBlocked ? (
            <Link href={`${localizeHref(locale, "/admin")}#pouzivatelia`} className="text-xs font-medium text-link hover:underline">
              Zrušiť filter „len zablokovaní"
            </Link>
          ) : null}
        </div>
        <div className="flex flex-col gap-3">
          {shownUsers.map((u) => (
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
                    <Button type="submit" variant={u.is_blocked ? "secondary" : "danger"} className="px-3 py-1.5 text-sm">
                      {u.is_blocked ? "Odblokovať" : "Zablokovať"}
                    </Button>
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

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-text-primary">Nastavenia — prahy</h2>
        <p className="text-sm text-text-muted">Platí okamžite, nový build netreba.</p>

        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-text-muted">Limit inzerátov</h3>
          {config
            .filter((c) => c.key === "max_active_listings")
            .map((c) => (
              <AdminConfigRow key={c.key} configKey={c.key} value={c.value} label={c.label} hint={c.hint} />
            ))}
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
            Podozriví používatelia — prahy
          </h3>
          {config
            .filter((c) => c.key.startsWith("suspicious_"))
            .map((c) => (
              <AdminConfigRow key={c.key} configKey={c.key} value={c.value} label={c.label} hint={c.hint} />
            ))}
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-text-muted">Rate limiting — prahy</h3>
          {config
            .filter((c) => c.key.startsWith("rate_limit_"))
            .map((c) => (
              <AdminConfigRow key={c.key} configKey={c.key} value={c.value} label={c.label} hint={c.hint} />
            ))}
        </div>
      </section>
    </main>
  );
}
