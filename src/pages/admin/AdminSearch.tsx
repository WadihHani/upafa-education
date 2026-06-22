import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search, Loader2, User, FileCheck, UserPlus, ClipboardList, StickyNote } from "lucide-react";

type ResultGroup = {
  key: string;
  label: string;
  icon: any;
  items: { id: string; title: string; subtitle: string; to: string }[];
};

export default function AdminSearch() {
  const [params, setParams] = useSearchParams();
  const initial = params.get("q") ?? "";
  const [q, setQ] = useState(initial);
  const [term, setTerm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<ResultGroup[]>([]);

  useEffect(() => {
    const t = setTimeout(() => setTerm(q.trim()), 300);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    if (!term || term.length < 2) {
      setGroups([]);
      setParams(term ? { q: term } : {});
      return;
    }
    setParams({ q: term });
    runSearch(term);
  }, [term]);

  async function runSearch(t: string) {
    setLoading(true);
    const like = `%${t}%`;
    const [profilesR, registrationsR, applicationsR, notesR] = await Promise.all([
      supabase
        .from("profiles")
        .select("user_id, full_name, email, phone")
        .or(`full_name.ilike.${like},email.ilike.${like},phone.ilike.${like}`)
        .limit(25),
      supabase
        .from("mofadla_quick_registrations")
        .select("id, full_name, national_id, phone, email, status, created_at")
        .or(
          `full_name.ilike.${like},national_id.ilike.${like},phone.ilike.${like},email.ilike.${like},father_name.ilike.${like},mother_name.ilike.${like}`
        )
        .limit(25),
      supabase
        .from("mofadla_applications")
        .select("id, full_name, national_id, phone, email, status, created_at")
        .or(
          `full_name.ilike.${like},national_id.ilike.${like},phone.ilike.${like},email.ilike.${like},exam_number.ilike.${like}`
        )
        .limit(25),
      supabase
        .from("student_notes")
        .select("id, note, student_user_id, created_at")
        .ilike("note", like)
        .limit(25),
    ]);

    // Enrollments by student name/email — join through profiles
    let enrollmentItems: ResultGroup["items"] = [];
    const matchedProfileIds = (profilesR.data ?? []).map((p: any) => p.user_id);
    if (matchedProfileIds.length) {
      const { data: enrs } = await supabase
        .from("enrollments")
        .select("id, status, student_user_id, course_id, courses(title, code)")
        .in("student_user_id", matchedProfileIds)
        .limit(50);
      const profileMap = new Map((profilesR.data ?? []).map((p: any) => [p.user_id, p]));
      enrollmentItems = (enrs ?? []).map((e: any) => {
        const p: any = profileMap.get(e.student_user_id);
        return {
          id: e.id,
          title: `${p?.full_name || "طالب"} — ${e.courses?.title || ""}`,
          subtitle: `الحالة: ${e.status}${e.courses?.code ? ` • ${e.courses.code}` : ""}`,
          to: "/admin/enrollments",
        };
      });
    }

    const next: ResultGroup[] = [
      {
        key: "users",
        label: "المستخدمون",
        icon: User,
        items: (profilesR.data ?? []).map((p: any) => ({
          id: p.user_id,
          title: p.full_name || "(بدون اسم)",
          subtitle: [p.email, p.phone].filter(Boolean).join(" • "),
          to: "/admin/users",
        })),
      },
      {
        key: "registrations",
        label: "تثبيت التسجيل (المفاضلة)",
        icon: UserPlus,
        items: (registrationsR.data ?? []).map((r: any) => ({
          id: r.id,
          title: r.full_name,
          subtitle: [r.national_id, r.phone, r.email, `الحالة: ${r.status}`]
            .filter(Boolean)
            .join(" • "),
          to: "/admin/mofadla/registrations",
        })),
      },
      {
        key: "applications",
        label: "طلبات المفاضلة",
        icon: FileCheck,
        items: (applicationsR.data ?? []).map((r: any) => ({
          id: r.id,
          title: r.full_name,
          subtitle: [r.national_id, r.phone, r.email, `الحالة: ${r.status}`]
            .filter(Boolean)
            .join(" • "),
          to: "/admin/mofadla/applications",
        })),
      },
      {
        key: "enrollments",
        label: "طلبات الانضمام للمقررات",
        icon: ClipboardList,
        items: enrollmentItems,
      },
      {
        key: "notes",
        label: "ملاحظات الطلاب",
        icon: StickyNote,
        items: (notesR.data ?? []).map((n: any) => ({
          id: n.id,
          title: n.note.slice(0, 80),
          subtitle: new Date(n.created_at).toLocaleString("ar"),
          to: "/admin/student-notes",
        })),
      },
    ];

    setGroups(next);
    setLoading(false);
  }

  const totalCount = useMemo(
    () => groups.reduce((s, g) => s + g.items.length, 0),
    [groups]
  );

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold">البحث الشامل</h1>
        <p className="text-sm text-muted-foreground mt-1">
          ابحث عن الطلاب والأساتذة والتسجيلات والطلبات بالاسم أو الهاتف أو البريد أو الرقم الوطني
        </p>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            autoFocus
            placeholder="اكتب اسماً، بريداً، هاتفاً، رقماً وطنياً..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pr-10 h-12 text-base"
          />
        </div>
        <Button onClick={() => setTerm(q.trim())} className="h-12">بحث</Button>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="animate-spin" size={16} /> جاري البحث...
        </div>
      )}

      {!loading && term && term.length >= 2 && (
        <p className="text-sm text-muted-foreground">
          النتائج لـ "<span className="font-medium text-foreground">{term}</span>": {totalCount}
        </p>
      )}

      {!loading && term.length > 0 && term.length < 2 && (
        <p className="text-sm text-muted-foreground">أدخل حرفين على الأقل</p>
      )}

      <div className="grid gap-4">
        {groups.map((g) => (
          g.items.length > 0 && (
            <Card key={g.key} className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <g.icon size={18} className="text-primary" />
                <h2 className="font-semibold">{g.label}</h2>
                <span className="text-xs text-muted-foreground">({g.items.length})</span>
              </div>
              <div className="divide-y">
                {g.items.map((it) => (
                  <Link
                    key={it.id}
                    to={it.to}
                    className="block py-2.5 hover:bg-muted/50 -mx-2 px-2 rounded"
                  >
                    <div className="font-medium text-sm">{it.title}</div>
                    {it.subtitle && (
                      <div className="text-xs text-muted-foreground mt-0.5">{it.subtitle}</div>
                    )}
                  </Link>
                ))}
              </div>
            </Card>
          )
        ))}
      </div>
    </div>
  );
}
