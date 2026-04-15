import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CalendarDays, GraduationCap, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function Dashboard() {
  const [counts, setCounts] = useState({ team: 0, conferences: 0, programs: 0, content: 0 });

  useEffect(() => {
    const fetchCounts = async () => {
      const [t, c, p, s] = await Promise.all([
        supabase.from("team_members").select("id", { count: "exact", head: true }),
        supabase.from("conferences").select("id", { count: "exact", head: true }),
        supabase.from("programs").select("id", { count: "exact", head: true }),
        supabase.from("site_content").select("id", { count: "exact", head: true }),
      ]);
      setCounts({
        team: t.count ?? 0,
        conferences: c.count ?? 0,
        programs: p.count ?? 0,
        content: s.count ?? 0,
      });
    };
    fetchCounts();
  }, []);

  const stats = [
    { label: "أعضاء الفريق", count: counts.team, icon: Users, color: "bg-blue-500/10 text-blue-600" },
    { label: "المؤتمرات", count: counts.conferences, icon: CalendarDays, color: "bg-amber-500/10 text-amber-600" },
    { label: "البرامج", count: counts.programs, icon: GraduationCap, color: "bg-green-500/10 text-green-600" },
    { label: "المحتوى", count: counts.content, icon: FileText, color: "bg-purple-500/10 text-purple-600" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">مرحباً بك في لوحة التحكم</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}>
                  <Icon size={20} />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{s.count}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
