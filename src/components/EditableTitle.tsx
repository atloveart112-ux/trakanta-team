"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { setTitleOverride } from "@/app/actions/tasks";

/**
 * Inline-editable task title.
 *
 * IME-safe: tracks composition (Thai input uses combining characters)
 * so saves only fire on COMPLETE composed strings, not mid-composition.
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
  const [isComposing, setIsComposing] = useState(false);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editing) setValue(currentTitle);
  }, [currentTitle, editing]);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  function save(finalValue: string) {
    const trimmed = finalValue.trim();
    setEditing(false);
    if (trimmed === currentTitle) return;
    startTransition(async () => {
      const out =
        !trimmed || trimmed === defaultTitle ? null : trimmed;
      await setTitleOverride(dateStr, slotKey, out);
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
        // Mark composition state so blur/Enter don't fire mid-character on Thai IME
        onCompositionStart={() => setIsComposing(true)}
        onCompositionEnd={(e) => {
          setIsComposing(false);
          // Use the final composed value from the event
          setValue(e.currentTarget.value);
        }}
        onChange={(e) => setValue(e.target.value)}
        onBlur={(e) => {
          // Don't save mid-composition; the next composition_end will catch up
          if (isComposing) return;
          save(e.currentTarget.value);
        }}
        onKeyDown={(e) => {
          if (isComposing) return; // IME handles Enter for composition confirmation
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
        lang="th"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
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
