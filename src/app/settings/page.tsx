import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CrewSelector } from "@/components/CrewSelector";
import { PushToggle } from "@/components/PushToggle";
import type { CrewKey } from "@/lib/data/schedule";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, role, crew_key")
    .eq("id", user.id)
    .single();

  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-5 py-5">
      <header className="flex items-center justify-between gap-3 p-4 mb-5 bg-white rounded-2xl shadow-[var(--shadow-soft)]">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="w-10 h-10 rounded-full bg-[var(--color-bg)] grid place-items-center hover:bg-[var(--color-bg-2)] transition"
            aria-label="กลับหน้าหลัก"
          >
            ←
          </Link>
          <div>
            <h1 className="font-display font-bold text-lg text-[var(--color-ink)]">
              ตั้งค่า
            </h1>
            <p className="text-xs text-[var(--color-muted)]">
              {profile?.display_name ?? user.email} · {user.email}
            </p>
          </div>
        </div>
      </header>

      <section className="bg-white rounded-2xl p-5 mb-5 shadow-[var(--shadow-soft)]">
        <CrewSelector initial={(profile?.crew_key as CrewKey | null) ?? null} />
      </section>

      <section className="bg-white rounded-2xl p-5 mb-5 shadow-[var(--shadow-soft)]">
        {vapidPublicKey ? (
          <PushToggle vapidPublicKey={vapidPublicKey} />
        ) : (
          <div className="text-sm text-rose-700 bg-rose-50 rounded-xl p-4">
            ⚠️ ยังไม่ได้ตั้งค่า VAPID keys — admin ต้องเพิ่ม env vars บน Vercel
          </div>
        )}
      </section>

      <section className="bg-white rounded-2xl p-5 shadow-[var(--shadow-soft)] text-sm text-[var(--color-ink-soft)]">
        <h3 className="font-display font-bold text-base mb-2 text-[var(--color-ink)]">
          คำแนะนำสำหรับ iPhone
        </h3>
        <ol className="list-decimal pl-5 space-y-1 text-xs">
          <li>เปิดเว็บนี้ด้วย Safari</li>
          <li>กดปุ่ม Share (กล่องลูกศรขึ้น) ที่แถบล่าง</li>
          <li>เลือก &quot;Add to Home Screen&quot;</li>
          <li>เปิดแอปจากไอคอน &quot;ตระการตา&quot; บนหน้าจอ Home</li>
          <li>เข้าหน้านี้แล้วกด &quot;เปิดการแจ้งเตือน&quot;</li>
        </ol>
        <p className="text-xs mt-3 text-[var(--color-muted)]">
          (Apple บังคับให้ติดตั้ง PWA ก่อนถึงจะรับ notification ได้)
        </p>
      </section>
    </div>
  );
}
