"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { setTitleOverride } from "@/app/actions/tasks";

/**
 * Inline-editable task title.
 *
 * - Click to edit. Shows current title (override or default).
 * - Enter or blur → save. Escape → cancel.
 * - Clearing to empty resets to the default title.
 */
export function EditableTitle({
  dateStr,
  slotKey,
  defaultTitle,
  currentTitle,
  className,
  doneStrike,
}: {
  dateStr: string;
  slotKey: string;
  defaultTitle: string;
  currentTitle: string;
  className?: string;
  doneStrike?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(currentTitle);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep local value in sync if parent updates
  useEffect(() => {
    if (!editing) setValue(currentTitle);
  }, [currentTitle, editing]);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  function save() {
    const trimmed = value.trim();
    setEditing(false);
    if (trimmed === currentTitle) return;
    startTransition(async () => {
      // Empty or back-to-default → clear override
      const final = !trimmed || trimmed === defaultTitle ? null : trimmed;
      await setTitleOverride(dateStr, slotKey, final);
    });
  }

  function cancel() {
    setValue(currentTitle);
    setEditing(false);
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            save();
          }
          if (e.key === "Escape") {
            e.preventDefault();
            cancel();
          }
        }}
        disabled={pending}
        className={
          "bg-white border border-[var(--color-primary)] rounded-lg px-2 py-1 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-soft)] " +
          (className ?? "")
        }
      />
    );
  }

  const isOverridden = currentTitle !== defaultTitle;

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        setEditing(true);
      }}
      title={
        isOverridden
          ? `แก้ไขแล้ว (ชื่อเดิม: ${defaultTitle}) — คลิกเพื่อแก้`
          : "คลิกเพื่อแก้ไขชื่อ"
      }
      className={
        "group inline-flex items-center gap-1.5 text-left rounded px-1 -mx-1 hover:bg-[var(--color-primary-soft)]/40 transition " +
        (doneStrike ? "line-through text-[var(--color-muted)] " : "") +
        (className ?? "")
      }
    >
      <span>{currentTitle}</span>
      {isOverridden && (
        <span className="text-[10px] text-[var(--color-primary)] font-normal">
          ✎
        </span>
      )}
      <span className="opacity-0 group-hover:opacity-50 text-xs">✏️</span>
    </button>
  );
}
