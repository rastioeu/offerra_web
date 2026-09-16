"use server";

import { revalidatePath } from "next/cache";

import { markRead, sendMessage } from "@/lib/message-data";
import type { MessageSubject } from "@/lib/messages";

/**
 * Spoločná akcia pre správy pri INZERÁTE aj pri DOPYTE — rovnaká
 * mechanika, mení sa len predmet (`propertyId` vs. `requestId`, appka:
 * `DemandMessages` zdieľa `Conversation`/`OwnerThreads` z rovnakého
 * dôvodu). Predtým bola len appka pre inzeráty (`inzerat/[id]/messages-actions.ts`),
 * presunuté sem, keď pribudli dopyty.
 */
function pathFor(subject: MessageSubject, otherId: string): string {
  return "propertyId" in subject && subject.propertyId
    ? `/inzerat/${subject.propertyId}/spravy/${otherId}`
    : `/dopyt/${(subject as { requestId: string }).requestId}/spravy/${otherId}`;
}

function mainPathFor(subject: MessageSubject): string {
  return "propertyId" in subject && subject.propertyId
    ? `/inzerat/${subject.propertyId}`
    : `/dopyt/${(subject as { requestId: string }).requestId}`;
}

export async function sendMessageAction(subject: MessageSubject, recipientId: string, content: string) {
  await sendMessage(subject, recipientId, content);
  revalidatePath(mainPathFor(subject));
  revalidatePath(pathFor(subject, recipientId));
}

export async function markThreadReadAction(subject: MessageSubject, otherId: string) {
  await markRead(subject, otherId);
}
