import { CREW, type CrewKey, slotKey as toSlotKey } from "@/lib/data/schedule";
import { combineKey, slotsForDate, type WeekData } from "@/lib/data/week";
import { dateOfWeekday, startOfWeek, ymd } from "@/lib/utils/date";

export function SummaryPanel({
  today,
  week,
}: {
  today: Date;
  week: WeekData;
}) {
  const ws = startOfWeek(today);

  let total = 0;
  let done = 0;
  const perCrew: Record<CrewKey, { done: number; total: number }> = {
    art: { done: 0, total: 0 },
    pop: { done: 0, total: 0 },
    tai: { done: 0, total: 0 },
    jack: { done: 0, total: 0 },
  };

  for (let i = 0; i < 7; i++) {
    const dow = (1 + i) % 7;
    const date = dateOfWeekday(ws, dow);
    const dateStr = ymd(date);
    slotsForDate(date, week).forEach((slot) => {
      const sk = toSlotKey(slot);
      let allDone = true;
      slot.crew.forEach((c) => {
        const isDone = week.done.has(combineKey(dateStr, sk, c.who));
        perCrew[c.who as CrewKey].total++;
        if (isDone) perCrew[c.who as CrewKey].done++;
        else allDone = false;
      });
      total++;
      if (allDone) done++;
    });
  }

  const pct = total === 0 ? 0 : Math.round((done * 100) / total);
  let msg: string;
  if (pct === 100) msg = "🎉 เสร็จครบทั้งสัปดาห์! เก่งมากค่ะทีม";
  else if (pct >= 75) msg = "เกือบครบแล้ว เหลืออีกนิดเดียว 💪";
  else if (pct >= 50) msg = "ทำได้เกินครึ่งแล้ว · สู้ ๆ";
  else if (pct > 0) msg = "เริ่มแล้ว ค่อย ๆ เก็บไปทีละรายการ";
  else msg = "ยังไม่ได้เริ่ม · เปิดงานวันนี้ได้เลย";

  return (
    <section className="bg-white rounded-2xl p-5 mb-5 shadow-[var(--shadow-soft)]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display font-bold text-xl text-[var(--color-ink)]">
            สรุปประจำสัปดาห์
          </h2>
          <p className="text-xs text-[var(--color-muted)] mt-0.5">
            ภาพรวมความคืบหน้า
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-[var(--color-success-soft)] rounded-xl p-4 text-center">
          <div className="font-display font-bold text-3xl text-[var(--color-ink)] leading-none">
            {done}
          </div>
          <div className="text-xs text-[var(--color-ink-soft)] mt-1">
            ทำแล้ว
          </div>
        </div>
        <div className="bg-[var(--color-primary-soft)] rounded-xl p-4 text-center">
          <div className="font-display font-bold text-3xl text-[var(--color-ink)] leading-none">
            {total - done}
          </div>
          <div className="text-xs text-[var(--color-ink-soft)] mt-1">
            ยังไม่ทำ
          </div>
        </div>
        <div className="bg-[var(--color-gold-soft)] rounded-xl p-4 text-center">
          <div className="font-display font-bold text-3xl text-[var(--color-ink)] leading-none">
            {pct}%
          </div>
          <div className="text-xs text-[var(--color-ink-soft)] mt-1">
            ความคืบหน้า
          </div>
        </div>
      </div>

      <div className="h-3.5 bg-[var(--color-bg-2)] rounded-full overflow-hidden mb-2">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: pct + "%",
            background:
              "linear-gradient(90deg, var(--color-primary), var(--color-gold), var(--color-success))",
          }}
        />
      </div>

      <div className="text-center text-sm text-[var(--color-ink-soft)] my-3 font-display">
        {msg}
      </div>

      <h3 className="font-display font-bold text-base text-[var(--color-ink)] mb-2.5 mt-4">
        ผลรวมรายคน
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {(Object.keys(CREW) as CrewKey[]).map((k) => {
          const info = CREW[k];
          const stat = perCrew[k];
          const cpct =
            stat.total === 0 ? 0 : Math.round((stat.done * 100) / stat.total);
          return (
            <div
              key={k}
              className="bg-[var(--color-bg)] rounded-xl p-3"
              style={{ borderLeft: `4px solid ${info.hex}` }}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className="font-display font-bold text-sm"
                  style={{ color: info.hex }}
                >
                  {info.name}
                </span>
                <span className="text-xs font-semibold text-[var(--color-ink)]">
                  {stat.done}/{stat.total} · {cpct}%
                </span>
              </div>
              <div className="h-1.5 bg-[var(--color-bg-2)] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: cpct + "%", background: info.hex }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
