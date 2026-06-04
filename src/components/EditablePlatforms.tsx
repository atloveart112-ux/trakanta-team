"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { setPlatformsOverride } from "@/app/actions/tasks";

/**
 * Inline-editable platforms pill (e.g. "FB, IG").
 * Same pattern as EditableTitle — explicit ✓/✗ buttons + IME-safe.
 */
export function EditablePlatforms({
  dateStr,
  slotKey,
  defaultPlatforms,
  currentPlatforms,
}: {
  dateStr: string;
  slotKey: string;
  defaultPlatforms: string;
  currentPlatforms: string;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(currentPlatforms);
  const [isComposing, setIsComposing] = useState(false);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const cancelingRef = useRef(false);

  useEffect(() => {
    if (!editing && !pending) setValue(currentPlatforms);
  }, [currentPlatforms, editing, pending]);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  function commit(finalValue: string) {
    const trimmed = finalValue.trim();
    setEditing(false);
    if (trimmed === currentPlatforms) return;
    startTransition(async () => {
      const out =
        !trimmed || trimmed === defaultPlatforms ? null : trimmed;
      await setPlatformsOverride(dateStr, slotKey, out);
    });
  }

  function cancel() {
    cancelingRef.current = true;
    setValue(currentPlatforms);
    setEditing(false);
    setTimeout(() => {
      cancelingRef.current = false;
    }, 0);
  }

  if (editing) {
    return (
      <span className="inline-flex items-center gap-1">
        <input
          ref={inputRef}
          value={value}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={(e) => {
            setIsComposing(false);
            setValue(e.currentTarget.value);
          }}
          onChange={(e) => setValue(e.target.value)}
          onBlur={(e) => {
            if (cancelingRef.current) return;
            commit(e.currentTarget.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !isComposing) {
              e.preventDefault();
              commit(e.currentTarget.value);
            }
            if (e.key === "Escape") {
              e.preventDefault();
              cancel();
            }
          }}
          disabled={pending}
          placeholder="FB, IG, TikTok ..."
          lang="th"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          className="bg-white border-2 border-[var(--color-primary)] rounded-full px-2.5 py-1 text-xs text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-soft)] min-w-[140px]"
        />
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => commit(value)}
          disabled={pending}
          title="บันทึก (Enter)"
          className="w-6 h-6 grid place-items-center rounded-full bg-[var(--color-success)] text-white text-xs font-bold hover:bg-[#6A9881] transition disabled:opacity-50"
        >
          ✓
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            cancelingRef.current = true;
          }}
          onClick={cancel}
          disabled={pending}
          title="ยกเลิก (Esc)"
          className="w-6 h-6 grid place-items-center rounded-full bg-white border border-[var(--color-border)] text-[var(--color-muted)] text-xs font-bold hover:bg-red-50 hover:text-red-700 transition disabled:opacity-50"
        >
          ✕
        </button>
      </span>
    );
  }

  const isOverridden = currentPlatforms !== defaultPlatforms;

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        setEditing(true);
      }}
      title={
        isOverridden
          ? `แก้ไขแล้ว (เดิม: ${defaultPlatforms}) — คลิกเพื่อแก้`
          : "คลิกเพื่อแก้ไขแพลตฟอร์ม"
      }
      className={
        "group inline-flex items-center gap-1 text-xs text-[var(--color-ink-soft)] bg-[var(--color-bg-2)] px-2.5 py-1 rounded-full hover:bg-[var(--color-primary-soft)]/60 transition " +
        (isOverridden ? "text-[var(--color-primary)] font-semibold " : "")
      }
    >
      <span>{currentPlatforms}</span>
      {isOverridden && <span className="text-[9px]">✎</span>}
      <span className="opacity-0 group-hover:opacity-50 text-[10px]">✏️</span>
    </button>
  );
}
