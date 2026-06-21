import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  AudioLines,
  BookOpen,
  ExternalLink,
  GraduationCap,
  LogOut,
  Video,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

type Course = {
  id: string;
  title: string;
  code: string | null;
  level: string | null;
  description: string;
  teacher_user_id: string;
};

type Meeting = {
  id: string;
  course_id: string;
  title: string;
  meet_url: string;
  scheduled_at: string | null;
  status: string;
};

type Recording = {
  id: string;
  course_id: string;
  meeting_id: string | null;
  title: string;
  file_path: string;
  duration_seconds: number | null;
  size_bytes: number | null;
  created_at: string;
};

type Material = {
  id: string;
  course_id: string;
  title: string;
  description: string;
  external_url: string | null;
};

const formatDuration = (s: number | null) => {
  if (!s) return "—";
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

export default function StudentCourses() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollmentIds, setEnrollmentIds] = useState<Record<string, string>>({});
  const [teachers, setTeachers] = useState<Record<string, string>>({});
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data: enr } = await supabase
      .from("enrollments")
      .select("id, course_id")
      .eq("student_user_id", user.id)
      .eq("status", "approved");
    const ids = (enr ?? []).map((e) => e.course_id);
    const eidMap: Record<string, string> = {};
    (enr ?? []).forEach((e) => (eidMap[e.course_id] = e.id));
    setEnrollmentIds(eidMap);

    if (ids.length === 0) {
      setCourses([]);
      setMeetings([]);
      setRecordings([]);
      setMaterials([]);
      setLoading(false);
      return;
    }

    const [cRes, mRes, rRes, matRes] = await Promise.all([
      supabase
        .from("courses")
        .select("id, title, code, level, description, teacher_user_id")
        .in("id", ids),
      supabase
        .from("course_meetings")
        .select("id, course_id, title, meet_url, scheduled_at, status")
        .in("course_id", ids)
        .order("created_at", { ascending: false }),
      supabase
        .from("lecture_recordings")
        .select("id, course_id, meeting_id, title, file_path, duration_seconds, size_bytes, created_at")
        .in("course_id", ids)
        .order("created_at", { ascending: false }),
      supabase
        .from("lecture_materials")
        .select("id, course_id, title, description, external_url")
        .in("course_id", ids),
    ]);

    setCourses((cRes.data ?? []) as Course[]);
    setMeetings((mRes.data ?? []) as Meeting[]);
    setRecordings((rRes.data ?? []) as Recording[]);
    setMaterials((matRes.data ?? []) as Material[]);

    const teacherIds = Array.from(new Set((cRes.data ?? []).map((c: any) => c.teacher_user_id)));
    if (teacherIds.length > 0) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", teacherIds);
      const map: Record<string, string> = {};
      (profs ?? []).forEach((p) => (map[p.user_id] = p.full_name));
      setTeachers(map);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const leave = async (courseId: string) => {
    const eid = enrollmentIds[courseId];
    if (!eid || !confirm("مغادرة هذا المقرر؟")) return;
    const { error } = await supabase.from("enrollments").delete().eq("id", eid);
    if (error) {
      toast({ title: "تعذر", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "تمت المغادرة" });
    load();
  };

  const playRecording = async (rec: Recording) => {
    const { data, error } = await supabase.storage
      .from("lecture-recordings")
      .createSignedUrl(rec.file_path, 3600);
    if (error || !data) {
      toast({ title: "تعذر التشغيل", description: error?.message, variant: "destructive" });
      return;
    }
    window.open(data.signedUrl, "_blank");
  };

  const meetingsByCourse = useMemo(() => {
    const m: Record<string, Meeting[]> = {};
    meetings.forEach((x) => ((m[x.course_id] ||= []).push(x)));
    return m;
  }, [meetings]);
  const recsByCourse = useMemo(() => {
    const m: Record<string, Recording[]> = {};
    recordings.forEach((x) => ((m[x.course_id] ||= []).push(x)));
    return m;
  }, [recordings]);
  const matsByCourse = useMemo(() => {
    const m: Record<string, Material[]> = {};
    materials.forEach((x) => ((m[x.course_id] ||= []).push(x)));
    return m;
  }, [materials]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/portal");
  };

  return (
    <div dir="rtl" className="min-h-screen bg-muted/30">
      <header className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap size={20} className="text-accent" />
            <h1 className="text-base font-bold">
              <Link to="/portal/student" className="hover:underline">بوابة الطالب</Link>
              <span className="text-primary-foreground/70"> / مقرراتي</span>
            </h1>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md bg-primary-foreground/10 hover:bg-primary-foreground/20"
          >
            <LogOut size={14} /> خروج
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate("/portal/student")}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary mb-4"
        >
          <ArrowRight size={14} /> العودة إلى البوابة
        </button>

        <div className="mb-6 flex items-end justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-2xl font-bold text-primary mb-1">مقرراتي</h2>
            <p className="text-sm text-muted-foreground">
              المقررات التي انضممت إليها — المحاضرات المباشرة، المواد، والتسجيلات.
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/portal/student/catalog">تصفح المزيد من المقررات</Link>
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : courses.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <BookOpen className="mx-auto mb-3 opacity-40" size={40} />
              لم تنضم لأي مقرر بعد.
              <div className="mt-3">
                <Button asChild size="sm">
                  <Link to="/portal/student/catalog">تصفح المقررات</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-5">
            {courses.map((c) => {
              const ms = meetingsByCourse[c.id] ?? [];
              const rs = recsByCourse[c.id] ?? [];
              const mats = matsByCourse[c.id] ?? [];
              return (
                <Card key={c.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                      <div className="min-w-0">
                        <h3 className="font-bold text-primary text-base">{c.title}</h3>
                        <div className="text-[11px] text-muted-foreground mt-0.5 flex gap-2 flex-wrap">
                          {c.code && <span>{c.code}</span>}
                          {c.level && <span>• {c.level}</span>}
                          {teachers[c.teacher_user_id] && (
                            <span>• المُحاضر: {teachers[c.teacher_user_id]}</span>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => leave(c.id)}
                        className="text-destructive hover:text-destructive gap-1"
                      >
                        <X size={13} /> مغادرة
                      </Button>
                    </div>

                    {/* Live / scheduled meetings */}
                    <div className="grid md:grid-cols-3 gap-3">
                      <section>
                        <div className="text-[11px] font-bold text-muted-foreground mb-2 flex items-center gap-1">
                          <Video size={12} /> المحاضرات
                        </div>
                        {ms.length === 0 ? (
                          <p className="text-[11px] text-muted-foreground">لا توجد محاضرات.</p>
                        ) : (
                          <div className="space-y-1.5">
                            {ms.map((m) => (
                              <div
                                key={m.id}
                                className="bg-muted/40 rounded px-2 py-1.5 text-xs flex items-center justify-between gap-2"
                              >
                                <div className="min-w-0">
                                  <div className="truncate font-medium">{m.title}</div>
                                  <Badge
                                    variant={m.status === "live" ? "default" : "outline"}
                                    className="text-[9px] mt-0.5"
                                  >
                                    {m.status === "live"
                                      ? "🔴 مباشر الآن"
                                      : m.status === "ended"
                                      ? "منتهٍ"
                                      : "مجدول"}
                                  </Badge>
                                </div>
                                {m.status !== "ended" && (
                                  <a
                                    href={m.meet_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-accent hover:underline shrink-0 flex items-center gap-1"
                                  >
                                    انضمام <ExternalLink size={10} />
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </section>

                      <section>
                        <div className="text-[11px] font-bold text-muted-foreground mb-2 flex items-center gap-1">
                          <AudioLines size={12} /> التسجيلات
                        </div>
                        {rs.length === 0 ? (
                          <p className="text-[11px] text-muted-foreground">لا تسجيلات بعد.</p>
                        ) : (
                          <div className="space-y-1.5">
                            {rs.map((r) => (
                              <button
                                key={r.id}
                                type="button"
                                onClick={() => playRecording(r)}
                                className="w-full bg-muted/40 rounded px-2 py-1.5 text-xs flex items-center justify-between gap-2 hover:bg-muted/70 text-right"
                              >
                                <span className="truncate">{r.title}</span>
                                <span className="text-muted-foreground text-[10px] shrink-0">
                                  {formatDuration(r.duration_seconds)}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </section>

                      <section>
                        <div className="text-[11px] font-bold text-muted-foreground mb-2 flex items-center gap-1">
                          <BookOpen size={12} /> المواد
                        </div>
                        {mats.length === 0 ? (
                          <p className="text-[11px] text-muted-foreground">لا مواد بعد.</p>
                        ) : (
                          <div className="space-y-1.5">
                            {mats.map((mat) => (
                              <div
                                key={mat.id}
                                className="bg-muted/40 rounded px-2 py-1.5 text-xs flex items-center justify-between gap-2"
                              >
                                <span className="truncate">{mat.title}</span>
                                {mat.external_url && (
                                  <a
                                    href={mat.external_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-accent hover:underline shrink-0"
                                  >
                                    فتح
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </section>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
