"use server";

import { revalidatePath } from "next/cache";

import { markRead, sendMessage } from "@/lib/message-data";

export async function sendMessageAction(propertyId: string, recipientId: string, content: string) {
  await sendMessage({ propertyId }, recipientId, content);
  revalidatePath(`/inzerat/${propertyId}`);
  revalidatePath(`/inzerat/${propertyId}/spravy/${recipientId}`);
}

export async function markThreadReadAction(propertyId: string, otherId: string) {
  await markRead({ propertyId }, otherId);
}
