import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, MessageSquare, Send, BookOpen, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Course = { id: string; title: string; code: string | null };
type Student = { user_id: string; full_name: string; email: string };
type Msg = {
  id: string;
  course_id: string;
  sender_user_id: string;
  recipient_user_id: string;
  body: string;
  is_read: boolean;
  created_at: string;
};

export default function TeacherMessages() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [activeStudentId, setActiveStudentId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [unreadByStudent, setUnreadByStudent] = useState<Record<string, number>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeCourse = useMemo(() => courses.find((c) => c.id === activeCourseId) ?? null, [courses, activeCourseId]);
  const activeStudent = useMemo(
    () => students.find((s) => s.user_id === activeStudentId) ?? null,
    [students, activeStudentId]
  );

  // Load courses taught by teacher
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: cs } = await supabase
        .from("courses")
        .select("id, title, code")
        .eq("teacher_user_id", user.id);
      setCourses((cs ?? []) as Course[]);
      if ((cs ?? []).length > 0 && !activeCourseId) setActiveCourseId(cs![0].id);
    })();
  }, [user]);

  // Load enrolled students for active course
  useEffect(() => {
    if (!activeCourseId || !user) return;
    (async () => {
      const { data: enr } = await supabase
        .from("enrollments")
        .select("student_user_id")
        .eq("course_id", activeCourseId)
        .eq("status", "approved");
      const ids = Array.from(new Set((enr ?? []).map((e) => e.student_user_id)));
      if (ids.length === 0) {
        setStudents([]);
        setActiveStudentId(null);
        return;
      }
      const { data: profs } = await supabase
        .from("profiles")
        .select("user_id, full_name, email")
        .in("user_id", ids);
      const list = (profs ?? []) as Student[];
      setStudents(list);

      // Unread counts per student
      const { data: msgs } = await supabase
        .from("course_messages")
        .select("sender_user_id, is_read, recipient_user_id")
        .eq("course_id", activeCourseId)
        .eq("recipient_user_id", user.id)
        .eq("is_read", false);
      const counts: Record<string, number> = {};
      (msgs ?? []).forEach((m: any) => {
        counts[m.sender_user_id] = (counts[m.sender_user_id] ?? 0) + 1;
      });
      setUnreadByStudent(counts);

      if (!activeStudentId && list.length > 0) setActiveStudentId(list[0].user_id);
    })();
  }, [activeCourseId, user]);

  const loadMessages = async (courseId: string, studentId: string) => {
    if (!user) return;
    const { data } = await supabase
      .from("course_messages")
      .select("*")
      .eq("course_id", courseId)
      .or(`and(sender_user_id.eq.${user.id},recipient_user_id.eq.${studentId}),and(sender_user_id.eq.${studentId},recipient_user_id.eq.${user.id})`)
      .order("created_at", { ascending: true });
    setMessages((data ?? []) as Msg[]);
  };

  useEffect(() => {
    if (!activeCourseId || !activeStudentId || !user) return;
    loadMessages(activeCourseId, activeStudentId);
    const ch = supabase
      .channel(`teacher-msgs-${activeCourseId}-${activeStudentId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "course_messages", filter: `course_id=eq.${activeCourseId}` },
        () => loadMessages(activeCourseId, activeStudentId)
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [activeCourseId, activeStudentId, user]);

  useEffect(() => {
    if (!user || !activeStudentId) return;
    const unread = messages.filter((m) => m.recipient_user_id === user.id && !m.is_read).map((m) => m.id);
    if (unread.length === 0) return;
    supabase.from("course_messages").update({ is_read: true }).in("id", unread).then(() => {
      setUnreadByStudent((prev) => ({ ...prev, [activeStudentId]: 0 }));
    });
  }, [messages, user, activeStudentId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!user || !activeCourse || !activeStudent) return;
    const body = text.trim();
    if (!body) return;
    setSending(true);
    const { error } = await supabase.from("course_messages").insert({
      course_id: activeCourse.id,
      sender_user_id: user.id,
      recipient_user_id: activeStudent.user_id,
      body,
    });
    setSending(false);
    if (error) {
      toast({ title: "تعذّر الإرسال", description: error.message, variant: "destructive" });
      return;
    }
    setText("");
    loadMessages(activeCourse.id, activeStudent.user_id);
  };

  return (
    <div dir="rtl" className="min-h-screen bg-muted/30">
      <header className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare size={20} className="text-accent" />
            <h1 className="text-base font-bold">محادثات الطلاب</h1>
          </div>
          <Button size="sm" variant="secondary" onClick={() => navigate("/portal/teacher")} className="gap-1.5">
            <ArrowRight size={14} /> العودة
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[220px_240px_1fr] gap-4">
          <aside className="bg-card border border-border rounded-md overflow-hidden h-fit shadow-sm">
            <div className="bg-muted/40 px-4 py-3 border-b border-border">
              <p className="text-xs font-bold text-primary">المقررات</p>
            </div>
            <div className="p-2">
              {courses.length === 0 && (
                <p className="text-xs text-muted-foreground p-3">لا توجد مقررات.</p>
              )}
              {courses.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setActiveCourseId(c.id);
                    setActiveStudentId(null);
                  }}
                  className={`w-full text-right px-3 py-2 rounded-md text-xs transition-colors flex items-center gap-2 ${
                    activeCourseId === c.id ? "bg-accent/15 text-primary border-r-2 border-accent" : "hover:bg-muted"
                  }`}
                >
                  <BookOpen size={13} />
                  <span className="font-bold truncate">{c.title}</span>
                </button>
              ))}
            </div>
          </aside>

          <aside className="bg-card border border-border rounded-md overflow-hidden h-fit shadow-sm">
            <div className="bg-muted/40 px-4 py-3 border-b border-border">
              <p className="text-xs font-bold text-primary">الطلاب</p>
            </div>
            <div className="p-2 max-h-[60vh] overflow-y-auto">
              {students.length === 0 && (
                <p className="text-xs text-muted-foreground p-3">لا يوجد طلاب مسجَّلون.</p>
              )}
              {students.map((s) => {
                const unread = unreadByStudent[s.user_id] ?? 0;
                return (
                  <button
                    key={s.user_id}
                    type="button"
                    onClick={() => setActiveStudentId(s.user_id)}
                    className={`w-full text-right px-3 py-2 rounded-md text-xs transition-colors ${
                      activeStudentId === s.user_id ? "bg-accent/15 text-primary border-r-2 border-accent" : "hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <User size={13} />
                      <span className="font-bold truncate flex-1">{s.full_name || "طالب"}</span>
                      {unread > 0 && (
                        <span className="bg-accent text-accent-foreground text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 inline-flex items-center justify-center">
                          {unread}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5 truncate" dir="ltr">
                      {s.email}
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          <main className="bg-card border border-border rounded-md shadow-sm flex flex-col h-[70vh]">
            {activeCourse && activeStudent ? (
              <>
                <div className="border-b border-border px-4 py-3">
                  <p className="text-sm font-bold text-primary">{activeStudent.full_name}</p>
                  <p className="text-[11px] text-muted-foreground">المقرر: {activeCourse.title}</p>
                </div>
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2">
                  {messages.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-10">
                      لا توجد رسائل بعد.
                    </p>
                  )}
                  {messages.map((m) => {
                    const mine = m.sender_user_id === user?.id;
                    return (
                      <div key={m.id} className={`flex ${mine ? "justify-start" : "justify-end"}`}>
                        <div
                          className={`max-w-[75%] rounded-md px-3 py-2 text-sm whitespace-pre-wrap break-words ${
                            mine ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                          }`}
                        >
                          <div>{m.body}</div>
                          <div className="text-[10px] mt-1 opacity-70" dir="ltr">
                            {new Date(m.created_at).toLocaleString("ar-SY")}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="border-t border-border p-3 flex gap-2 items-end">
                  <Textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={`اكتب ردك للطالب ${activeStudent.full_name}...`}
                    rows={2}
                    className="text-sm flex-1 min-h-[44px]"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        send();
                      }
                    }}
                  />
                  <Button onClick={send} disabled={sending || !text.trim()} className="gap-1.5">
                    <Send size={14} /> إرسال
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground p-6 text-center">
                {activeCourse ? "اختر طالباً لبدء المحادثة." : "اختر مقرراً أولاً."}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
