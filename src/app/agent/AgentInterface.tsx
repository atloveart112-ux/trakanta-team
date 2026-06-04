"use client";

import { useState, useTransition } from "react";
import {
  applyProposedTasks,
  parseMeetingNotes,
  type ParseResult,
  type ProposedTask,
} from "@/app/actions/agent";
import { CREW, DAY_TH } from "@/lib/data/schedule";

const EXAMPLE = `ประชุม 4/6/2569 14:00
- พุธหน้า 12/6 19:00 ออกกอง Live สดที่ดอกอัญชัน เปิดผ้าใหม่ 5 ตัว — แจ็ค Pop ต่าย
- ศุกร์ 14/6 ลงรีวิวลูกค้า VIP เพิ่ม 1 รายการ FB IG
- พฤหัสถัดไป Art ติดธุระ ขอย้ายคิวถ่ายของแจ็คมา 19/6 19:00 แทน
- เสาร์นี้ลงคลิปทำสีจริง สนใจให้ทำ`;

export function AgentInterface() {
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState<ParseResult | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [applyMsg, setApplyMsg] = useState<string | null>(null);
  const [parsing, startParsing] = useTransition();
  const [applying, startApplying] = useTransition();

  function handleParse() {
    setResult(null);
    setApplyMsg(null);
    startParsing(async () => {
      const r = await parseMeetingNotes(notes);
      setResult(r);
      // Default-select all proposed tasks
      setSelected(new Set(r.actions.map((_, i) => i)));
    });
  }

  function toggleSelect(idx: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }

  function handleApply() {
    if (!result) return;
    const tasks = result.actions.filter((_, i) => selected.has(i));
    if (tasks.length === 0) return;
    startApplying(async () => {
      const r = await applyProposedTasks(tasks);
      if (r.error) {
        setApplyMsg("ผิดพลาด: " + r.error);
      } else {
        setApplyMsg(`เพิ่มงาน ${r.inserted} รายการเรียบร้อย ✓ — ดูที่หน้าหลัก`);
        setResult(null);
        setNotes("");
      }
    });
  }

  return (
    <>
      <section className="bg-white rounded-2xl p-5 mb-5 shadow-[var(--shadow-soft)]">
        <h2 className="font-display font-bold text-base text-[var(--color-ink)] mb-2">
          📝 วางสรุปประชุมที่นี่
        </h2>
        <p className="text-xs text-[var(--color-muted)] mb-3">
          พิมพ์/วางได้ทั้งภาษาไทย-อังกฤษ ผสมก็ได้ ไม่ต้องจัดรูปแบบ
        </p>

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={EXAMPLE}
          rows={10}
          className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)] resize-y font-[inherit]"
        />

        <div className="flex flex-wrap gap-2 mt-3 items-center">
          <button
            onClick={handleParse}
            disabled={parsing || !notes.trim()}
            className="bg-[var(--color-primary)] text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-[#C95E45] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {parsing ? "🤖 AI กำลังคิด..." : "🤖 ให้ AI วางแผนให้"}
          </button>
          <button
            onClick={() => setNotes(EXAMPLE)}
            disabled={parsing}
            className="text-xs px-3 py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-ink-soft)] hover:bg-[var(--color-bg)]"
          >
            ใส่ตัวอย่าง
          </button>
          <button
            onClick={() => {
              setNotes("");
              setResult(null);
              setApplyMsg(null);
            }}
            disabled={parsing}
            className="text-xs px-3 py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-ink-soft)] hover:bg-[var(--color-bg)]"
          >
            ล้าง
          </button>
        </div>
      </section>

      {applyMsg && (
        <div
          className={
            "rounded-xl p-4 mb-5 text-sm " +
            (applyMsg.startsWith("ผิด")
              ? "bg-red-50 border border-red-200 text-red-700"
              : "bg-green-50 border border-green-200 text-green-800 font-semibold")
          }
        >
          {applyMsg}
        </div>
      )}

      {result?.error && (
        <div className="rounded-xl p-4 mb-5 text-sm bg-red-50 border border-red-200 text-red-700">
          ผิดพลาด: {result.error}
        </div>
      )}

      {result && !result.error && (
        <>
          {/* AI text response */}
          {result.text && (
            <section className="bg-[#F0F7FF] border border-blue-200 rounded-2xl p-5 mb-5">
              <div className="text-xs font-semibold text-blue-700 mb-2">
                🤖 AI ตอบ
              </div>
              <div className="text-sm text-[var(--color-ink)] whitespace-pre-line">
                {result.text}
              </div>
            </section>
          )}

          {/* Proposed tasks */}
          {result.actions.length > 0 && (
            <section className="bg-white rounded-2xl p-5 mb-5 shadow-[var(--shadow-soft)]">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div>
                  <h2 className="font-display font-bold text-base text-[var(--color-ink)]">
                    📋 AI เสนอจะเพิ่ม {result.actions.length} งาน
                  </h2>
                  <p className="text-xs text-[var(--color-muted)]">
                    ติ๊กที่อยากรับ → กดยืนยัน
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 mb-4">
                {result.actions.map((task, i) => (
                  <ProposedTaskCard
                    key={i}
                    task={task}
                    selected={selected.has(i)}
                    onToggle={() => toggleSelect(i)}
                  />
                ))}
              </div>

              <div className="flex flex-wrap gap-2 items-center">
                <button
                  onClick={handleApply}
                  disabled={applying || selected.size === 0}
                  className="bg-[var(--color-success)] text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-[#6A9881] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {applying
                    ? "กำลังเพิ่ม..."
                    : `✓ ใช้ ${selected.size} รายการ`}
                </button>
                <button
                  onClick={() =>
                    setSelected(new Set(result.actions.map((_, i) => i)))
                  }
                  disabled={applying}
                  className="text-xs px-3 py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-ink-soft)] hover:bg-[var(--color-bg)]"
                >
                  ติ๊กทั้งหมด
                </button>
                <button
                  onClick={() => setSelected(new Set())}
                  disabled={applying}
                  className="text-xs px-3 py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-ink-soft)] hover:bg-[var(--color-bg)]"
                >
                  ยกเลิกเลือก
                </button>
              </div>
            </section>
          )}

          {result.actions.length === 0 && !result.text && (
            <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl p-5 mb-5 text-sm text-[var(--color-muted)] text-center">
              AI ไม่พบงานที่ชัดเจนพอจากสรุปประชุมนี้ ลองเขียนวันเวลาให้ชัดขึ้น
            </div>
          )}

          {/* Usage stats */}
          <div className="text-xs text-[var(--color-muted)] text-center mb-5 font-mono">
            💸 ใช้ {result.usage.inputTokens + result.usage.cacheReadTokens + result.usage.cacheCreationTokens} input +{" "}
            {result.usage.outputTokens} output tokens
            {result.usage.cacheReadTokens > 0 && (
              <>
                {" "}
                · 🚀 อ่านจาก cache {result.usage.cacheReadTokens} tokens
                (ประหยัด ~90%)
              </>
            )}
          </div>
        </>
      )}
    </>
  );
}

function ProposedTaskCard({
  task,
  selected,
  onToggle,
}: {
  task: ProposedTask;
  selected: boolean;
  onToggle: () => void;
}) {
  const d = new Date(task.date + "T00:00:00");
  const dayLabel = isNaN(d.getTime())
    ? task.date
    : `${DAY_TH[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}`;

  return (
    <label
      className={
        "flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition " +
        (selected
          ? "border-[var(--color-success)] bg-[var(--color-success-soft)]/40"
          : "border-[var(--color-border)] bg-[var(--color-bg)] hover:border-[var(--color-primary-soft)]")
      }
    >
      <input
        type="checkbox"
        checked={selected}
        onChange={onToggle}
        className="w-5 h-5 mt-0.5 accent-[var(--color-success)] flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="font-display font-bold text-sm text-[var(--color-ink)]">
            {dayLabel}
          </span>
          <span className="text-xs font-bold text-[var(--color-primary)] bg-[var(--color-primary-soft)] px-2 py-0.5 rounded-full">
            {task.time}
          </span>
        </div>
        <div className="font-semibold text-base text-[var(--color-ink)] mb-1">
          {task.title}
        </div>
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-[var(--color-ink-soft)] bg-white border border-[var(--color-border)] px-2 py-0.5 rounded-full">
            {task.platforms}
          </span>
          {task.crew_members.map((k) => {
            const info = CREW[k];
            return (
              <span
                key={k}
                className="font-bold px-2 py-0.5 rounded-full"
                style={{
                  color: info.hex,
                  background: "rgba(0,0,0,0.04)",
                }}
              >
                {info.name}
              </span>
            );
          })}
        </div>
      </div>
    </label>
  );
}
