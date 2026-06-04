"use client";

import Link from "next/link";

export function ViewToggle({
  current,
}: {
  current: "week" | "month";
}) {
  return (
    <div className="inline-flex rounded-full bg-[var(--color-bg-2)] p-1">
      <Link
        href="/"
        className={
          "px-4 py-1.5 rounded-full text-xs font-semibold transition " +
          (current === "week"
            ? "bg-white text-[var(--color-primary)] shadow"
            : "text-[var(--color-ink-soft)]")
        }
      >
        สัปดาห์
      </Link>
      <Link
        href="/?view=month"
        className={
          "px-4 py-1.5 rounded-full text-xs font-semibold transition " +
          (current === "month"
            ? "bg-white text-[var(--color-primary)] shadow"
            : "text-[var(--color-ink-soft)]")
        }
      >
        เดือน
      </Link>
    </div>
  );
}
