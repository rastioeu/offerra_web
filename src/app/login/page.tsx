import type { Metadata } from "next";

import { GoogleSignInButton } from "@/components/google-sign-in-button";

export const metadata: Metadata = {
  title: "Prihlásenie",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center gap-6 px-4 py-16">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold text-text-primary">Prihlásenie</h1>
        <p className="text-text-secondary">
          Aby za každým inzerátom a ponukou stál overený človek.
        </p>
      </div>

      {error ? (
        <p className="rounded-xl bg-danger/10 px-4 py-2 text-sm text-danger">
          Prihlásenie sa nepodarilo. Skús to prosím znova.
        </p>
      ) : null}

      <GoogleSignInButton next={next ?? "/"} />
    </main>
  );
}
