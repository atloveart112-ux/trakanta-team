import { createClient } from "@/lib/supabase/server";
import { fetchWeekData } from "@/lib/data/week";
import { Header } from "@/components/Header";
import { ImportantPanel } from "@/components/ImportantPanel";
import { CrewScene } from "@/components/CrewScene";
import { TodayPanel } from "@/components/TodayPanel";
import { WeekPanel } from "@/components/WeekPanel";
import { SummaryPanel } from "@/components/SummaryPanel";
import { RealtimeRefresher } from "@/components/RealtimeRefresher";

export default async function HomePage() {
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
  const week = await fetchWeekData(today);

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-5 py-5">
      <RealtimeRefresher />
      <Header displayName={profile?.display_name ?? user.email ?? "เพื่อน"} />
      <ImportantPanel today={today} week={week} />
      <CrewScene today={today} week={week} />
      <TodayPanel today={today} week={week} />
      <WeekPanel today={today} week={week} />
      <SummaryPanel today={today} week={week} />
    </div>
  );
}
