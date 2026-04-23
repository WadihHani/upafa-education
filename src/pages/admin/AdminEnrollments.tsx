import { useEffect, useState } from "react";
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
import { Check, X, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type EnrollmentRow = {
  id: string;
  status: "pending" | "approved" | "rejected";
  requested_at: string;
  course_id: string;
  student_user_id: string;
};

type CourseInfo = { id: string; title: string; teacher_user_id: string };
type ProfileInfo = { user_id: string; full_name: string; email: string };

export default function AdminEnrollments() {
  const [enrollments, setEnrollments] = useState<EnrollmentRow[]>([]);
  const [courses, setCourses] = useState<Record<string, CourseInfo>>({});
  const [profiles, setProfiles] = useState<Record<string, ProfileInfo>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data: enr, error } = await supabase
      .from("enrollments")
      .select("id, status, requested_at, course_id, student_user_id")
      .order("requested_at", { ascending: false });
    if (error) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }
    setEnrollments(enr ?? []);

    const courseIds = Array.from(new Set((enr ?? []).map((e) => e.course_id)));
    const studentIds = Array.from(new Set((enr ?? []).map((e) => e.student_user_id)));

    if (courseIds.length > 0) {
      const { data: cs } = await supabase
        .from("courses")
        .select("id, title, teacher_user_id")
        .in("id", courseIds);
      const map: Record<string, CourseInfo> = {};
      (cs ?? []).forEach((c) => (map[c.id] = c));
      setCourses(map);
    }
    if (studentIds.length > 0) {
      const { data: ps } = await supabase
        .from("profiles")
        .select("user_id, full_name, email")
        .in("user_id", studentIds);
      const map: Record<string, ProfileInfo> = {};
      (ps ?? []).forEach((p) => (map[p.user_id] = p));
      setProfiles(map);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel("admin-enrollments")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "enrollments" },
        () => load()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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

  const filtered = filter === "all" ? enrollments : enrollments.filter((e) => e.status === filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">طلبات الانضمام للمقررات</h1>
          <p className="text-sm text-muted-foreground mt-1">
            راجع طلبات الطلاب للانضمام إلى المقررات وقم بقبولها أو رفضها.
          </p>
        </div>
        <div className="w-48">
          <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">قيد المراجعة</SelectItem>
              <SelectItem value="approved">مقبول</SelectItem>
              <SelectItem value="rejected">مرفوض</SelectItem>
              <SelectItem value="all">الكل</SelectItem>
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
            لا توجد طلبات.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map((e) => {
            const course = courses[e.course_id];
            const student = profiles[e.student_user_id];
            return (
              <Card key={e.id}>
                <CardContent className="p-4 flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <div className="font-bold text-sm text-primary">
                      {student?.full_name || "طالب"}
                    </div>
                    <div className="text-xs text-muted-foreground" dir="ltr">
                      {student?.email ?? ""}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-1">
                      المقرر: {course?.title ?? "—"}
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
                    {e.status !== "approved" && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={savingId === e.id}
                        onClick={() => updateStatus(e.id, "approved")}
                        className="gap-1"
                      >
                        <Check size={14} /> قبول
                      </Button>
                    )}
                    {e.status !== "rejected" && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={savingId === e.id}
                        onClick={() => updateStatus(e.id, "rejected")}
                        className="gap-1 text-destructive hover:text-destructive"
                      >
                        <X size={14} /> رفض
                      </Button>
                    )}
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
