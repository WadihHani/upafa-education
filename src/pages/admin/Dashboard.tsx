import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CalendarDays, GraduationCap, FileText, Image, DoorOpen, BookOpen, ClipboardList } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [counts, setCounts] = useState({
    users: 0,
    conferences: 0,
    programs: 0,
    content: 0,
    hero: 0,
    portal: 0,
    courses: 0,
    pendingEnrollments: 0,
  });

  const fetchCounts = async () => {
    const [t, c, p, s, h, po, co, en] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("conferences").select("id", { count: "exact", head: true }),
      supabase.from("programs").select("id", { count: "exact", head: true }),
      supabase.from("site_content").select("id", { count: "exact", head: true }),
      supabase.from("hero_slides").select("id", { count: "exact", head: true }),
      supabase.from("portal_items").select("id", { count: "exact", head: true }),
      supabase.from("courses").select("id", { count: "exact", head: true }),
      supabase
        .from("enrollments")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
    ]);
    setCounts({
      users: t.count ?? 0,
      conferences: c.count ?? 0,
      programs: p.count ?? 0,
      content: s.count ?? 0,
      hero: h.count ?? 0,
      portal: po.count ?? 0,
      courses: co.count ?? 0,
      pendingEnrollments: en.count ?? 0,
    });
  };

  useEffect(() => {
    fetchCounts();
    const channel = supabase
      .channel("admin-dashboard-enrollments")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "enrollments" },
        () => fetchCounts()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const stats = [
    { label: "طلبات قيد المراجعة", count: counts.pendingEnrollments, icon: ClipboardList, color: "bg-accent/15 text-accent", path: "/admin/enrollments", highlight: true },
    { label: "المقررات", count: counts.courses, icon: BookOpen, color: "bg-primary/10 text-primary", path: "/admin/courses" },
    { label: "المستخدمون", count: counts.users, icon: Users, color: "bg-primary/10 text-primary", path: "/admin/users" },
    { label: "شرائح الهيرو", count: counts.hero, icon: Image, color: "bg-primary/10 text-primary", path: "/admin/hero" },
    { label: "المؤتمرات", count: counts.conferences, icon: CalendarDays, color: "bg-primary/10 text-primary", path: "/admin/conferences" },
    { label: "الأقسام", count: counts.programs, icon: GraduationCap, color: "bg-primary/10 text-primary", path: "/admin/programs" },
    { label: "البوابات", count: counts.portal, icon: DoorOpen, color: "bg-primary/10 text-primary", path: "/admin/portal" },
    { label: "محتوى الموقع", count: counts.content, icon: FileText, color: "bg-primary/10 text-primary", path: "/admin/site-content" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-2">مرحباً بك في لوحة التحكم</h1>
      <p className="text-sm text-muted-foreground mb-6">
        نظرة سريعة على نشاط الموقع. اضغط على أي بطاقة للانتقال إلى القسم المختص.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Link key={s.label} to={s.path}>
              <Card
                className={`hover:shadow-md transition-shadow cursor-pointer h-full ${
                  s.highlight && s.count > 0 ? "border-accent ring-1 ring-accent/30" : ""
                }`}
              >
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
