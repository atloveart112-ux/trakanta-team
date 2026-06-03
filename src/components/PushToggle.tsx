"use client";

import { useEffect, useState } from "react";
import { subscribeToPush, unsubscribeFromPush } from "@/app/actions/push";

type Status =
  | "loading"
  | "unsupported"
  | "denied"
  | "enabled"
  | "disabled";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) out[i] = raw.charCodeAt(i);
  return out;
}

export function PushToggle({ vapidPublicKey }: { vapidPublicKey: string }) {
  const [status, setStatus] = useState<Status>("loading");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  function flash(m: string, ms = 2500) {
    setMsg(m);
    setTimeout(() => setMsg(null), ms);
  }

  async function refresh() {
    if (typeof window === "undefined") return;
    if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      setStatus("unsupported");
      return;
    }
    if (Notification.permission === "denied") {
      setStatus("denied");
      return;
    }
    try {
      const reg = await navigator.serviceWorker.getRegistration("/sw.js");
      if (!reg) {
        setStatus("disabled");
        return;
      }
      const existing = await reg.pushManager.getSubscription();
      setStatus(existing ? "enabled" : "disabled");
    } catch {
      setStatus("disabled");
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function enable() {
    setBusy(true);
    try {
      if (Notification.permission !== "granted") {
        const perm = await Notification.requestPermission();
        if (perm !== "granted") {
          flash("คุณยังไม่อนุญาตให้แจ้งเตือน");
          setStatus("denied");
          return;
        }
      }
      const reg =
        (await navigator.serviceWorker.getRegistration("/sw.js")) ??
        (await navigator.serviceWorker.register("/sw.js"));

      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });
      }
      const json = sub.toJSON() as {
        endpoint: string;
        keys: { p256dh: string; auth: string };
      };
      const result = await subscribeToPush(
        { endpoint: json.endpoint, keys: json.keys },
        navigator.userAgent,
      );
      if (result.error) {
        flash("เกิดข้อผิดพลาด: " + result.error);
      } else {
        flash("เปิดการแจ้งเตือนแล้ว ✓");
        setStatus("enabled");
      }
    } catch (e) {
      flash("ผิดพลาด: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.getRegistration("/sw.js");
      if (reg) {
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          await unsubscribeFromPush(sub.endpoint);
          await sub.unsubscribe();
        }
      }
      flash("ปิดการแจ้งเตือนแล้ว");
      setStatus("disabled");
    } catch (e) {
      flash("ผิดพลาด: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bg-[var(--color-bg)] rounded-xl p-4 border border-[var(--color-border)]">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="font-display font-bold text-sm text-[var(--color-ink)]">
            🔔 การแจ้งเตือนรายวัน
          </div>
          <div className="text-xs text-[var(--color-muted)] mt-0.5">
            ทุก 08:30 และ 17:30 — สรุปงานคุณ
          </div>
        </div>

        {status === "loading" && (
          <span className="text-xs text-[var(--color-muted)]">กำลังตรวจ...</span>
        )}
        {status === "unsupported" && (
          <span className="text-xs text-rose-600">
            เบราว์เซอร์นี้ไม่รองรับ
          </span>
        )}
        {status === "denied" && (
          <span className="text-xs text-rose-600">
            ถูกบล็อก — แก้ได้ในตั้งค่าเบราว์เซอร์
          </span>
        )}
        {status === "disabled" && (
          <button
            onClick={enable}
            disabled={busy}
            className="bg-[var(--color-primary)] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-[#C95E45] disabled:opacity-50"
          >
            {busy ? "กำลังเปิด..." : "เปิดการแจ้งเตือน"}
          </button>
        )}
        {status === "enabled" && (
          <div className="flex gap-2 items-center">
            <span className="text-xs text-[var(--color-success)] font-bold">
              ✓ เปิดอยู่
            </span>
            <button
              onClick={disable}
              disabled={busy}
              className="text-xs px-3 py-1.5 rounded-lg border border-[var(--color-border)] hover:bg-white disabled:opacity-50"
            >
              ปิด
            </button>
          </div>
        )}
      </div>
      {msg && (
        <div className="text-xs mt-2 text-[var(--color-ink-soft)]">{msg}</div>
      )}
    </div>
  );
}
