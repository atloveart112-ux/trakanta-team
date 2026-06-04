import {
  buildCustomCrew,
  customCrew,
  type CrewKey,
  fixedSlotToInstance,
  SCHEDULE,
  slotKey,
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
  /** date|slotKey -> custom title (override default) */
  titleOverrides: Map<string, string>;
  /** date string -> custom task instances on that date */
  customByDate: Map<string, SlotInstance[]>;
  weekStart: Date;
  weekEnd: Date;
};

export function combineKey(date: string, slotKey: string, crewKey: string) {
  return date + "|" + slotKey + "|" + crewKey;
}

export function titleKey(date: string, slotKey: string) {
  return date + "|" + slotKey;
}

export async function fetchWeekData(now: Date): Promise<WeekData> {
  const ws = startOfWeek(now);
  const we = dateOfWeekday(ws, 0);
  return fetchDateRangeData(ws, we);
}

/** Generic fetch — any date range. Used by week and month views. */
export async function fetchDateRangeData(
  from: Date,
  to: Date,
): Promise<WeekData> {
  const fromStr = ymd(from);
  const toStr = ymd(to);

  const supabase = await createClient();

  const [progress, captions, important, images, custom, titles] = await Promise.all([
    supabase
      .from("task_progress")
      .select("date,slot_key,crew_key")
      .gte("date", fromStr)
      .lte("date", toStr),
    supabase
      .from("captions")
      .select("date,slot_key,crew_key,content")
      .gte("date", fromStr)
      .lte("date", toStr),
    supabase
      .from("important_flags")
      .select("date,slot_key,crew_key")
      .gte("date", fromStr)
      .lte("date", toStr),
    supabase
      .from("images")
      .select("date,slot_key,crew_key,storage_path,file_name,file_size,mime_type")
      .gte("date", fromStr)
      .lte("date", toStr),
    supabase
      .from("custom_tasks")
      .select("id,date,time,title,platforms,crew_type,custom_crew")
      .gte("date", fromStr)
      .lte("date", toStr),
    supabase
      .from("title_overrides")
      .select("date,slot_key,custom_title")
      .gte("date", fromStr)
      .lte("date", toStr),
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

  const titleOverrides = new Map<string, string>();
  (titles.data ?? []).forEach((r) =>
    titleOverrides.set(titleKey(r.date, r.slot_key), r.custom_title),
  );

  const customByDate = new Map<string, SlotInstance[]>();
  (custom.data ?? []).forEach((r) => {
    const hasCustomCrew =
      Array.isArray(r.custom_crew) && r.custom_crew.length > 0;
    const crew = hasCustomCrew
      ? buildCustomCrew(r.custom_crew as CrewKey[])
      : customCrew((r.crew_type ?? "photo") as "photo" | "video");
    const inst: SlotInstance = {
      id: r.id,
      isCustom: true,
      time: r.time,
      title: r.title,
      platforms: r.platforms ?? "—",
      crew,
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
    titleOverrides,
    customByDate,
    weekStart: from,
    weekEnd: to,
  };
}

/** All slots for a date, with title overrides applied. */
export function slotsForDate(date: Date, week: WeekData): SlotInstance[] {
  const dateStr = ymd(date);
  const fixed = SCHEDULE.filter((s) => s.dow === date.getDay()).map(
    fixedSlotToInstance,
  );
  const custom = week.customByDate.get(dateStr) ?? [];
  const merged = [...fixed, ...custom].sort((a, b) =>
    a.time.localeCompare(b.time),
  );
  // Apply title overrides
  return merged.map((s) => {
    const k = titleKey(dateStr, slotKey(s));
    const override = week.titleOverrides.get(k);
    return override ? { ...s, title: override } : s;
  });
}
