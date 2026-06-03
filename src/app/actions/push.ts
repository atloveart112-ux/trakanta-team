"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type SubscriptionJson = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

export async function subscribeToPush(
  sub: SubscriptionJson,
  userAgent?: string,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "not authenticated" };

  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      user_id: user.id,
      endpoint: sub.endpoint,
      p256dh_key: sub.keys.p256dh,
      auth_key: sub.keys.auth,
      user_agent: userAgent ?? null,
      last_seen: new Date().toISOString(),
    },
    { onConflict: "user_id,endpoint" },
  );
  if (error) return { error: error.message };
  revalidatePath("/settings");
  return {};
}

export async function unsubscribeFromPush(
  endpoint: string,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "not authenticated" };

  const { error } = await supabase
    .from("push_subscriptions")
    .delete()
    .eq("user_id", user.id)
    .eq("endpoint", endpoint);
  if (error) return { error: error.message };
  revalidatePath("/settings");
  return {};
}

export async function setMyCrewKey(
  crewKey: "art" | "pop" | "tai" | "jack" | null,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "not authenticated" };

  const { error } = await supabase
    .from("profiles")
    .update({ crew_key: crewKey })
    .eq("id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/");
  revalidatePath("/settings");
  return {};
}
