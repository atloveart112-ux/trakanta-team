import {
  customCrew,
  fixedSlotToInstance,
  SCHEDULE,
  type SlotInstance,
} from "@/lib/data/schedule";
import { createClient } from "@/lib/supabase/server";
import { dateOfWeekday, startOfWeek, ymd } from "@/lib/utils/date";

export type ImageInfo = {
  url: string | null;
  fileName: string;
  fileSize: number | null;
};

export type WeekData = {
  done: Set<string>;
  captions: Map<string, string>;
  important: Set<string>;
  images: Map<string, ImageInfo>;
  /** date string -> custom task instances on that date */
  customByDate: Map<string, SlotInstance[]>;
  weekStart: Date;
  weekEnd: Date;
};

export function combineKey(date: string, slotKey: string, crewKey: string) {
  return date + "|" + slotKey + "|" + crewKey;
}

export async function fetchWeekData(now: Date): Promise<WeekData> {
  const ws = startOfWeek(now);
  const we = dateOfWeekday(ws, 0);
  const wsStr = ymd(ws);
  const weStr = ymd(we);

  const supabase = await createClient();

  const [progress, captions, important, images, custom] = await Promise.all([
    supabase
      .from("task_progress")
      .select("date,slot_key,crew_key")
      .gte("date", wsStr)
      .lte("date", weStr),
    supabase
      .from("captions")
      .select("date,slot_key,crew_key,content")
      .gte("date", wsStr)
      .lte("date", weStr),
    supabase
      .from("important_flags")
      .select("date,slot_key,crew_key")
      .gte("date", wsStr)
      .lte("date", weStr),
    supabase
      .from("images")
      .select("date,slot_key,crew_key,storage_path,file_name,file_size,mime_type")
      .gte("date", wsStr)
      .lte("date", weStr),
    supabase
      .from("custom_tasks")
      .select("id,date,time,title,platforms,crew_type")
      .gte("date", wsStr)
      .lte("date", weStr),
  ]);

  const doneSet = new Set<string>();
  (progress.data ?? []).forEach((r) =>
    doneSet.add(combineKey(r.date, r.slot_key, r.crew_key)),
  );

  const captionMap = new Map<string, string>();
  (captions.data ?? []).forEach((r) =>
    captionMap.set(combineKey(r.date, r.slot_key, r.crew_key), r.content ?? ""),
  );

  const importantSet = new Set<string>();
  (important.data ?? []).forEach((r) =>
    importantSet.add(combineKey(r.date, r.slot_key, r.crew_key)),
  );

  // Batch-sign all image URLs in one call (avoid N round-trips).
  const imageRows = images.data ?? [];
  const imageMap = new Map<string, ImageInfo>();
  if (imageRows.length > 0) {
    const paths = imageRows.map((r) => r.storage_path);
    const { data: signedList } = await supabase.storage
      .from("content-images")
      .createSignedUrls(paths, 86400);
    imageRows.forEach((r, i) => {
      imageMap.set(combineKey(r.date, r.slot_key, r.crew_key), {
        url: signedList?.[i]?.signedUrl ?? null,
        fileName: r.file_name,
        fileSize: r.file_size,
      });
    });
  }

  const customByDate = new Map<string, SlotInstance[]>();
  (custom.data ?? []).forEach((r) => {
    const inst: SlotInstance = {
      id: r.id,
      isCustom: true,
      time: r.time,
      title: r.title,
      platforms: r.platforms ?? "—",
      crew: customCrew(r.crew_type as "photo" | "video"),
    };
    const arr = customByDate.get(r.date) ?? [];
    arr.push(inst);
    customByDate.set(r.date, arr);
  });

  return {
    done: doneSet,
    captions: captionMap,
    important: importantSet,
    images: imageMap,
    customByDate,
    weekStart: ws,
    weekEnd: we,
  };
}

/** All slots for a given date: fixed schedule + custom tasks, sorted by time. */
export function slotsForDate(date: Date, week: WeekData): SlotInstance[] {
  const dateStr = ymd(date);
  const fixed = SCHEDULE.filter((s) => s.dow === date.getDay()).map(
    fixedSlotToInstance,
  );
  const custom = week.customByDate.get(dateStr) ?? [];
  return [...fixed, ...custom].sort((a, b) => a.time.localeCompare(b.time));
}
