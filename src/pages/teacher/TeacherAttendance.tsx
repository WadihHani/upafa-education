import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import TeacherLayout from "./TeacherLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarCheck, Save, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTeacherCourses } from "@/hooks/use-teacher-courses";
import { toast } from "@/hooks/use-toast";

type AttendanceStatus = "present" | "absent" | "late" | "excused";

const STATUS_LABEL: Record<AttendanceStatus, string> = {
  present: "حاضر",
  absent: "غائب",
  late: "متأخر",
  excused: "بعذر",
};

const STATUS_VARIANT: Record<
  AttendanceStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  present: "secondary",
  absent: "destructive",
  late: "default",
  excused: "outline",
};

type EnrollmentRow = {
  id: string;
  course_id: string;
  student_user_id: string;
};
type ProfileRow = { user_id: string; full_name: string; email: string };
type AttendanceRow = {
  id: string;
  enrollment_id: string;
  course_id: string;
  student_user_id: string;
  session_date: string;
  status: AttendanceStatus;
  notes: string;
};

const todayISO = () => new Date().toISOString().slice(0, 10);

export default function TeacherAttendance() {
  const { user } = useAuth();
  const { courses, loading: coursesLoading } = useTeacherCourses();
  const [params, setParams] = useSearchParams();
  const courseFilter = params.get("course") ?? "";
  const [date, setDate] = useState(todayISO());
  const [enrollments, setEnrollments] = useState<EnrollmentRow[]>([]);
  const [profiles, setProfiles] = useState<Record<string, ProfileRow>>({});
  const [records, setRecords] = useState<AttendanceRow[]>([]);
  const [draft, setDraft] = useState<Record<string, AttendanceStatus>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Auto-pick first course if none selected
  useEffect(() => {
    if (!coursesLoading && !courseFilter && courses[0]) {
      const next = new URLSearchParams(params);
      next.set("course", courses[0].id);
      setParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coursesLoading, courses]);

  const load = async () => {
    if (!courseFilter) {
      setEnrollments([]);
      setRecords([]);
      return;
    }
    setLoading(true);
    const { data: enr } = await supabase
      .from("enrollments")
      .select("id, course_id, student_user_id")
      .eq("course_id", courseFilter)
      .eq("status", "approved");
    const list = enr ?? [];
    setEnrollments(list);

    const studentIds = Array.from(new Set(list.map((e) => e.student_user_id)));
    const [{ data: profs }, { data: recs }] = await Promise.all([
      studentIds.length
        ? supabase
            .from("profiles")
            .select("user_id, full_name, email")
            .in("user_id", studentIds)
        : Promise.resolve({ data: [] as ProfileRow[] }),
      supabase
        .from("attendance_records")
        .select("id, enrollment_id, course_id, student_user_id, session_date, status, notes")
        .eq("course_id", courseFilter)
        .order("session_date", { ascending: false })
        .limit(500),
    ]);
    const pmap: Record<string, ProfileRow> = {};
    (profs ?? []).forEach((p) => (pmap[p.user_id] = p));
    setProfiles(pmap);
    setRecords((recs ?? []) as AttendanceRow[]);

    // pre-fill draft from existing records for the selected date
    const todayRecs = (recs ?? []).filter((r) => r.session_date === date);
    const d: Record<string, AttendanceStatus> = {};
    list.forEach((e) => {
      const found = todayRecs.find((r) => r.enrollment_id === e.id);
      d[e.id] = (found?.status as AttendanceStatus) || "present";
    });
    setDraft(d);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseFilter, date]);

  const setStatus = (enrollmentId: string, s: AttendanceStatus) =>
    setDraft((p) => ({ ...p, [enrollmentId]: s }));

  const saveAll = async () => {
    if (!courseFilter || enrollments.length === 0 || !user) return;
    setSaving(true);
    const rows = enrollments.map((e) => ({
      course_id: courseFilter,
      enrollment_id: e.id,
      student_user_id: e.student_user_id,
      session_date: date,
      status: draft[e.id] ?? "present",
      marked_by: user.id,
      notes: "",
    }));
    const { error } = await supabase
      .from("attendance_records")
      .upsert(rows, { onConflict: "enrollment_id,session_date" });
    setSaving(false);
    if (error) {
      toast({ title: "تعذر الحفظ", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "✅ تم حفظ الحضور" });
    load();
  };

  const removeRecord = async (id: string) => {
    if (!confirm("حذف هذا السجل؟")) return;
    const { error } = await supabase.from("attendance_records").delete().eq("id", id);
    if (error) {
      toast({ title: "تعذر الحذف", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "تم الحذف" });
    load();
  };

  const studentName = (uid: string) => profiles[uid]?.full_name || "طالب";

  const groupedHistory = useMemo(() => {
    const map = new Map<string, AttendanceRow[]>();
    records
      .filter((r) => r.session_date !== date)
      .forEach((r) => {
        const k = r.session_date;
        if (!map.has(k)) map.set(k, []);
        map.get(k)!.push(r);
      });
    return Array.from(map.entries()).slice(0, 10);
  }, [records, date]);

  return (
    <TeacherLayout title="الحضور والغياب">
      <div className="flex items-end justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-primary mb-1">الحضور والغياب</h2>
          <p className="text-sm text-muted-foreground">
            سجّل حضور الطلاب لكل مقرر حسب التاريخ.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="w-56">
            <Select
              value={courseFilter}
              onValueChange={(v) => {
                const next = new URLSearchParams(params);
                next.set("course", v);
                setParams(next);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر المقرر" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-44"
            dir="ltr"
          />
          <Button
            onClick={saveAll}
            disabled={saving || enrollments.length === 0}
            className="gap-2"
          >
            <Save size={16} /> {saving ? "جارٍ الحفظ..." : "حفظ الحضور"}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : !courseFilter || enrollments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <CalendarCheck className="mx-auto mb-3 opacity-40" size={40} />
            {!courseFilter
              ? "اختر مقرراً للبدء."
              : "لا يوجد طلاب مقبولون في هذا المقرر بعد."}
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-8">
          <CardContent className="p-4">
            <div className="text-sm font-bold text-primary mb-3">
              قائمة الطلاب — {date}
            </div>
            <div className="grid gap-2">
              {enrollments.map((e) => {
                const current = draft[e.id] ?? "present";
                return (
                  <div
                    key={e.id}
                    className="flex items-center justify-between gap-3 border border-border rounded-md p-3 bg-background flex-wrap"
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-primary">
                        {studentName(e.student_user_id)}
                      </div>
                      <div className="text-[11px] text-muted-foreground" dir="ltr">
                        {profiles[e.student_user_id]?.email ?? ""}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-wrap">
                      {(Object.keys(STATUS_LABEL) as AttendanceStatus[]).map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setStatus(e.id, s)}
                          className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
                            current === s
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background border-border hover:border-primary/40"
                          }`}
                        >
                          {STATUS_LABEL[s]}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {groupedHistory.length > 0 && (
        <div>
          <h3 className="text-base font-bold text-primary mb-3">سجل الحضور السابق</h3>
          <div className="grid gap-3">
            {groupedHistory.map(([d, rows]) => (
              <Card key={d}>
                <CardContent className="p-4">
                  <div className="text-sm font-bold text-primary mb-2" dir="ltr">
                    {d}
                  </div>
                  <div className="grid gap-1.5">
                    {rows.map((r) => (
                      <div
                        key={r.id}
                        className="flex items-center justify-between text-xs border-b border-border last:border-0 py-1.5"
                      >
                        <span className="font-medium text-primary">
                          {studentName(r.student_user_id)}
                        </span>
                        <div className="flex items-center gap-2">
                          <Badge variant={STATUS_VARIANT[r.status]} className="text-[10px]">
                            {STATUS_LABEL[r.status]}
                          </Badge>
                          <button
                            type="button"
                            onClick={() => removeRecord(r.id)}
                            className="text-destructive hover:underline flex items-center gap-1"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </TeacherLayout>
  );
}
