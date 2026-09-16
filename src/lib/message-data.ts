/**
 * Správy 1:1 — SERVER-SIDE dátové funkcie, prenesené z appkového
 * `messages.ts`. Typy a čisté funkcie sú v `lib/messages.ts`.
 */
import { subjectIds, type Message, type MessageSubject, type Thread } from "@/lib/messages";
import { createClient } from "@/lib/supabase/server";

/** Celé vlákno s JEDNÝM človekom pri jednom predmete. */
export async function fetchThread(subject: MessageSubject, otherId: string): Promise<Message[]> {
  const supabase = await createClient();
  const { propertyId, requestId } = subjectIds(subject);
  let q = supabase.schema("offerra").from("message").select("*");
  q = propertyId ? q.eq("property_id", propertyId) : q.eq("request_id", requestId as string);
  const { data, error } = await q
    .or(`sender_id.eq.${otherId},recipient_id.eq.${otherId}`)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Message[];
}

/** Odošle správu. Kontrolu kontaktu robí DATABÁZA — sem sa vráti jej hláška. */
export async function sendMessage(subject: MessageSubject, recipientId: string, content: string): Promise<Message> {
  const supabase = await createClient();
  const { propertyId, requestId } = subjectIds(subject);
  const { data, error } = await supabase.schema("offerra").rpc("send_message", {
    p_property_id: propertyId,
    p_request_id: requestId,
    p_recipient: recipientId,
    p_content: content,
  });
  if (error) throw error;
  return data as Message;
}

export async function markRead(subject: MessageSubject, otherId: string): Promise<number> {
  const supabase = await createClient();
  const { propertyId, requestId } = subjectIds(subject);
  const { data, error } = await supabase.schema("offerra").rpc("mark_messages_read", {
    p_property_id: propertyId,
    p_other: otherId,
    p_request_id: requestId,
  });
  if (error) throw error;
  return typeof data === "number" ? data : 0;
}

/** Zoznam vlákien pri predmete — pre vlastníka, ktorý ich má viac. */
export async function fetchThreads(subject: MessageSubject, myId: string): Promise<Thread[]> {
  const supabase = await createClient();
  const { propertyId, requestId } = subjectIds(subject);
  let q = supabase.schema("offerra").from("message").select("*");
  q = propertyId ? q.eq("property_id", propertyId) : q.eq("request_id", requestId as string);
  const { data, error } = await q.order("created_at", { ascending: true });
  if (error) throw error;

  const byOther = new Map<string, Thread>();
  for (const m of (data ?? []) as Message[]) {
    const otherId = m.sender_id === myId ? m.recipient_id : m.sender_id;
    const t = byOther.get(otherId) ?? { otherId, last: m, unread: 0 };
    t.last = m;
    if (m.recipient_id === myId && !m.read_at) t.unread += 1;
    byOther.set(otherId, t);
  }
  return [...byOther.values()].sort((a, b) => b.last.created_at.localeCompare(a.last.created_at));
}

/** Prezývky protistrán — vlastník potrebuje vedieť, s kým z nich píše. */
export async function fetchNicknames(ids: string[]): Promise<Record<string, string>> {
  if (ids.length === 0) return {};
  const supabase = await createClient();
  const { data, error } = await supabase.schema("offerra").from("profile").select("id,nickname").in("id", ids);
  if (error) throw error;
  const map: Record<string, string> = {};
  for (const r of (data ?? []) as { id: string; nickname: string | null }[]) {
    if (r.nickname) map[r.id] = r.nickname;
  }
  return map;
}
