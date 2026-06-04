"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { setTitleOverride } from "@/app/actions/tasks";

/**
 * Inline-editable task title with EXPLICIT ✓/✗ buttons.
 *
 * - Click title → enters edit mode
 * - Type → updates local value only
 * - Click ✓ or press Enter → save
 * - Click ✗ or press Esc → cancel
 * - Click anywhere outside → save (blur)
 *
 * IME-safe: composition events are tracked so Enter doesn't fire while
 * Thai IME is composing a character. The ✓ button uses mousedown.preventDefault
 * to avoid the blur-then-click race that was losing edits.
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
  const cancelingRef = useRef(false);

  // Sync external value into the field only when NOT actively editing or saving.
  // Without `pending` guard, the field briefly shows the old title between
  // setEditing(false) and the server's revalidate.
  useEffect(() => {
    if (!editing && !pending) setValue(currentTitle);
  }, [currentTitle, editing, pending]);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  function commit(finalValue: string) {
    const trimmed = finalValue.trim();
    setEditing(false);
    if (trimmed === currentTitle) return;
    startTransition(async () => {
      const out = !trimmed || trimmed === defaultTitle ? null : trimmed;
      await setTitleOverride(dateStr, slotKey, out);
    });
  }

  function cancel() {
    cancelingRef.current = true;
    setValue(currentTitle);
    setEditing(false);
    // Reset on next tick — blur fires synchronously after this
    setTimeout(() => {
      cancelingRef.current = false;
    }, 0);
  }

  if (editing) {
    return (
      <span className="inline-flex items-center gap-1.5 flex-wrap">
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
            // Skip blur-save if Cancel button initiated this blur
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
          lang="th"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          className={
            "bg-white border-2 border-[var(--color-primary)] rounded-lg px-2 py-1 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-soft)] min-w-[180px] " +
            (className ?? "")
          }
        />
        <button
          type="button"
          // preventDefault on mousedown prevents the input from blurring before
          // our onClick fires — without this, the input blur-saves with the
          // wrong value or fires twice.
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => commit(value)}
          disabled={pending}
          title="บันทึก (Enter)"
          className="w-8 h-8 grid place-items-center rounded-lg bg-[var(--color-success)] text-white text-lg font-bold hover:bg-[#6A9881] transition disabled:opacity-50"
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
          className="w-8 h-8 grid place-items-center rounded-lg bg-white border border-[var(--color-border)] text-[var(--color-muted)] text-base font-bold hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition disabled:opacity-50"
        >
          ✕
        </button>
      </span>
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
