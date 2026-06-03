import type { SupabaseClient } from "@supabase/supabase-js";
import {
  CREW,
  customCrew,
  type CrewKey,
  SCHEDULE,
  slotKey,
  type SlotInstance,
} from "@/lib/data/schedule";
import { ymd } from "@/lib/utils/date";

export type CrewLine = {
  time: string;
  title: string;
  task: string;
  done: boolean;
};

async function fetchSlotsAndProgress(
  supabase: SupabaseClient,
  date: Date,
): Promise<{ slots: SlotInstance[]; doneSet: Set<string> }> {
  const dateStr = ymd(date);

  const [customQ, progressQ] = await Promise.all([
    supabase
      .from("custom_tasks")
      .select("id,time,title,platforms,crew_type")
      .eq("date", dateStr),
    supabase
      .from("task_progress")
      .select("slot_key,crew_key")
      .eq("date", dateStr),
  ]);

  const fixed: SlotInstance[] = SCHEDULE.filter(
    (s) => s.dow === date.getDay(),
  ).map((s) => ({
    isCustom: false,
    time: s.time,
    title: s.title,
    platforms: s.platforms,
    crew: s.crew,
  }));

  const custom: SlotInstance[] = (customQ.data ?? []).map((r) => ({
    id: r.id,
    isCustom: true,
    time: r.time,
    title: r.title,
    platforms: r.platforms ?? "—",
    crew: customCrew(r.crew_type as "photo" | "video"),
  }));

  const slots = [...fixed, ...custom].sort((a, b) =>
    a.time.localeCompare(b.time),
  );

  const doneSet = new Set<string>();
  (progressQ.data ?? []).forEach((r) => {
    doneSet.add(r.slot_key + "|" + r.crew_key);
  });

  return { slots, doneSet };
}

/** Build the per-user pending list for a single date. */
export async function pendingForUser(
  supabase: SupabaseClient,
  date: Date,
  crewKey: CrewKey | null,
): Promise<CrewLine[]> {
  const { slots, doneSet } = await fetchSlotsAndProgress(supabase, date);
  const out: CrewLine[] = [];

  slots.forEach((slot) => {
    const sk = slotKey(slot);
    slot.crew.forEach((c) => {
      // If user has a crew key, only their tasks
      if (crewKey && c.who !== crewKey) return;
      const done = doneSet.has(sk + "|" + c.who);
      out.push({
        time: slot.time,
        title: slot.title,
        task: c.task,
        done,
      });
    });
  });

  return out;
}

/** Brief team summary for users without a crew_key (observers). */
export async function teamSummary(
  supabase: SupabaseClient,
  date: Date,
): Promise<{ done: number; total: number; titles: string[] }> {
  const { slots, doneSet } = await fetchSlotsAndProgress(supabase, date);
  let done = 0;
  let total = 0;
  const titles: string[] = [];
  slots.forEach((slot) => {
    const sk = slotKey(slot);
    let allDone = true;
    slot.crew.forEach((c) => {
      total++;
      if (doneSet.has(sk + "|" + c.who)) done++;
      else allDone = false;
    });
    if (!allDone) titles.push(`${slot.time} ${slot.title}`);
  });
  return { done, total, titles };
}

function bullets(lines: CrewLine[], max = 8): string {
  const pending = lines.filter((l) => !l.done);
  if (pending.length === 0) return "";
  const rows = pending.slice(0, max).map(
    (l) => `• ${l.time} ${l.title} — ${l.task}`,
  );
  if (pending.length > max) {
    rows.push(`(และอีก ${pending.length - max} รายการ)`);
  }
  return rows.join("\n");
}

/** Builds the 08:30 morning push for a user. Returns null = don't send. */
export function morningMessage(
  displayName: string,
  crewKey: CrewKey | null,
  todayLines: CrewLine[],
): { title: string; body: string } | null {
  const pending = todayLines.filter((l) => !l.done);
  if (pending.length === 0) return null;

  const crewLabel = crewKey ? CREW[crewKey].name : displayName;
  return {
    title: `🌅 อรุณสวัสดิ์ ${crewLabel}`,
    body: `วันนี้เหลือ ${pending.length} งาน:\n${bullets(todayLines)}`,
  };
}

/** Builds the 17:30 evening push. Returns null = don't send. */
export function eveningMessage(
  displayName: string,
  crewKey: CrewKey | null,
  todayLines: CrewLine[],
  tomorrowLines: CrewLine[],
): { title: string; body: string } | null {
  const todayPending = todayLines.filter((l) => !l.done);
  // tomorrow is all "pending" since the day hasn't started
  const tomorrowPending = tomorrowLines;

  if (todayPending.length === 0 && tomorrowPending.length === 0) return null;

  const crewLabel = crewKey ? CREW[crewKey].name : displayName;
  const parts: string[] = [];
  if (todayPending.length > 0) {
    parts.push(`วันนี้ยังเหลือ ${todayPending.length} งาน:\n${bullets(todayLines)}`);
  } else {
    parts.push("วันนี้เสร็จครบแล้ว ✓");
  }
  if (tomorrowPending.length > 0) {
    parts.push(
      `พรุ่งนี้: ${tomorrowPending.length} งาน\n${bullets(tomorrowLines, 5)}`,
    );
  }

  return {
    title: `🌙 สรุปวันนี้ ${crewLabel}`,
    body: parts.join("\n\n"),
  };
}
