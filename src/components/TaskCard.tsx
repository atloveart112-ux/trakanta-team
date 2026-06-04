import {
  CREW,
  type CrewKey,
  SCHEDULE,
  type SlotInstance,
  slotKey,
} from "@/lib/data/schedule";
import { combineKey, type WeekData } from "@/lib/data/week";
import { ymd } from "@/lib/utils/date";
import { CrewItem } from "./CrewItem";
import { DeleteCustomTaskButton } from "./DeleteCustomTaskButton";
import { EditableTitle } from "./EditableTitle";

export function TaskCard({
  slot,
  date,
  week,
}: {
  slot: SlotInstance;
  date: Date;
  week: WeekData;
}) {
  const dateStr = ymd(date);
  const sk = slotKey(slot);
  // The default title is what's hardcoded in SCHEDULE (for fixed slots)
  // or the original custom_tasks.title (for custom). slot.title carries
  // whichever is "current" after overrides have already been applied.
  const fixedMatch = SCHEDULE.find(
    (s) => s.dow === date.getDay() && slotKey(s) === sk,
  );
  const defaultTitle = fixedMatch ? fixedMatch.title : slot.title;

  const total = slot.crew.length;
  const done = slot.crew.filter((c) =>
    week.done.has(combineKey(dateStr, sk, c.who)),
  ).length;
  const full = done === total;
  const hasImportant = slot.crew.some((c) =>
    week.important.has(combineKey(dateStr, sk, c.who)),
  );
  const pct = total === 0 ? 0 : Math.round((done * 100) / total);
  const C = 2 * Math.PI * 18;
  const offset = C * (1 - pct / 100);

  return (
    <div
      className={
        "rounded-2xl p-4 mb-3 shadow-sm transition-all " +
        (slot.isCustom ? "border-2 border-dashed " : "border ") +
        (full
          ? "bg-[var(--color-success-soft)] border-[var(--color-success)] opacity-90"
          : hasImportant
            ? "bg-white border-[var(--color-primary)] shadow-[0_2px_12px_rgba(224,122,95,0.15)]"
            : "bg-white border-[var(--color-border)] hover:border-[var(--color-primary-soft)] hover:shadow-md")
      }
    >
      <div className="flex items-center gap-3 mb-3 flex-wrap">
        <div className="font-display font-bold text-base text-[var(--color-primary)] bg-[var(--color-primary-soft)] px-3 py-1 rounded-full">
          {slot.time}
        </div>
        <div className="flex-1 font-semibold min-w-0 text-[var(--color-ink)]">
          <EditableTitle
            dateStr={dateStr}
            slotKey={sk}
            defaultTitle={defaultTitle}
            currentTitle={slot.title}
            doneStrike={full}
          />
        </div>
        {hasImportant && (
          <span className="text-xs font-bold text-[var(--color-primary)] bg-gradient-to-r from-[#FFE9DC] to-[var(--color-primary-soft)] border border-[var(--color-primary)] px-2.5 py-1 rounded-full">
            🚩 สำคัญ
          </span>
        )}
        {slot.isCustom && (
          <span className="text-xs font-semibold text-amber-800 bg-[var(--color-gold-soft)] px-2.5 py-1 rounded-full">
            เพิ่มเอง
          </span>
        )}
        <span className="text-xs text-[var(--color-ink-soft)] bg-[var(--color-bg-2)] px-2.5 py-1 rounded-full">
          {slot.platforms}
        </span>
        {slot.isCustom && slot.id && (
          <DeleteCustomTaskButton id={slot.id} title={slot.title} />
        )}
        <div className="relative w-11 h-11 flex-shrink-0">
          <svg width="44" height="44" style={{ transform: "rotate(-90deg)" }}>
            <circle
              cx="22"
              cy="22"
              r="18"
              fill="none"
              strokeWidth="4"
              stroke="var(--color-bg-2)"
            />
            <circle
              cx="22"
              cy="22"
              r="18"
              fill="none"
              strokeWidth="4"
              stroke={full ? "var(--color-success)" : "var(--color-primary)"}
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={offset}
              style={{ transition: "stroke-dashoffset .6s ease" }}
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center text-[11px] font-bold text-[var(--color-ink)]">
            {done}/{total}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {slot.crew.map((c) => {
          const k = combineKey(dateStr, sk, c.who);
          return (
            <CrewItem
              key={c.who + c.task}
              dateStr={dateStr}
              slotKey={sk}
              crewKey={c.who as CrewKey}
              task={c.task}
              initialDone={week.done.has(k)}
              initialCaption={week.captions.get(k) ?? ""}
              initialImportant={week.important.has(k)}
              initialImage={week.images.get(k) ?? null}
            />
          );
        })}
      </div>
    </div>
  );
}
