import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CalendarDays, GraduationCap, FileText, Image, DoorOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [counts, setCounts] = useState({ users: 0, conferences: 0, programs: 0, content: 0, hero: 0, portal: 0 });

  useEffect(() => {
    const fetchCounts = async () => {
      const [t, c, p, s, h, po] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("conferences").select("id", { count: "exact", head: true }),
        supabase.from("programs").select("id", { count: "exact", head: true }),
        supabase.from("site_content").select("id", { count: "exact", head: true }),
        supabase.from("hero_slides").select("id", { count: "exact", head: true }),
        supabase.from("portal_items").select("id", { count: "exact", head: true }),
      ]);
      setCounts({
        users: t.count ?? 0,
        conferences: c.count ?? 0,
        programs: p.count ?? 0,
        content: s.count ?? 0,
        hero: h.count ?? 0,
        portal: po.count ?? 0,
      });
    };
    fetchCounts();
  }, []);

  const stats = [
    { label: "شرائح الهيرو", count: counts.hero, icon: Image, color: "bg-pink-500/10 text-pink-600", path: "/admin/hero" },
    { label: "المستخدمون", count: counts.users, icon: Users, color: "bg-blue-500/10 text-blue-600", path: "/admin/users" },
    { label: "المؤتمرات", count: counts.conferences, icon: CalendarDays, color: "bg-amber-500/10 text-amber-600", path: "/admin/conferences" },
    { label: "البرامج", count: counts.programs, icon: GraduationCap, color: "bg-green-500/10 text-green-600", path: "/admin/programs" },
    { label: "البوابات", count: counts.portal, icon: DoorOpen, color: "bg-indigo-500/10 text-indigo-600", path: "/admin/portal" },
    { label: "محتوى الموقع", count: counts.content, icon: FileText, color: "bg-purple-500/10 text-purple-600", path: "/admin/site-content" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">مرحباً بك في لوحة التحكم</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Link key={s.label} to={s.path}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
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
            </Link>
          );
        })}
      </div>
    </div>
  );
}
