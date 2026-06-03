import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CREW, type CrewKey } from "@/lib/data/schedule";
import { relativeTimeTh } from "@/lib/utils/relativeTime";

type ActivityRow = {
  id: string;
  action: string;
  date: string | null;
  slot_key: string | null;
  crew_key: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  actor: { display_name: string } | null;
};

const ACTION_LABEL: Record<string, { verb: string; icon: string; tone: string }> = {
  check: { verb: "ติ๊กว่าเสร็จ", icon: "✓", tone: "text-emerald-700 bg-emerald-50" },
  uncheck: { verb: "ยกเลิกการติ๊ก", icon: "↺", tone: "text-amber-700 bg-amber-50" },
  caption_update: { verb: "อัปเดตข้อความ", icon: "📝", tone: "text-sky-700 bg-sky-50" },
  caption_clear: { verb: "ลบข้อความ", icon: "✗", tone: "text-rose-700 bg-rose-50" },
  image_upload: { verb: "อัปโหลดรูป", icon: "🖼️", tone: "text-violet-700 bg-violet-50" },
  image_delete: { verb: "ลบรูป", icon: "🗑️", tone: "text-rose-700 bg-rose-50" },
  important_on: { verb: "ติดธงสำคัญ", icon: "🚩", tone: "text-orange-700 bg-orange-50" },
  important_off: { verb: "ปลดธงสำคัญ", icon: "🏳️", tone: "text-stone-700 bg-stone-100" },
  task_add: { verb: "เพิ่มงานใหม่", icon: "＋", tone: "text-amber-800 bg-amber-50" },
  task_delete: { verb: "ลบงาน", icon: "🗑️", tone: "text-rose-700 bg-rose-50" },
};

function describeTarget(row: ActivityRow): string {
  // Custom tasks store title in metadata
  if (
    (row.action === "task_add" || row.action === "task_delete") &&
    row.metadata &&
    typeof row.metadata === "object"
  ) {
    const m = row.metadata as { title?: string; time?: string };
    if (m.title) return `${m.time ? m.time + " · " : ""}${m.title}`;
  }
  if (row.slot_key && row.slot_key.includes("|")) {
    const [time, title] = row.slot_key.split("|");
    return `${time} · ${title}`;
  }
  if (row.slot_key) return row.slot_key;
  return "";
}

export default async function ActivityPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: events } = await supabase
    .from("activity_log")
    .select(
      `id, action, date, slot_key, crew_key, metadata, created_at,
       actor:profiles(display_name)`,
    )
    .order("created_at", { ascending: false })
    .limit(200);

  const rows = (events ?? []) as unknown as ActivityRow[];

  // Group by date string (YYYY-MM-DD of created_at, Bangkok)
  const groups = new Map<string, ActivityRow[]>();
  rows.forEach((r) => {
    const d = new Date(r.created_at);
    const k = d.toLocaleDateString("th-TH", {
      weekday: "long",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    const arr = groups.get(k) ?? [];
    arr.push(r);
    groups.set(k, arr);
  });

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-5 py-5">
      <header className="flex items-center justify-between gap-3 p-4 mb-5 bg-white rounded-2xl shadow-[var(--shadow-soft)]">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="w-10 h-10 rounded-full bg-[var(--color-bg)] grid place-items-center hover:bg-[var(--color-bg-2)] transition"
            aria-label="กลับหน้าหลัก"
          >
            ←
          </Link>
          <div>
            <h1 className="font-display font-bold text-lg text-[var(--color-ink)]">
              ประวัติการทำงาน
            </h1>
            <p className="text-xs text-[var(--color-muted)]">
              ใครทำอะไร เมื่อไหร่ — 200 รายการล่าสุด
            </p>
          </div>
        </div>
      </header>

      {rows.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center text-[var(--color-muted)] shadow-[var(--shadow-soft)]">
          ยังไม่มีกิจกรรม — ลองติ๊กงาน หรือพิมพ์แคปชั่นดูค่ะ
        </div>
      ) : (
        Array.from(groups.entries()).map(([dayLabel, items]) => (
          <section key={dayLabel} className="mb-5">
            <h2 className="font-display font-bold text-sm text-[var(--color-ink-soft)] mb-2 px-2">
              {dayLabel}
            </h2>
            <div className="bg-white rounded-2xl shadow-[var(--shadow-soft)] divide-y divide-[var(--color-border)]">
              {items.map((row) => {
                const label =
                  ACTION_LABEL[row.action] ??
                  { verb: row.action, icon: "•", tone: "text-stone-700 bg-stone-100" };
                const who = row.actor?.display_name ?? "ไม่ทราบ";
                const target = describeTarget(row);
                const crew = row.crew_key
                  ? CREW[row.crew_key as CrewKey]
                  : null;
                return (
                  <div key={row.id} className="px-4 py-3 flex items-start gap-3">
                    <div
                      className={
                        "w-9 h-9 rounded-full grid place-items-center text-sm flex-shrink-0 " +
                        label.tone
                      }
                    >
                      {label.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm">
                        <span className="font-display font-bold text-[var(--color-ink)]">
                          {who}
                        </span>{" "}
                        <span className="text-[var(--color-ink-soft)]">
                          {label.verb}
                        </span>
                        {crew && (
                          <span
                            className="ml-1.5 text-xs px-2 py-0.5 rounded-full font-semibold"
                            style={{
                              color: crew.hex,
                              background: "rgba(0,0,0,0.04)",
                            }}
                          >
                            {crew.name}
                          </span>
                        )}
                      </div>
                      {target && (
                        <div className="text-xs text-[var(--color-muted)] mt-0.5 truncate">
                          {target}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-[var(--color-muted)] flex-shrink-0">
                      {relativeTimeTh(row.created_at)}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
