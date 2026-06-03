import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  morningMessage,
  pendingForUser,
} from "@/lib/notifications/format";
import { sendPushTo, type PushSub } from "@/lib/notifications/sendPush";
import type { CrewKey } from "@/lib/data/schedule";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** GET /api/cron/morning — fired by Vercel Cron at 01:30 UTC (= 08:30 ICT). */
export async function GET(request: Request) {
  // Vercel attaches `Authorization: Bearer <CRON_SECRET>` automatically
  // when CRON_SECRET env var is set on the project.
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("unauthorized", { status: 401 });
  }

  const supabase = createAdminClient();
  const today = new Date();

  // Fetch all users with subscriptions
  const { data: subs } = await supabase
    .from("push_subscriptions")
    .select(
      `id, endpoint, p256dh_key, auth_key, user_id,
       profile:profiles!inner(display_name, crew_key)`,
    );

  if (!subs || subs.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, skipped: 0 });
  }

  // Group by user_id (a user can have multiple devices)
  const byUser = new Map<
    string,
    {
      displayName: string;
      crewKey: CrewKey | null;
      subs: PushSub[];
    }
  >();

  for (const s of subs as unknown as Array<{
    id: string;
    endpoint: string;
    p256dh_key: string;
    auth_key: string;
    user_id: string;
    profile: { display_name: string; crew_key: string | null };
  }>) {
    const entry = byUser.get(s.user_id) ?? {
      displayName: s.profile.display_name,
      crewKey: (s.profile.crew_key as CrewKey | null) ?? null,
      subs: [],
    };
    entry.subs.push({
      id: s.id,
      endpoint: s.endpoint,
      p256dh_key: s.p256dh_key,
      auth_key: s.auth_key,
    });
    byUser.set(s.user_id, entry);
  }

  let sent = 0;
  let skipped = 0;
  let gone = 0;
  for (const { displayName, crewKey, subs: userSubs } of byUser.values()) {
    const lines = await pendingForUser(supabase, today, crewKey);
    const msg = morningMessage(displayName, crewKey, lines);
    if (!msg) {
      skipped++;
      continue;
    }
    for (const sub of userSubs) {
      const result = await sendPushTo(supabase, sub, {
        title: msg.title,
        body: msg.body,
        url: "/",
        tag: "trakanta-morning",
      });
      if (result.ok) sent++;
      else if (result.gone) gone++;
    }
  }

  return NextResponse.json({ ok: true, sent, skipped, gone });
}
