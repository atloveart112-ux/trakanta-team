"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * Wraps an arbitrary trigger element. When clicked, opens a modal showing
 * the `content` (pre-rendered server-side and passed in as ReactNode).
 *
 * Used by WeekPanel rows and ImportantPanel items to let users edit any
 * task in the week without navigating away.
 */
export function TaskModalTrigger({
  trigger,
  content,
  className,
}: {
  trigger: ReactNode;
  content: ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          "w-full text-left " + (className ?? "")
        }
      >
        {trigger}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center p-3 sm:p-6">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div
            className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-[var(--color-border)] px-5 py-3 flex items-center justify-between z-10 rounded-t-2xl">
              <div className="font-display font-bold text-[var(--color-ink)]">
                รายละเอียดงาน
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-9 h-9 rounded-full bg-[var(--color-bg)] hover:bg-red-50 hover:text-red-700 transition grid place-items-center"
                aria-label="ปิด"
              >
                ✕
              </button>
            </div>
            <div className="p-5">{content}</div>
          </div>
        </div>
      )}
    </>
  );
}
