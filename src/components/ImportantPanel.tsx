import {
  CREW,
  type CrewKey,
  DAY_TH,
  slotKey as toSlotKey,
} from "@/lib/data/schedule";
import { combineKey, slotsForDate, type WeekData } from "@/lib/data/week";
import { dateOfWeekday, startOfWeek, ymd } from "@/lib/utils/date";
import { TaskCard } from "./TaskCard";
import { TaskModalTrigger } from "./TaskModalTrigger";

export function ImportantPanel({
  today,
  week,
}: {
  today: Date;
  week: WeekData;
}) {
  const ws = startOfWeek(today);

  type Item = {
    date: Date;
    dateStr: string;
    slot: ReturnType<typeof slotsForDate>[number];
    crewKey: CrewKey;
    task: string;
    caption: string;
    done: boolean;
  };
  const items: Item[] = [];

  for (let i = 0; i < 7; i++) {
    const dow = (1 + i) % 7;
    const date = dateOfWeekday(ws, dow);
    const dateStr = ymd(date);
    slotsForDate(date, week).forEach((slot) => {
      const sk = toSlotKey(slot);
      slot.crew.forEach((c) => {
        const key = combineKey(dateStr, sk, c.who);
        if (week.important.has(key)) {
          items.push({
            date,
            dateStr,
            slot,
            crewKey: c.who as CrewKey,
            task: c.task,
            caption: week.captions.get(key) ?? "",
            done: week.done.has(key),
          });
        }
      });
    });
  }

  if (items.length === 0) return null;

  return (
    <section className="relative bg-gradient-to-br from-[#FFF4EC] to-white rounded-2xl p-5 mb-5 border-2 border-[var(--color-primary)] shadow-lg shadow-[var(--color-primary)]/15">
      <div
        className="absolute top-[-2px] left-5 right-5 h-1 rounded-full"
        style={{
          background:
            "linear-gradient(90deg, var(--color-primary), var(--color-gold), var(--color-primary))",
        }}
      />
      <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
        <h2 className="font-display font-bold text-lg text-[var(--color-primary)]">
          🚩 รายการสำคัญ{" "}
          <span className="text-xs text-[var(--color-ink-soft)] font-normal">
            — ที่ทำเครื่องหมายไว้
          </span>
        </h2>
        <span className="text-xs text-[var(--color-ink-soft)] bg-white/70 px-3 py-1 rounded-full font-semibold">
          {items.length} รายการ
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {items.map((it, idx) => {
          const info = CREW[it.crewKey];
          const isToday = it.dateStr === ymd(today);
          const noteText =
            it.caption.length > 0
              ? it.caption.length > 120
                ? it.caption.slice(0, 120) + "..."
                : it.caption
              : "ยังไม่มีโน้ต — คลิกเพื่อเพิ่ม";

          const trigger = (
            <div
              className="bg-white border border-[#F8D6C6] rounded-xl p-3 hover:bg-[var(--color-bg)] hover:translate-x-1 transition-all"
              style={{ borderLeftWidth: 4, borderLeftColor: info.hex }}
            >
              <div className="flex items-center gap-2 flex-wrap text-sm mb-1">
                <span className="font-display font-bold text-[var(--color-ink)]">
                  {DAY_TH[it.date.getDay()]} {it.date.getDate()}/
                  {it.date.getMonth() + 1}
                </span>
                {isToday && (
                  <span className="text-[10px] bg-[var(--color-gold-soft)] text-amber-800 px-2 py-0.5 rounded-full font-semibold">
                    วันนี้
                  </span>
                )}
                <span className="text-[var(--color-primary)] font-bold bg-[var(--color-primary-soft)] px-2 py-0.5 rounded-full text-xs">
                  {it.slot.time}
                </span>
                <span className="text-[var(--color-ink)]">{it.slot.title}</span>
                <span
                  className="font-bold text-xs px-2 py-0.5 rounded-full"
                  style={{
                    color: info.hex,
                    background: "rgba(0,0,0,0.04)",
                  }}
                >
                  {info.name} · {it.task}
                </span>
                {it.done && (
                  <span className="text-xs text-[var(--color-success)] font-bold ml-auto">
                    ✓ เสร็จแล้ว
                  </span>
                )}
              </div>
              <div
                className={
                  "text-xs rounded-md px-2 py-1.5 " +
                  (it.caption
                    ? "text-[var(--color-ink-soft)] bg-[var(--color-bg)]"
                    : "text-[var(--color-muted)] bg-[var(--color-bg)] italic")
                }
              >
                {noteText}
              </div>
            </div>
          );

          return (
            <TaskModalTrigger
              key={idx}
              trigger={trigger}
              content={<TaskCard slot={it.slot} date={it.date} week={week} />}
            />
          );
        })}
      </div>
    </section>
  );
}
