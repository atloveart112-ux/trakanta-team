"use client";

import { useEffect, useState } from "react";
import { DAY_TH } from "@/lib/data/schedule";
import { pad } from "@/lib/utils/date";

function greetingFor(hour: number) {
  if (hour < 11) return { th: "อรุณสวัสดิ์ค่ะ", emoji: "☀️" };
  if (hour < 13) return { th: "สวัสดีตอนกลางวัน", emoji: "🌤" };
  if (hour < 17) return { th: "สวัสดีตอนบ่าย", emoji: "☕" };
  if (hour < 20) return { th: "สวัสดีตอนเย็น", emoji: "🌅" };
  return { th: "สวัสดีตอนค่ำ", emoji: "🌙" };
}

export function Greeting({ name }: { name: string }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  if (!now) {
    // SSR placeholder to avoid hydration mismatch
    return (
      <div className="text-right">
        <div className="font-display text-base font-semibold text-[var(--color-ink)]">
          ยินดีต้อนรับค่ะ {name}
        </div>
      </div>
    );
  }

  const g = greetingFor(now.getHours());
  return (
    <div className="text-right">
      <div className="font-display text-base font-semibold text-[var(--color-ink)]">
        {g.th} {g.emoji} {name}
      </div>
      <div className="text-xs text-[var(--color-muted)] mt-0.5">
        วัน{DAY_TH[now.getDay()]} · {pad(now.getHours())}:{pad(now.getMinutes())}
      </div>
    </div>
  );
}
