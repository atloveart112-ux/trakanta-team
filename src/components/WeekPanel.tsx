import { CREW, DAY_TH, slotKey as toSlotKey } from "@/lib/data/schedule";
import { combineKey, slotsForDate, type WeekData } from "@/lib/data/week";
import { dateOfWeekday, pad, startOfWeek, ymd } from "@/lib/utils/date";
import { AddTaskButton } from "./AddTaskButton";
import { TaskCard } from "./TaskCard";
import { TaskModalTrigger } from "./TaskModalTrigger";

export function WeekPanel({
  today,
  week,
}: {
  today: Date;
  week: WeekData;
}) {
  const ws = startOfWeek(today);
  const we = new Date(ws);
  we.setDate(we.getDate() + 6);

  return (
    <section className="bg-white rounded-2xl p-5 mb-5 shadow-[var(--shadow-soft)]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display font-bold text-xl text-[var(--color-ink)]">
            สัปดาห์นี้
          </h2>
          <p className="text-xs text-[var(--color-muted)] mt-0.5">
            ภาพรวม 7 วัน · คลิกแถวเพื่อแก้
          </p>
        </div>
        <span className="text-xs text-[var(--color-ink-soft)] bg-[var(--color-bg-2)] px-3 py-1.5 rounded-full">
          {ws.getDate()}/{ws.getMonth() + 1} — {we.getDate()}/
          {we.getMonth() + 1}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {Array.from({ length: 7 }, (_, i) => {
          const dow = (1 + i) % 7;
          const date = dateOfWeekday(ws, dow);
          const dateStr = ymd(date);
          const items = slotsForDate(date, week);
          const isToday = dateStr === ymd(today);
          return (
            <div
              key={dow}
              className={
                "rounded-xl p-3 border " +
                (isToday
                  ? "bg-[var(--color-gold-soft)] border-[var(--color-gold)] shadow-md shadow-[var(--color-gold)]/30"
                  : "bg-[var(--color-bg)] border-[var(--color-border)]")
              }
            >
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-dashed border-[var(--color-border)]">
                <div className="font-display font-bold text-base text-[var(--color-ink)]">
                  {DAY_TH[dow]}
                </div>
                <div
                  className={
                    "text-xs " +
                    (isToday
                      ? "text-amber-700 font-semibold"
                      : "text-[var(--color-muted)]")
                  }
                >
                  {pad(date.getDate())}/{pad(date.getMonth() + 1)}
                </div>
              </div>
              {items.length === 0 && (
                <div className="text-xs text-[var(--color-muted)] py-2 text-center">
                  ไม่มีคิว
                </div>
              )}
              {items.map((slot) => {
                const sk = toSlotKey(slot);
                const total = slot.crew.length;
                const doneCount = slot.crew.filter((c) =>
                  week.done.has(combineKey(dateStr, sk, c.who)),
                ).length;
                const fullDone = doneCount === total;
                const hasImp = slot.crew.some((c) =>
                  week.important.has(combineKey(dateStr, sk, c.who)),
                );

                const trigger = (
                  <div className="flex items-center gap-2 py-1.5 text-sm rounded-lg px-1 hover:bg-white/60 transition">
                    <span className="text-xs font-semibold text-[var(--color-primary)] min-w-[44px]">
                      {slot.time}
                    </span>
                    <span
                      className={
                        "flex-1 min-w-0 truncate " +
                        (fullDone
                          ? "text-[var(--color-muted)] line-through"
                          : "")
                      }
                    >
                      {slot.title}
                      {slot.isCustom && (
                        <span className="text-[10px] ml-1 text-amber-700">
                          +
                        </span>
                      )}
                      {hasImp && (
                        <span className="text-[var(--color-primary)] text-xs ml-1">
                          🚩
                        </span>
                      )}
                    </span>
                    <span className="flex gap-1 flex-shrink-0">
                      {slot.crew.map((c) => {
                        const isDone = week.done.has(
                          combineKey(dateStr, sk, c.who),
                        );
                        return (
                          <div
                            key={c.who}
                            className="w-2 h-2 rounded-full border-[1.5px]"
                            style={{
                              borderColor: CREW[c.who].hex,
                              background: isDone ? CREW[c.who].hex : "white",
                            }}
                            title={
                              CREW[c.who].name +
                              ": " +
                              c.task +
                              (isDone ? " (เสร็จแล้ว)" : "")
                            }
                          />
                        );
                      })}
                    </span>
                  </div>
                );

                return (
                  <TaskModalTrigger
                    key={slot.id ?? slot.time + slot.title}
                    trigger={trigger}
                    content={<TaskCard slot={slot} date={date} week={week} />}
                  />
                );
              })}
              <AddTaskButton dateStr={dateStr} date={date} size="small" />
            </div>
          );
        })}
      </div>
    </section>
  );
}
