import Link from "next/link";
import { logout } from "@/app/auth/actions";
import { Greeting } from "./Greeting";

export function Header({ displayName }: { displayName: string }) {
  return (
    <header className="flex items-center justify-between gap-3 p-4 mb-5 bg-white rounded-2xl shadow-[var(--shadow-soft)] flex-wrap">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-rose)] grid place-items-center text-white font-bold text-xl font-display shadow-md shadow-[var(--color-primary)]/30">
          ต
        </div>
        <div>
          <div className="font-display font-bold text-[var(--color-ink)] text-base leading-tight">
            ตระการตาผ้าไทย
          </div>
          <div className="text-xs text-[var(--color-muted)]">
            ตารางคอนเทนต์ทีม
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <Greeting name={displayName} />
        <Link
          href="/activity"
          className="text-xs px-3 py-2 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-bg)] transition text-[var(--color-ink-soft)] hidden sm:inline-block"
        >
          ประวัติ
        </Link>
        <Link
          href="/settings"
          className="text-xs px-3 py-2 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-bg)] transition text-[var(--color-ink-soft)]"
        >
          ตั้งค่า
        </Link>
        <form action={logout}>
          <button
            type="submit"
            className="text-xs px-3 py-2 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-bg)] transition text-[var(--color-ink-soft)]"
          >
            ออก
          </button>
        </form>
      </div>
    </header>
  );
}
