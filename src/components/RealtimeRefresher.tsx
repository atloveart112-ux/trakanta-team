"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Subscribes to Postgres change events on collaborative tables and triggers
 * `router.refresh()` whenever anything changes. The Server Component on `/`
 * re-runs, fetching fresh week data, and React reconciles the UI.
 *
 * Multiple rapid changes are debounced into a single refresh.
 */
export function RealtimeRefresher() {
  const router = useRouter();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const supabase = createClient();

    function scheduleRefresh() {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        router.refresh();
      }, 300);
    }

    const channel = supabase
      .channel("trakanta-team-ops")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "task_progress" },
        scheduleRefresh,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "captions" },
        scheduleRefresh,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "images" },
        scheduleRefresh,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "important_flags" },
        scheduleRefresh,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "custom_tasks" },
        scheduleRefresh,
      )
      .subscribe();

    // Also refresh when the tab regains focus (catches missed events).
    function onFocus() {
      router.refresh();
    }
    window.addEventListener("focus", onFocus);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      supabase.removeChannel(channel);
      window.removeEventListener("focus", onFocus);
    };
  }, [router]);

  return null;
}
