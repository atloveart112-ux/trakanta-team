import { slotsForDate, type WeekData } from "@/lib/data/week";
import { ymd } from "@/lib/utils/date";
import { TaskCard } from "./TaskCard";
import { AddTaskButton } from "./AddTaskButton";

export function TodayPanel({
  today,
  week,
}: {
  today: Date;
  week: WeekData;
}) {
  const todayItems = slotsForDate(today, week);
  const dateStr = ymd(today);

  return (
    <section className="bg-white rounded-2xl p-5 mb-5 shadow-[var(--shadow-soft)]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display font-bold text-xl text-[var(--color-ink)]">
            งานวันนี้
          </h2>
          <p className="text-xs text-[var(--color-muted)] mt-0.5">
            รายการที่ต้องโพสต์
          </p>
        </div>
        <span className="text-xs text-[var(--color-ink-soft)] bg-[var(--color-bg-2)] px-3 py-1.5 rounded-full">
          {todayItems.length} งาน
        </span>
      </div>

      {todayItems.length === 0 ? (
        <div className="text-center py-8 text-[var(--color-muted)] border border-dashed border-[var(--color-border)] rounded-xl bg-[var(--color-bg)]">
          วันนี้ไม่มีคิวโพสต์ — พักได้เลยค่ะ ☕
        </div>
      ) : (
        todayItems.map((slot) => (
          <TaskCard
            key={slot.id ?? slot.time + slot.title}
            slot={slot}
            date={today}
            week={week}
          />
        ))
      )}

      <AddTaskButton dateStr={dateStr} date={today} size="large" />
    </section>
  );
}
