import Link from "next/link";
import {
  CREW,
  DAY_TH,
  slotKey as toSlotKey,
} from "@/lib/data/schedule";
import { combineKey, slotsForDate, type WeekData } from "@/lib/data/week";
import { ymd } from "@/lib/utils/date";
import { TaskCard } from "./TaskCard";
import { TaskModalTrigger } from "./TaskModalTrigger";

const TH_MONTHS = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

const DOW_LABELS = ["จ", "อ", "พ", "พฤ", "ศ", "ส", "อา"];

function monthParam(d: Date) {
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
}

export function MonthPanel({
  month,
  today,
  data,
}: {
  /** First day of the month being displayed (e.g. 2026-06-01) */
  month: Date;
  today: Date;
  data: WeekData;
}) {
  const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
  const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);

  // Grid starts at the Monday on/before monthStart
  const gridStart = new Date(monthStart);
  const startOffset = (monthStart.getDay() + 6) % 7;
  gridStart.setDate(gridStart.getDate() - startOffset);

  // Grid ends at the Sunday on/after monthEnd (so always 35 or 42 cells)
  const gridEnd = new Date(monthEnd);
  const endOffset = (7 - monthEnd.getDay()) % 7;
  gridEnd.setDate(gridEnd.getDate() + endOffset);

  const days: Date[] = [];
  for (
    let d = new Date(gridStart);
    d <= gridEnd;
    d.setDate(d.getDate() + 1)
  ) {
    days.push(new Date(d));
  }

  const prev = new Date(month);
  prev.setMonth(prev.getMonth() - 1);
  const next = new Date(month);
  next.setMonth(next.getMonth() + 1);

  const isCurrentMonth =
    month.getMonth() === today.getMonth() &&
    month.getFullYear() === today.getFullYear();

  return (
    <section className="bg-white rounded-2xl p-5 mb-5 shadow-[var(--shadow-soft)]">
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div>
          <h2 className="font-display font-bold text-xl text-[var(--color-ink)]">
            มุมมองเดือน
          </h2>
          <p className="text-xs text-[var(--color-muted)] mt-0.5">
            คลิกวันใดเพื่อเปิดดูรายละเอียด
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/?view=month&m=${monthParam(prev)}`}
            className="w-9 h-9 grid place-items-center rounded-full bg-[var(--color-bg)] hover:bg-[var(--color-bg-2)] transition"
            aria-label="เดือนก่อน"
          >
            ◀
          </Link>
          <div className="font-display font-bold text-base text-[var(--color-ink)] min-w-[150px] text-center">
            {TH_MONTHS[month.getMonth()]} {month.getFullYear() + 543}
          </div>
          <Link
            href={`/?view=month&m=${monthParam(next)}`}
            className="w-9 h-9 grid place-items-center rounded-full bg-[var(--color-bg)] hover:bg-[var(--color-bg-2)] transition"
            aria-label="เดือนถัดไป"
          >
            ▶
          </Link>
          {!isCurrentMonth && (
            <Link
              href="/?view=month"
              className="ml-1 text-xs px-2.5 py-1.5 rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)] font-semibold hover:bg-[var(--color-primary)] hover:text-white transition"
            >
              วันนี้
            </Link>
          )}
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DOW_LABELS.map((d, i) => (
          <div
            key={d}
            className={
              "text-center text-xs font-semibold py-1 " +
              (i >= 5
                ? "text-[var(--color-primary)]"
                : "text-[var(--color-ink-soft)]")
            }
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((d) => {
          const dateStr = ymd(d);
          const slots = slotsForDate(d, data);
          const isThisMonth = d.getMonth() === month.getMonth();
          const isToday = dateStr === ymd(today);

          let doneCount = 0;
          let totalCount = 0;
          const crewSeen = new Set<string>();
          let hasImportant = false;
          slots.forEach((slot) => {
            const sk = toSlotKey(slot);
            slot.crew.forEach((c) => {
              totalCount++;
              crewSeen.add(c.who);
              if (data.done.has(combineKey(dateStr, sk, c.who))) doneCount++;
              if (data.important.has(combineKey(dateStr, sk, c.who)))
                hasImportant = true;
            });
          });
          const allDone = totalCount > 0 && doneCount === totalCount;

          const cellInner = (
            <div
              className={
                "h-full w-full rounded-lg p-1.5 sm:p-2 text-left transition border " +
                (isToday
                  ? "bg-[var(--color-gold-soft)] border-[var(--color-gold)] shadow"
                  : isThisMonth
                    ? "bg-[var(--color-bg)] border-[var(--color-border)] hover:border-[var(--color-primary-soft)] hover:bg-white"
                    : "bg-transparent border-transparent text-[var(--color-muted)] opacity-50") +
                (hasImportant ? " ring-2 ring-[var(--color-primary)]/40" : "")
              }
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={
                    "text-xs font-bold " +
                    (isToday
                      ? "text-amber-700"
                      : isThisMonth
                        ? "text-[var(--color-ink)]"
                        : "text-[var(--color-muted)]")
                  }
                >
                  {d.getDate()}
                </span>
                {totalCount > 0 && (
                  <span
                    className={
                      "text-[9px] font-mono " +
                      (allDone
                        ? "text-[var(--color-success)]"
                        : "text-[var(--color-muted)]")
                    }
                  >
                    {doneCount}/{totalCount}
                  </span>
                )}
              </div>

              {slots.slice(0, 2).map((slot) => (
                <div
                  key={slot.id ?? slot.time + slot.title}
                  className="text-[10px] leading-tight truncate text-[var(--color-ink-soft)]"
                >
                  <span className="text-[var(--color-primary)] font-semibold">
                    {slot.time}
                  </span>{" "}
                  {slot.title}
                </div>
              ))}
              {slots.length > 2 && (
                <div className="text-[10px] text-[var(--color-muted)] mt-0.5">
                  +{slots.length - 2}
                </div>
              )}

              {crewSeen.size > 0 && (
                <div className="flex gap-0.5 mt-1">
                  {Array.from(crewSeen).map((k) => (
                    <div
                      key={k}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        background:
                          CREW[k as keyof typeof CREW]?.hex ?? "#999",
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          );

          if (slots.length === 0) {
            // Empty day — render plain cell, no modal
            return (
              <div
                key={dateStr}
                className="min-h-[70px] sm:min-h-[90px]"
              >
                {cellInner}
              </div>
            );
          }

          return (
            <TaskModalTrigger
              key={dateStr}
              className="min-h-[70px] sm:min-h-[90px] block"
              trigger={cellInner}
              content={
                <div>
                  <div className="font-display font-bold text-lg mb-3 text-[var(--color-ink)]">
                    วัน{DAY_TH[d.getDay()]} {d.getDate()}{" "}
                    {TH_MONTHS[d.getMonth()]} {d.getFullYear() + 543}
                  </div>
                  {slots.map((slot) => (
                    <TaskCard
                      key={slot.id ?? slot.time + slot.title}
                      slot={slot}
                      date={d}
                      week={data}
                    />
                  ))}
                </div>
              }
            />
          );
        })}
      </div>
    </section>
  );
}
