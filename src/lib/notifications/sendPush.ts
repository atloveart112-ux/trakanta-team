import webpush from "web-push";
import type { SupabaseClient } from "@supabase/supabase-js";

let configured = false;
function ensureConfigured() {
  if (configured) return;
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT ?? "mailto:noreply@example.com",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  );
  configured = true;
}

export type PushSub = {
  id: string;
  endpoint: string;
  p256dh_key: string;
  auth_key: string;
};

export type PushPayload = {
  title: string;
  body: string;
  url?: string;
  tag?: string;
};

/**
 * Sends a Web Push notification. Deletes expired subscriptions on 404/410.
 */
export async function sendPushTo(
  supabase: SupabaseClient,
  sub: PushSub,
  payload: PushPayload,
): Promise<{ ok: boolean; gone?: boolean; error?: string }> {
  ensureConfigured();
  try {
    await webpush.sendNotification(
      {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh_key, auth: sub.auth_key },
      },
      JSON.stringify(payload),
      { TTL: 24 * 3600 },
    );
    return { ok: true };
  } catch (e: unknown) {
    const err = e as { statusCode?: number; body?: string; message?: string };
    if (err.statusCode === 404 || err.statusCode === 410) {
      // Subscription expired — clean up
      await supabase.from("push_subscriptions").delete().eq("id", sub.id);
      return { ok: false, gone: true };
    }
    return { ok: false, error: err.message ?? String(e) };
  }
}
