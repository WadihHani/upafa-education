import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, MessageSquare, Send, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Course = { id: string; title: string; code: string | null; teacher_user_id: string | null; teacher_name?: string };
type Msg = {
  id: string;
  course_id: string;
  sender_user_id: string;
  recipient_user_id: string;
  body: string;
  is_read: boolean;
  created_at: string;
};

export default function StudentMessages() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const active = useMemo(() => courses.find((c) => c.id === activeId) ?? null, [courses, activeId]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: enr } = await supabase
        .from("enrollments")
        .select("course_id")
        .eq("student_user_id", user.id)
        .eq("status", "approved");
      const ids = (enr ?? []).map((e) => e.course_id);
      if (ids.length === 0) {
        setCourses([]);
        return;
      }
      const { data: cs } = await supabase
        .from("courses")
        .select("id, title, code, teacher_user_id")
        .in("id", ids);
      const teacherIds = Array.from(new Set((cs ?? []).map((c) => c.teacher_user_id).filter(Boolean) as string[]));
      const nameMap: Record<string, string> = {};
      if (teacherIds.length > 0) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("user_id, full_name")
          .in("user_id", teacherIds);
        (profs ?? []).forEach((p) => (nameMap[p.user_id] = p.full_name || "أستاذ"));
      }
      const list: Course[] = (cs ?? []).map((c) => ({
        ...c,
        teacher_name: c.teacher_user_id ? nameMap[c.teacher_user_id] : "—",
      }));
      setCourses(list);
      if (!activeId && list.length > 0) setActiveId(list[0].id);
    })();
  }, [user]);

  const loadMessages = async (courseId: string) => {
    const { data } = await supabase
      .from("course_messages")
      .select("*")
      .eq("course_id", courseId)
      .order("created_at", { ascending: true });
    setMessages((data ?? []) as Msg[]);
  };

  useEffect(() => {
    if (!activeId || !user) return;
    loadMessages(activeId);
    const ch = supabase
      .channel(`student-msgs-${activeId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "course_messages", filter: `course_id=eq.${activeId}` },
        () => loadMessages(activeId)
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [activeId, user]);

  // mark incoming as read
  useEffect(() => {
    if (!user || !activeId) return;
    const unread = messages.filter((m) => m.recipient_user_id === user.id && !m.is_read).map((m) => m.id);
    if (unread.length === 0) return;
    supabase.from("course_messages").update({ is_read: true }).in("id", unread).then(() => {});
  }, [messages, user, activeId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!user || !active || !active.teacher_user_id) return;
    const body = text.trim();
    if (!body) return;
    setSending(true);
    const { error } = await supabase.from("course_messages").insert({
      course_id: active.id,
      sender_user_id: user.id,
      recipient_user_id: active.teacher_user_id,
      body,
    });
    setSending(false);
    if (error) {
      toast({ title: "تعذّر الإرسال", description: error.message, variant: "destructive" });
      return;
    }
    setText("");
    loadMessages(active.id);
  };

  return (
    <div dir="rtl" className="min-h-screen bg-muted/30">
      <header className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare size={20} className="text-accent" />
            <h1 className="text-base font-bold">محادثة الأستاذ</h1>
          </div>
          <Button size="sm" variant="secondary" onClick={() => navigate("/portal/student")} className="gap-1.5">
            <ArrowRight size={14} /> العودة
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
          <aside className="bg-card border border-border rounded-md overflow-hidden h-fit shadow-sm">
            <div className="bg-muted/40 px-4 py-3 border-b border-border">
              <p className="text-xs font-bold text-primary">مقرراتي</p>
            </div>
            <div className="p-2">
              {courses.length === 0 && (
                <p className="text-xs text-muted-foreground p-3">لا توجد مقررات مسجَّلة بعد.</p>
              )}
              {courses.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActiveId(c.id)}
                  className={`w-full text-right px-3 py-2 rounded-md text-xs transition-colors ${
                    activeId === c.id ? "bg-accent/15 text-primary border-r-2 border-accent" : "hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <BookOpen size={13} />
                    <span className="font-bold truncate">{c.title}</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 truncate">
                    الأستاذ: {c.teacher_name || "—"}
                  </div>
                </button>
              ))}
            </div>
          </aside>

          <main className="bg-card border border-border rounded-md shadow-sm flex flex-col h-[70vh]">
            {active ? (
              <>
                <div className="border-b border-border px-4 py-3">
                  <p className="text-sm font-bold text-primary">{active.title}</p>
                  <p className="text-[11px] text-muted-foreground">
                    محادثة مباشرة مع: {active.teacher_name || "أستاذ المقرر"}
                  </p>
                </div>
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2">
                  {messages.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-10">
                      ابدأ المحادثة بإرسال أول رسالة.
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
                          <div className={`text-[10px] mt-1 opacity-70`} dir="ltr">
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
                    placeholder="اكتب رسالتك للأستاذ..."
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
              <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground">
                اختر مقرراً لبدء المحادثة.
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
