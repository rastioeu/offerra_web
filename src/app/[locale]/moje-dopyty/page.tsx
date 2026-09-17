import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getDemandLabel, getPropertyLabel } from "@/lib/labels";
import { fetchMyRequests } from "@/lib/my-offers";
import { formatBudget, getRequestStatusLabel } from "@/lib/offers";
import { createClient } from "@/lib/supabase/server";
import { getT } from "@/i18n/server";

export const metadata: Metadata = {
  title: "Moje dopyty",
};

export default async function MyRequestsPage() {
  const t = await getT();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/moje-dopyty");

  const requests = await fetchMyRequests(user.id);
  const demandLabel = getDemandLabel(t);
  const propertyLabel = getPropertyLabel(t);
  const statusLabel = getRequestStatusLabel(t);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-text-primary">Moje dopyty</h1>

      {requests.length === 0 ? (
        <p className="text-text-muted">Zatiaľ nemáš žiadny dopyt.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {requests.map((request) => {
            const meta = [
              demandLabel[request.transaction_type],
              request.property_type ? propertyLabel[request.property_type as keyof typeof propertyLabel] : "Akýkoľvek typ",
              request.city,
            ]
              .filter(Boolean)
              .join(" · ");

            return (
              <div key={request.id} className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="font-semibold text-text-primary">{meta}</span>
                  <span className="rounded-full bg-surface-pressed px-2 py-0.5 text-xs font-medium text-text-secondary">
                    {statusLabel[request.status]}
                  </span>
                </div>
                <span className="text-sm text-text-secondary">
                  {formatBudget(t, request.budget_min, request.budget_max)}
                </span>
                {request.description ? (
                  <p className="text-sm text-text-muted">{request.description}</p>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
