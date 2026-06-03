import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  eveningMessage,
  pendingForUser,
} from "@/lib/notifications/format";
import { sendPushTo, type PushSub } from "@/lib/notifications/sendPush";
import type { CrewKey } from "@/lib/data/schedule";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** GET /api/cron/evening — fired by Vercel Cron at 10:30 UTC (= 17:30 ICT). */
export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("unauthorized", { status: 401 });
  }

  const supabase = createAdminClient();
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { data: subs } = await supabase
    .from("push_subscriptions")
    .select(
      `id, endpoint, p256dh_key, auth_key, user_id,
       profile:profiles!inner(display_name, crew_key)`,
    );

  if (!subs || subs.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, skipped: 0 });
  }

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
    const [todayLines, tomorrowLines] = await Promise.all([
      pendingForUser(supabase, today, crewKey),
      pendingForUser(supabase, tomorrow, crewKey),
    ]);
    const msg = eveningMessage(displayName, crewKey, todayLines, tomorrowLines);
    if (!msg) {
      skipped++;
      continue;
    }
    for (const sub of userSubs) {
      const result = await sendPushTo(supabase, sub, {
        title: msg.title,
        body: msg.body,
        url: "/",
        tag: "trakanta-evening",
      });
      if (result.ok) sent++;
      else if (result.gone) gone++;
    }
  }

  return NextResponse.json({ ok: true, sent, skipped, gone });
}
