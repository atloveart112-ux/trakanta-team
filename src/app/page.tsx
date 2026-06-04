import { createClient } from "@/lib/supabase/server";
import { fetchDateRangeData, fetchWeekData } from "@/lib/data/week";
import { Header } from "@/components/Header";
import { ImportantPanel } from "@/components/ImportantPanel";
import { CrewScene } from "@/components/CrewScene";
import { TodayPanel } from "@/components/TodayPanel";
import { WeekPanel } from "@/components/WeekPanel";
import { MonthPanel } from "@/components/MonthPanel";
import { SummaryPanel } from "@/components/SummaryPanel";
import { RealtimeRefresher } from "@/components/RealtimeRefresher";
import { ViewToggle } from "@/components/ViewToggle";

type SearchParams = Promise<{ view?: string; m?: string }>;

function parseMonth(s: string | undefined, today: Date): Date {
  if (s) {
    const match = /^(\d{4})-(\d{2})$/.exec(s);
    if (match) {
      const y = parseInt(match[1]);
      const m = parseInt(match[2]) - 1;
      if (y >= 2000 && y <= 2100 && m >= 0 && m <= 11) {
        return new Date(y, m, 1);
      }
    }
  }
  return new Date(today.getFullYear(), today.getMonth(), 1);
}

export default async function HomePage(props: {
  searchParams: SearchParams;
}) {
  const { view, m } = await props.searchParams;
  const isMonth = view === "month";

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

  const today = new Date();

  // Week data is always needed (CrewScene + TodayPanel + SummaryPanel use it)
  const week = await fetchWeekData(today);

  // Month data only when viewing month
  let monthData = week;
  let viewedMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  if (isMonth) {
    viewedMonth = parseMonth(m, today);
    const monthStart = new Date(viewedMonth);
    monthStart.setDate(monthStart.getDate() - 7); // padding for grid edges
    const monthEnd = new Date(viewedMonth);
    monthEnd.setMonth(monthEnd.getMonth() + 1);
    monthEnd.setDate(monthEnd.getDate() + 7);
    monthData = await fetchDateRangeData(monthStart, monthEnd);
  }

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-5 py-5">
      <RealtimeRefresher />
      <Header displayName={profile?.display_name ?? user.email ?? "เพื่อน"} />
      <ImportantPanel today={today} week={week} />
      <CrewScene today={today} week={week} />
      <TodayPanel today={today} week={week} />

      <div className="flex justify-center mb-4">
        <ViewToggle current={isMonth ? "month" : "week"} />
      </div>

      {isMonth ? (
        <MonthPanel month={viewedMonth} today={today} data={monthData} />
      ) : (
        <WeekPanel today={today} week={week} />
      )}

      <SummaryPanel today={today} week={week} />
    </div>
  );
}
