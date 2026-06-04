"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { setPlatformsOverride } from "@/app/actions/tasks";

/**
 * Inline-editable platforms pill (e.g. "FB, IG").
 * Same IME-safe pattern as EditableTitle.
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

  useEffect(() => {
    if (!editing) setValue(currentPlatforms);
  }, [currentPlatforms, editing]);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  function save(finalValue: string) {
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
    setValue(currentPlatforms);
    setEditing(false);
  }

  if (editing) {
    return (
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
          if (isComposing) return;
          save(e.currentTarget.value);
        }}
        onKeyDown={(e) => {
          if (isComposing) return;
          if (e.key === "Enter") {
            e.preventDefault();
            save(e.currentTarget.value);
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
        className="bg-white border border-[var(--color-primary)] rounded-full px-2.5 py-1 text-xs text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-soft)] min-w-[120px]"
      />
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
