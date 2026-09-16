import { ViewingCard } from "@/components/viewing-card";
import type { PropertyDetail } from "@/lib/detail";
import { isDeadlinePassed } from "@/lib/deadline";
import { REVEALED, type ViewingContact } from "@/lib/viewing";
import { fetchViewingContact, fetchViewings } from "@/lib/viewing-data";
import { t } from "@/i18n";

export async function ViewingSection({ property, userId }: { property: PropertyDetail; userId: string | null }) {
  if (!userId) {
    return (
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-text-primary">{t("viewing.eyebrow")}</h2>
        <p className="text-sm text-text-muted">
          <a href="/login" className="text-link hover:underline">
            Prihlás sa
          </a>{" "}
          a požiadaj o obhliadku.
        </p>
      </section>
    );
  }

  const viewings = await fetchViewings(property.id);
  const contacts: Record<string, ViewingContact> = {};
  for (const v of viewings) {
    if (!REVEALED.includes(v.status)) continue;
    const c = await fetchViewingContact(v.id).catch(() => null);
    if (c) contacts[v.id] = c;
  }

  const closed = isDeadlinePassed(property.offer_deadline) || property.status !== "ACTIVE";
  const isOwner = userId === property.owner_id;

  return (
    <ViewingCard
      propertyId={property.id}
      viewings={viewings}
      contacts={contacts}
      myId={userId}
      isOwner={isOwner}
      closed={closed}
    />
  );
}
