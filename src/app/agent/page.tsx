import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AgentInterface } from "./AgentInterface";

export default async function AgentPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-5 py-5">
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
              🤖 PM Agent
            </h1>
            <p className="text-xs text-[var(--color-muted)]">
              วางสรุปประชุม → AI วางแผนงานให้
            </p>
          </div>
        </div>
      </header>

      <AgentInterface />
    </div>
  );
}
