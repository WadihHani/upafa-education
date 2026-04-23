import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Search, Trash2, Users, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type Course = {
  id: string;
  title: string;
  code: string | null;
  level: string | null;
  description: string;
  is_open_for_enrollment: boolean;
  teacher_user_id: string;
  created_at: string;
};

type TeacherProfile = { user_id: string; full_name: string; email: string };

type EnrollmentCounts = {
  approved: number;
  pending: number;
  rejected: number;
};

export default function AdminCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Record<string, TeacherProfile>>({});
  const [counts, setCounts] = useState<Record<string, EnrollmentCounts>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [removingId, setRemovingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data: cs, error } = await supabase
      .from("courses")
      .select(
        "id, title, code, level, description, is_open_for_enrollment, teacher_user_id, created_at"
      )
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }
    const list = cs ?? [];
    setCourses(list);

    const teacherIds = Array.from(new Set(list.map((c) => c.teacher_user_id)));
    if (teacherIds.length > 0) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("user_id, full_name, email")
        .in("user_id", teacherIds);
      const tmap: Record<string, TeacherProfile> = {};
      (profs ?? []).forEach((p) => (tmap[p.user_id] = p));
      setTeachers(tmap);
    }

    // Enrollment counts per course
    if (list.length > 0) {
      const { data: enr } = await supabase
        .from("enrollments")
        .select("course_id, status")
        .in(
          "course_id",
          list.map((c) => c.id)
        );
      const cmap: Record<string, EnrollmentCounts> = {};
      list.forEach((c) => (cmap[c.id] = { approved: 0, pending: 0, rejected: 0 }));
      (enr ?? []).forEach((e) => {
        const bucket = cmap[e.course_id];
        if (!bucket) return;
        if (e.status === "approved") bucket.approved += 1;
        else if (e.status === "pending") bucket.pending += 1;
        else if (e.status === "rejected") bucket.rejected += 1;
      });
      setCounts(cmap);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id: string) => {
    if (!confirm("حذف هذا المقرر؟ سيتم حذف الطلبات والمواد والدرجات المرتبطة به.")) return;
    setRemovingId(id);
    const { error } = await supabase.from("courses").delete().eq("id", id);
    setRemovingId(null);
    if (error) {
      toast({ title: "تعذر الحذف", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "تم الحذف" });
    load();
  };

  const filtered = courses.filter((c) => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    const t = teachers[c.teacher_user_id];
    return (
      c.title.toLowerCase().includes(q) ||
      (c.code ?? "").toLowerCase().includes(q) ||
      (t?.full_name ?? "").toLowerCase().includes(q) ||
      (t?.email ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">المقررات الدراسية</h1>
          <p className="text-sm text-muted-foreground mt-1">
            جميع المقررات التي أنشأها أعضاء هيئة التدريس مع عدد الطلاب وحالة طلبات الانضمام.
          </p>
        </div>
        <div className="relative w-72 max-w-full">
          <Search
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بعنوان المقرر أو اسم المدرّس..."
            className="pr-9"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <BookOpen className="mx-auto mb-3 opacity-40" size={40} />
            لا توجد مقررات بعد.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map((c) => {
            const t = teachers[c.teacher_user_id];
            const k = counts[c.id] ?? { approved: 0, pending: 0, rejected: 0 };
            return (
              <Card key={c.id}>
                <CardContent className="p-4 flex items-start justify-between gap-4 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-bold text-primary text-sm">{c.title}</h3>
                      {c.code && (
                        <span className="text-[11px] text-muted-foreground">
                          ({c.code})
                        </span>
                      )}
                      {c.level && (
                        <Badge variant="outline" className="text-[10px]">
                          {c.level}
                        </Badge>
                      )}
                      {c.is_open_for_enrollment ? (
                        <Badge variant="secondary" className="text-[10px]">
                          مفتوح للتسجيل
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px]">
                          مغلق
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mb-2">
                      <span className="font-medium text-foreground">المدرّس: </span>
                      {t?.full_name || "غير معروف"}
                      {t?.email && (
                        <span className="ms-2 opacity-70" dir="ltr">
                          {t.email}
                        </span>
                      )}
                    </div>
                    {c.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {c.description}
                      </p>
                    )}
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-[11px] gap-1">
                        <Users size={11} /> مقبول: {k.approved}
                      </Badge>
                      {k.pending > 0 && (
                        <Badge className="text-[11px] bg-accent text-accent-foreground hover:bg-accent/90">
                          قيد المراجعة: {k.pending}
                        </Badge>
                      )}
                      {k.rejected > 0 && (
                        <Badge variant="outline" className="text-[11px]">
                          مرفوض: {k.rejected}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link to="/admin/enrollments">
                      <Button size="sm" variant="outline" className="gap-1">
                        <ExternalLink size={13} /> الطلبات
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={removingId === c.id}
                      onClick={() => remove(c.id)}
                      className="text-destructive hover:text-destructive gap-1"
                    >
                      <Trash2 size={13} /> حذف
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
