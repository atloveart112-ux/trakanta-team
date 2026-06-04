"use client";

import { useState, useTransition } from "react";
import { addCustomTask } from "@/app/actions/tasks";
import { CREW, type CrewKey, DAY_TH } from "@/lib/data/schedule";

export function AddTaskButton({
  dateStr,
  date,
  size = "large",
}: {
  dateStr: string;
  date: Date;
  size?: "large" | "small";
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      formData.set("date", dateStr);
      const result = await addCustomTask(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setOpen(false);
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          "w-full border-2 border-dashed border-[var(--color-border)] rounded-xl text-[var(--color-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-soft)]/40 transition-all " +
          (size === "large"
            ? "min-h-[44px] py-2.5 px-4 text-sm mt-3"
            : "min-h-[34px] py-1.5 px-3 text-xs mt-2 bg-transparent")
        }
      >
        ＋ เพิ่มงาน{size === "large" ? "วันนี้" : ""}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={() => setOpen(false)}
          />
          <div
            className="fixed inset-0 z-50 grid place-items-center p-4 pointer-events-none"
            onClick={() => setOpen(false)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-display font-bold text-lg text-[var(--color-ink)]">
                    ＋ เพิ่มงานใหม่
                  </h3>
                  <p className="text-xs text-[var(--color-muted)] mt-0.5">
                    วัน{DAY_TH[date.getDay()]} {date.getDate()}/
                    {date.getMonth() + 1}/{date.getFullYear() + 543}
                  </p>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="w-9 h-9 rounded-full bg-[var(--color-bg)] hover:bg-red-50 hover:text-red-700 transition"
                >
                  ✕
                </button>
              </div>

              <form action={handleSubmit}>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-3 py-2 mb-3 text-sm">
                    {error}
                  </div>
                )}

                <label className="block mb-3">
                  <span className="text-xs font-semibold text-[var(--color-ink-soft)] mb-1 block">
                    เวลา
                  </span>
                  <input
                    type="time"
                    name="time"
                    defaultValue="10:00"
                    required
                    className="w-full px-3 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)]"
                  />
                </label>

                <label className="block mb-3">
                  <span className="text-xs font-semibold text-[var(--color-ink-soft)] mb-1 block">
                    ชื่องาน
                  </span>
                  <input
                    type="text"
                    name="title"
                    placeholder="เช่น ภาพนิ่งเพิ่ม, รีวิวลูกค้าใหม่"
                    maxLength={80}
                    autoFocus
                    required
                    className="w-full px-3 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)]"
                  />
                </label>

                <label className="block mb-3">
                  <span className="text-xs font-semibold text-[var(--color-ink-soft)] mb-1 block">
                    แพลตฟอร์ม
                  </span>
                  <input
                    type="text"
                    name="platforms"
                    defaultValue="FB, IG"
                    placeholder="เช่น FB, IG"
                    className="w-full px-3 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)]"
                  />
                </label>

                <fieldset className="block mb-4">
                  <legend className="text-xs font-semibold text-[var(--color-ink-soft)] mb-2">
                    ทีมงาน — เลือกใครก็ได้กี่คนก็ได้
                  </legend>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.keys(CREW) as CrewKey[]).map((k) => {
                      const info = CREW[k];
                      return (
                        <label
                          key={k}
                          className="flex items-center gap-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2.5 cursor-pointer hover:border-[var(--color-primary-soft)] has-checked:border-[var(--crew-c)] has-checked:bg-white transition"
                          style={
                            { "--crew-c": info.hex } as React.CSSProperties
                          }
                        >
                          <input
                            type="checkbox"
                            name="crew_members"
                            value={k}
                            defaultChecked
                            className="w-4 h-4 accent-[var(--color-primary)]"
                          />
                          <div className="flex-1 min-w-0">
                            <div
                              className="font-display font-bold text-sm"
                              style={{ color: info.hex }}
                            >
                              {info.name}
                            </div>
                            <div className="text-[10px] text-[var(--color-muted)]">
                              {info.verb}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={pending}
                    className="flex-1 bg-[var(--color-primary)] text-white font-semibold py-2.5 rounded-xl hover:bg-[#C95E45] transition disabled:opacity-50"
                  >
                    {pending ? "กำลังเพิ่ม..." : "＋ เพิ่มงานนี้"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-bg)]"
                  >
                    ยกเลิก
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </>
  );
}
