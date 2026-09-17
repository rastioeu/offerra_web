import type { Metadata } from "next";

import { AppleSignInButton } from "@/components/apple-sign-in-button";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { getLocale, getT } from "@/i18n/server";
import { localizeHref } from "@/i18n/href";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("login.signIn") };
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const [{ next, error }, locale, t] = await Promise.all([searchParams, getLocale(), getT()]);
  // Bez `?next=` (napr. klik na všeobecné „Prihlásiť sa" v hlavičke) sa
  // po prihlásení vracia na domovskú v TOM ISTOM jazyku — bez tohto by
  // prihlásenie z `/en`/`/de` vždy skončilo na SK (Rastio, 17.9.2026:
  // „vyberiem jazyk a hneď zmení naspäť").
  const nextPath = next ?? localizeHref(locale, "/");

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center gap-6 px-4 py-16">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold text-text-primary">{t("login.signIn")}</h1>
        <p className="text-text-secondary">{t("login.pageSubtitle")}</p>
      </div>

      {error ? (
        <p className="rounded-xl bg-danger/10 px-4 py-2 text-sm text-danger">{t("login.errorBody")}</p>
      ) : null}

      <div className="flex w-full flex-col gap-3">
        <GoogleSignInButton next={nextPath} language={locale} />
        <AppleSignInButton next={nextPath} language={locale} />
      </div>
    </main>
  );
}
