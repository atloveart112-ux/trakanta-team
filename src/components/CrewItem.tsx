"use client";

import { useRef, useState, useTransition } from "react";
import {
  deleteImage,
  saveCaption,
  toggleCheck,
  toggleImportant,
  uploadImage,
} from "@/app/actions/tasks";
import { CREW, type CrewKey } from "@/lib/data/schedule";
import type { ImageInfo } from "@/lib/data/week";

export function CrewItem({
  dateStr,
  slotKey,
  crewKey,
  task,
  initialDone,
  initialCaption,
  initialImportant,
  initialImage,
}: {
  dateStr: string;
  slotKey: string;
  crewKey: CrewKey;
  task: string;
  initialDone: boolean;
  initialCaption: string;
  initialImportant: boolean;
  initialImage: ImageInfo | null;
}) {
  const info = CREW[crewKey];
  const [expanded, setExpanded] = useState(false);
  const [caption, setCaption] = useState(initialCaption);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();

  function flash(msg: string, ms = 1800) {
    setSavedMsg(msg);
    setTimeout(() => setSavedMsg(null), ms);
  }

  function handleToggle() {
    startTransition(async () => {
      await toggleCheck(dateStr, slotKey, crewKey);
    });
  }
  function handleImportant() {
    startTransition(async () => {
      await toggleImportant(dateStr, slotKey, crewKey);
    });
  }
  async function handleSaveCaption() {
    await saveCaption(dateStr, slotKey, crewKey, caption);
    flash("บันทึกแล้ว ✓");
  }
  async function handleCopyCaption() {
    if (!caption.trim()) return;
    try {
      await navigator.clipboard.writeText(caption);
      flash("คัดลอกแล้ว ✓");
    } catch {
      flash("คัดลอกไม่สำเร็จ");
    }
  }

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      flash("ไฟล์ต้องเป็นรูปภาพ");
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      flash("ไฟล์ใหญ่เกิน 25MB");
      return;
    }
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("date", dateStr);
    fd.append("slot_key", slotKey);
    fd.append("crew_key", crewKey);
    const result = await uploadImage(fd);
    setUploading(false);
    if (result.error) flash("ผิดพลาด: " + result.error, 3000);
    else flash("อัปโหลดแล้ว ✓");
  }

  function handleDeleteImage() {
    if (!confirm("ลบรูปที่แนบไว้?")) return;
    startTransition(async () => {
      await deleteImage(dateStr, slotKey, crewKey);
    });
  }

  function handleDownload() {
    if (!initialImage?.url) return;
    const a = document.createElement("a");
    a.href = initialImage.url;
    a.download = initialImage.fileName || "image";
    a.target = "_blank";
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  return (
    <div
      className={
        "rounded-xl overflow-hidden border transition-all " +
        (initialDone
          ? "bg-[var(--color-success-soft)] border-[var(--color-success)] "
          : "bg-[var(--color-bg)] border-[var(--color-border)] ") +
        (initialImportant ? "ring-2 ring-[var(--color-primary)] " : "")
      }
      style={
        initialImportant
          ? {
              background:
                "linear-gradient(to right, #FFF0E5 0%, var(--color-bg) 70%)",
            }
          : undefined
      }
    >
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        <button
          onClick={handleToggle}
          disabled={pending}
          className="w-6 h-6 rounded-lg border-2 grid place-items-center flex-shrink-0 transition-transform hover:scale-110 disabled:opacity-50"
          style={{
            borderColor: info.hex,
            background: initialDone ? info.hex : "white",
          }}
          aria-label={initialDone ? "ยกเลิก" : "ติ๊กว่าเสร็จ"}
        >
          {initialDone && (
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="none">
              <polyline
                points="20 6 9 17 4 12"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>

        <button
          onClick={() => setExpanded((x) => !x)}
          className="flex-1 min-w-0 text-left"
        >
          <div
            className="font-display font-bold text-sm flex items-center gap-1"
            style={{ color: info.hex }}
          >
            {initialImportant && <span>🚩</span>}
            {info.name}
          </div>
          <div
            className={
              "text-xs " +
              (initialDone
                ? "text-[var(--color-muted)] line-through"
                : "text-[var(--color-muted)]")
            }
          >
            {task}
          </div>
        </button>

        <div className="flex items-center gap-1 text-xs">
          {initialCaption && <span title="มีข้อความ">📝</span>}
          {initialImage && <span title="มีรูป">🖼️</span>}
        </div>

        <button
          onClick={() => setExpanded((x) => !x)}
          className={
            "text-xs px-2 py-1 rounded-full border transition-all " +
            (expanded
              ? "bg-[var(--color-primary-soft)] border-[var(--color-primary-soft)] text-[var(--color-primary)] rotate-180"
              : "border-[var(--color-border)] text-[var(--color-muted)] hover:bg-[var(--color-bg-2)]")
          }
          aria-label="ขยาย"
        >
          ▾
        </button>
      </div>

      {expanded && (
        <div className="px-3 pb-3 pt-2 border-t border-dashed border-[var(--color-border)] bg-white/60">
          {/* ---- Caption ---- */}
          <div className="text-[10px] uppercase tracking-wider text-[var(--color-muted)] font-semibold mb-1.5">
            ข้อความ / Caption
          </div>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            onBlur={handleSaveCaption}
            placeholder={`พิมพ์${task}ที่นี่...`}
            rows={3}
            className="w-full px-3 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)] resize-y"
          />
          <div className="flex flex-wrap gap-1.5 mt-2 mb-3 items-center">
            <button
              onClick={handleCopyCaption}
              className="text-xs bg-[var(--color-primary)] text-white px-3 py-1.5 rounded-lg hover:bg-[#C95E45] disabled:opacity-50"
              disabled={!caption.trim()}
            >
              📋 คัดลอก
            </button>
            <button
              onClick={handleSaveCaption}
              className="text-xs px-3 py-1.5 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-bg-2)]"
            >
              บันทึก
            </button>
            <button
              onClick={handleImportant}
              disabled={pending}
              className={
                "text-xs px-3 py-1.5 rounded-full border transition-all disabled:opacity-50 " +
                (initialImportant
                  ? "bg-gradient-to-r from-[#FFE9DC] to-[var(--color-primary-soft)] border-[var(--color-primary)] text-[var(--color-primary)] font-semibold shadow"
                  : "border-[var(--color-border)] text-[var(--color-muted)] hover:bg-[var(--color-bg-2)]")
              }
            >
              🚩 {initialImportant ? "สำคัญ ✓" : "ทำเครื่องหมายว่าสำคัญ"}
            </button>
          </div>

          {/* ---- Image ---- */}
          <div className="text-[10px] uppercase tracking-wider text-[var(--color-muted)] font-semibold mb-1.5">
            รูป / ไฟล์แนบ
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.target.value = "";
            }}
          />
          {initialImage?.url ? (
            <div className="border-2 border-solid rounded-xl p-2 bg-white" style={{ borderColor: info.hex }}>
              {/* Using <img> for blob/signed URL to avoid Next/Image domain config */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={initialImage.url}
                alt={initialImage.fileName}
                className="max-w-full max-h-60 mx-auto rounded-lg block"
              />
              <div className="text-[10px] text-[var(--color-muted)] mt-1.5 text-center font-mono">
                {initialImage.fileName}
                {initialImage.fileSize
                  ? ` · ${Math.round(initialImage.fileSize / 1024)} KB`
                  : ""}
              </div>
              <div className="flex gap-1.5 mt-2 justify-center flex-wrap">
                <button
                  onClick={handleDownload}
                  className="text-xs bg-[var(--color-primary)] text-white px-3 py-1.5 rounded-lg hover:bg-[#C95E45]"
                >
                  ⬇ ดาวน์โหลด
                </button>
                <button
                  onClick={handleDeleteImage}
                  disabled={pending}
                  className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-50"
                >
                  🗑️ ลบรูป
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => !uploading && fileRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const f = e.dataTransfer.files?.[0];
                if (f) handleFile(f);
              }}
              className={
                "border-2 border-dashed rounded-xl p-4 text-center cursor-pointer bg-[var(--color-bg)] transition-all text-xs text-[var(--color-muted)] " +
                (dragOver
                  ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-[var(--color-ink)]"
                  : "hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-soft)]/30")
              }
              style={dragOver ? { borderColor: info.hex } : undefined}
            >
              {uploading ? (
                <>กำลังอัปโหลด...</>
              ) : (
                <>
                  <div className="text-2xl mb-1">🖼️</div>
                  ลากรูปมาวาง · หรือคลิกเพื่อเลือกไฟล์
                </>
              )}
            </div>
          )}

          {savedMsg && (
            <div className="text-xs text-[var(--color-success)] font-semibold mt-2 text-center">
              {savedMsg}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
