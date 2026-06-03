import { CREW, type CrewKey, slotKey as toSlotKey } from "@/lib/data/schedule";
import { combineKey, slotsForDate, type WeekData } from "@/lib/data/week";
import { ymd } from "@/lib/utils/date";
import { CrewCharacter } from "./CrewCharacter";

export function CrewScene({
  today,
  week,
}: {
  today: Date;
  week: WeekData;
}) {
  const todayItems = slotsForDate(today, week);
  const dateStr = ymd(today);

  const stats = (Object.keys(CREW) as CrewKey[]).map((key) => {
    const info = CREW[key];
    let total = 0;
    let done = 0;
    todayItems.forEach((slot) => {
      const sk = toSlotKey(slot);
      slot.crew.forEach((c) => {
        if (c.who === key) {
          total++;
          if (week.done.has(combineKey(dateStr, sk, c.who))) done++;
        }
      });
    });
    const pending = total - done;
    let status: "idle" | "working" | "done";
    let activity: string;
    let badge: string;
    if (total === 0) {
      status = "idle";
      activity = "วันนี้ไม่มีคิว";
      badge = "พักผ่อน";
    } else if (pending === 0) {
      status = "done";
      activity = "เสร็จหมดแล้ว ✓";
      badge = "เสร็จแล้ว";
    } else {
      status = "working";
      activity = "กำลัง" + info.verb;
      badge = "ทำอยู่";
    }
    return { key, info, pending, done, total, status, activity, badge };
  });

  return (
    <section className="relative bg-gradient-to-b from-[var(--color-sky-2)] via-[var(--color-sky-1)] to-white rounded-2xl p-5 mb-5 shadow-[var(--shadow-soft)] overflow-hidden">
      <div className="absolute top-6 left-[5%] right-[5%] h-2 pointer-events-none opacity-80">
        <div
          className="h-full"
          style={{
            background:
              "radial-gradient(circle at 10% 50%, #F2CC8F 0 3px, transparent 3px), radial-gradient(circle at 25% 50%, #F2CC8F 0 3px, transparent 3px), radial-gradient(circle at 40% 50%, #F2CC8F 0 3px, transparent 3px), radial-gradient(circle at 55% 50%, #F2CC8F 0 3px, transparent 3px), radial-gradient(circle at 70% 50%, #F2CC8F 0 3px, transparent 3px), radial-gradient(circle at 85% 50%, #F2CC8F 0 3px, transparent 3px)",
            filter: "drop-shadow(0 0 6px rgba(242,204,143,0.8))",
          }}
        />
      </div>

      <div className="relative z-10 flex items-center justify-between mb-3 px-1">
        <h2 className="font-display text-lg text-[var(--color-ink)]">
          ทีมเราวันนี้{" "}
          <span className="text-sm text-[var(--color-ink-soft)] font-normal">
            — ใครทำอะไรอยู่บ้าง
          </span>
        </h2>
      </div>

      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map(({ key, info, pending, done, total, status, activity, badge }) => (
          <div
            key={key}
            className="bg-white rounded-2xl p-3 pt-3.5 text-center shadow-md hover:-translate-y-1 hover:shadow-lg transition-all relative overflow-hidden"
            style={{ borderTop: `4px solid ${info.hex}` }}
          >
            {status === "working" && (
              <div className="absolute top-2 right-2 min-w-[22px] h-[22px] px-1.5 rounded-full bg-[var(--color-primary)] text-white text-xs font-bold grid place-items-center shadow shadow-[var(--color-primary)]/40">
                {pending}
              </div>
            )}
            {status === "done" && total > 0 && (
              <div className="absolute top-2 right-2 min-w-[22px] h-[22px] px-1.5 rounded-full bg-[var(--color-success)] text-white text-xs font-bold grid place-items-center shadow">
                ✓
              </div>
            )}
            <div className="h-[120px] grid place-items-end justify-center mb-1">
              <CrewCharacter who={key} />
            </div>
            <div
              className="font-display font-bold text-base"
              style={{ color: info.hex }}
            >
              {info.name}
            </div>
            <div className="text-xs text-[var(--color-ink-soft)] mb-2 min-h-[18px]">
              {activity}
            </div>
            <div
              className={
                "inline-block text-xs px-2.5 py-1 rounded-full font-semibold " +
                (status === "working"
                  ? "bg-[var(--color-gold-soft)] text-amber-800"
                  : status === "done"
                    ? "bg-[var(--color-success-soft)] text-emerald-800"
                    : "bg-[var(--color-bg-2)] text-[var(--color-muted)]")
              }
            >
              {badge}{" "}
              {total > 0 && (
                <span className="text-[10px] font-normal opacity-70">
                  ({done}/{total})
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
