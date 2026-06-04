/**
 * Fixed weekly content schedule for ตระการตาผ้าไทย.
 * Custom (ad-hoc) tasks are stored per-date in the database.
 */

export type CrewKey = "art" | "pop" | "tai" | "jack";

export type CrewMember = {
  key: CrewKey;
  name: string;
  hex: string;
  verb: string;
};

export const CREW: Record<CrewKey, CrewMember> = {
  art:  { key: "art",  name: "Art",  hex: "#E07A5F", verb: "ทำรูป / ถ่ายรูป" },
  pop:  { key: "pop",  name: "Pop",  hex: "#81B29A", verb: "ทำปกใส่ Text" },
  tai:  { key: "tai",  name: "ต่าย", hex: "#F2A4B0", verb: "คิดแคปชั่น" },
  jack: { key: "jack", name: "แจ็ค", hex: "#6B95C9", verb: "ตัดคลิป" },
};

export type CrewAssignment = { who: CrewKey; task: string };

export const PHOTO_CREW: CrewAssignment[] = [
  { who: "art", task: "ทำรูป" },
  { who: "pop", task: "ทำปกใส่ Text" },
  { who: "tai", task: "คิดแคปชั่น" },
];

export const VIDEO_CREW: CrewAssignment[] = [
  { who: "jack", task: "ตัดคลิป" },
  { who: "art",  task: "คิดคำที่ใส่ปก" },
  { who: "pop",  task: "ทำปกใส่ Text" },
  { who: "tai",  task: "คิดแคปชั่น" },
];

export type ScheduleSlot = {
  /** Day of week: 0=Sun, 1=Mon, ... 6=Sat */
  dow: number;
  /** HH:MM 24h */
  time: string;
  title: string;
  platforms: string;
  crew: CrewAssignment[];
};

/** A slot instance for rendering (fixed schedule item OR custom task). */
export type SlotInstance = {
  /** Present for custom tasks; undefined for fixed slots */
  id?: string;
  isCustom: boolean;
  time: string;
  title: string;
  platforms: string;
  crew: CrewAssignment[];
};

export function fixedSlotToInstance(s: ScheduleSlot): SlotInstance {
  return {
    isCustom: false,
    time: s.time,
    title: s.title,
    platforms: s.platforms,
    crew: s.crew,
  };
}

export function customCrew(type: "photo" | "video"): CrewAssignment[] {
  return type === "photo" ? PHOTO_CREW : VIDEO_CREW;
}

/** Build crew assignments from a list of chosen crew keys, using each crew's default verb. */
export function buildCustomCrew(members: CrewKey[]): CrewAssignment[] {
  return members.map((k) => ({ who: k, task: CREW[k].verb }));
}

export const SCHEDULE: ScheduleSlot[] = [
  { dow: 1, time: "08:00", title: "รีวิวภาพนิ่ง",         platforms: "FB, IG",                    crew: PHOTO_CREW },
  { dow: 2, time: "12:00", title: "Reels รีวิว",           platforms: "FB, IG, TikTok, YouTube",   crew: VIDEO_CREW },
  { dow: 2, time: "19:00", title: "คลิปสปอยสินค้า",       platforms: "FB, IG, TikTok, YouTube",   crew: VIDEO_CREW },
  { dow: 3, time: "08:00", title: "รีวิวภาพนิ่ง",         platforms: "FB, IG",                    crew: PHOTO_CREW },
  { dow: 3, time: "19:00", title: "คอนเทนต์กลุ่มปิด",     platforms: "กลุ่มปิด FB",               crew: VIDEO_CREW },
  { dow: 4, time: "12:00", title: "Reels รีวิว",           platforms: "FB, IG, TikTok, YouTube",   crew: VIDEO_CREW },
  { dow: 4, time: "19:00", title: "คลิปสปอยสินค้า",       platforms: "FB, IG, TikTok, YouTube",   crew: VIDEO_CREW },
  { dow: 5, time: "08:00", title: "รีวิวภาพนิ่ง",         platforms: "FB, IG",                    crew: PHOTO_CREW },
  { dow: 6, time: "12:00", title: "รีวิวลูกค้า / engagement", platforms: "FB",                    crew: VIDEO_CREW },
  { dow: 0, time: "08:00", title: "Reels จับนุ่งผ้าถุง",  platforms: "FB, IG, TikTok, YouTube",   crew: VIDEO_CREW },
  { dow: 0, time: "19:00", title: "คอนเทนต์กลุ่มปิด",     platforms: "กลุ่มปิด FB",               crew: VIDEO_CREW },
];

/** Stable key for a slot (same date+slot+crew row identifier across UI + DB). */
export function slotKey(slot: { id?: string; time: string; title: string }) {
  return slot.id ?? slot.time + "|" + slot.title;
}

export const DAY_TH = [
  "อาทิตย์",
  "จันทร์",
  "อังคาร",
  "พุธ",
  "พฤหัสบดี",
  "ศุกร์",
  "เสาร์",
];
