import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import TeacherLayout from "./TeacherLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTeacherCourses } from "@/hooks/use-teacher-courses";
import { toast } from "@/hooks/use-toast";

type EnrollmentRow = {
  id: string;
  status: "pending" | "approved" | "rejected";
  requested_at: string;
  course_id: string;
  student_user_id: string;
};
type ProfileRow = {
  user_id: string;
  full_name: string;
  email: string;
};

export default function TeacherStudents() {
  const { courses, loading: coursesLoading } = useTeacherCourses();
  const [params, setParams] = useSearchParams();
  const courseFilter = params.get("course") ?? "all";
  const [enrollments, setEnrollments] = useState<EnrollmentRow[]>([]);
  const [profiles, setProfiles] = useState<Record<string, ProfileRow>>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  const courseIds = useMemo(() => courses.map((c) => c.id), [courses]);

  const load = async () => {
    if (courseIds.length === 0) {
      setEnrollments([]);
      setProfiles({});
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data: enr, error } = await supabase
      .from("enrollments")
      .select("id, status, requested_at, course_id, student_user_id")
      .in("course_id", courseIds)
      .order("requested_at", { ascending: false });
    if (error) {
      toast({ title: "خطأ في تحميل الطلاب", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }
    setEnrollments(enr ?? []);
    const ids = Array.from(new Set((enr ?? []).map((e) => e.student_user_id)));
    if (ids.length > 0) {
      const { data: prof } = await supabase
        .from("profiles")
        .select("user_id, full_name, email")
        .in("user_id", ids);
      const map: Record<string, ProfileRow> = {};
      (prof ?? []).forEach((p) => (map[p.user_id] = p));
      setProfiles(map);
    } else {
      setProfiles({});
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!coursesLoading) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coursesLoading, courseIds.join(",")]);

  const updateStatus = async (id: string, status: "approved" | "rejected") => {
    setSavingId(id);
    const { error } = await supabase
      .from("enrollments")
      .update({ status, decided_at: new Date().toISOString() })
      .eq("id", id);
    setSavingId(null);
    if (error) {
      toast({ title: "تعذر التحديث", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: status === "approved" ? "تم القبول" : "تم الرفض" });
    load();
  };

  const filtered = courseFilter === "all"
    ? enrollments
    : enrollments.filter((e) => e.course_id === courseFilter);

  const courseTitle = (id: string) => courses.find((c) => c.id === id)?.title ?? "—";

  return (
    <TeacherLayout title="الطلاب المسجلون">
      <div className="flex items-end justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-primary mb-1">الطلاب المسجلون</h2>
          <p className="text-sm text-muted-foreground">
            قائمة الطلاب في كل مقرر وإدارة طلبات التسجيل.
          </p>
        </div>
        <div className="w-56">
          <Select
            value={courseFilter}
            onValueChange={(v) => {
              const next = new URLSearchParams(params);
              if (v === "all") next.delete("course");
              else next.set("course", v);
              setParams(next);
            }}
          >
            <SelectTrigger><SelectValue placeholder="فلتر بالمقرر" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل المقررات</SelectItem>
              {courses.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Users className="mx-auto mb-3 opacity-40" size={40} />
            لا يوجد طلاب مسجلون حالياً.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map((e) => {
            const p = profiles[e.student_user_id];
            return (
              <Card key={e.id}>
                <CardContent className="p-4 flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <div className="font-bold text-sm text-primary">
                      {p?.full_name || "طالب"}
                    </div>
                    <div className="text-xs text-muted-foreground" dir="ltr">
                      {p?.email ?? ""}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-1">
                      المقرر: {courseTitle(e.course_id)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        e.status === "approved"
                          ? "secondary"
                          : e.status === "rejected"
                          ? "outline"
                          : "default"
                      }
                    >
                      {e.status === "approved"
                        ? "مقبول"
                        : e.status === "rejected"
                        ? "مرفوض"
                        : "قيد المراجعة"}
                    </Badge>
                    {e.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={savingId === e.id}
                          onClick={() => updateStatus(e.id, "approved")}
                          className="gap-1"
                        >
                          <Check size={14} /> قبول
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={savingId === e.id}
                          onClick={() => updateStatus(e.id, "rejected")}
                          className="gap-1 text-destructive hover:text-destructive"
                        >
                          <X size={14} /> رفض
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </TeacherLayout>
  );
}
