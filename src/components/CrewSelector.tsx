"use client";

import { useState, useTransition } from "react";
import { setMyCrewKey } from "@/app/actions/push";
import { CREW, type CrewKey } from "@/lib/data/schedule";

export function CrewSelector({
  initial,
}: {
  initial: CrewKey | null;
}) {
  const [current, setCurrent] = useState<CrewKey | null>(initial);
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  function pick(key: CrewKey | null) {
    setCurrent(key);
    startTransition(async () => {
      const result = await setMyCrewKey(key);
      if (result.error) setMsg("ผิดพลาด: " + result.error);
      else setMsg("บันทึกแล้ว ✓");
      setTimeout(() => setMsg(null), 2000);
    });
  }

  return (
    <div className="bg-[var(--color-bg)] rounded-xl p-4 border border-[var(--color-border)]">
      <div className="mb-3">
        <div className="font-display font-bold text-sm text-[var(--color-ink)]">
          ฉันรับบทบาทอะไรในทีม?
        </div>
        <div className="text-xs text-[var(--color-muted)] mt-0.5">
          เลือกเพื่อให้แจ้งเตือนเฉพาะงานของคุณ
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {(Object.keys(CREW) as CrewKey[]).map((k) => {
          const info = CREW[k];
          const selected = current === k;
          return (
            <button
              key={k}
              onClick={() => pick(k)}
              disabled={pending}
              className={
                "rounded-xl p-2.5 border-2 transition-all text-center disabled:opacity-50 " +
                (selected
                  ? "shadow-md scale-105"
                  : "border-[var(--color-border)] bg-white hover:scale-105")
              }
              style={
                selected
                  ? { borderColor: info.hex, background: "white" }
                  : undefined
              }
            >
              <div
                className="font-display font-bold text-sm"
                style={{ color: info.hex }}
              >
                {info.name}
              </div>
              <div className="text-[10px] text-[var(--color-muted)] mt-0.5">
                {info.verb}
              </div>
            </button>
          );
        })}
        <button
          onClick={() => pick(null)}
          disabled={pending}
          className={
            "rounded-xl p-2.5 border-2 transition-all text-center disabled:opacity-50 " +
            (current === null
              ? "border-[var(--color-muted)] bg-white shadow-md scale-105"
              : "border-[var(--color-border)] bg-white hover:scale-105")
          }
        >
          <div className="font-display font-bold text-sm text-[var(--color-muted)]">
            ผู้สังเกตการณ์
          </div>
          <div className="text-[10px] text-[var(--color-muted)] mt-0.5">
            ดูภาพรวมทีม
          </div>
        </button>
      </div>

      {msg && (
        <div className="text-xs mt-2 text-[var(--color-ink-soft)]">{msg}</div>
      )}
    </div>
  );
}
