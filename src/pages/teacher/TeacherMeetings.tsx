import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import TeacherLayout from "./TeacherLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Video,
  Plus,
  ExternalLink,
  Trash2,
  Mic,
  Square,
  Circle,
  Loader2,
  AudioLines,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTeacherCourses } from "@/hooks/use-teacher-courses";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

type Meeting = {
  id: string;
  course_id: string;
  title: string;
  description: string;
  meet_url: string;
  scheduled_at: string | null;
  status: string;
  started_at: string | null;
  ended_at: string | null;
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

const formatBytes = (b: number | null) => {
  if (!b) return "—";
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
};

const formatDuration = (s: number | null) => {
  if (!s) return "—";
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

export default function TeacherMeetings() {
  const { user } = useAuth();
  const { courses, loading: coursesLoading } = useTeacherCourses();
  const [params, setParams] = useSearchParams();
  const courseFilter = params.get("course") ?? "all";

  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    course_id: "",
    title: "",
    description: "",
    meet_url: "",
    scheduled_at: "",
  });

  // Recording state
  const [recState, setRecState] = useState<"idle" | "recording" | "uploading">("idle");
  const [recMeetingId, setRecMeetingId] = useState<string | null>(null);
  const [recElapsed, setRecElapsed] = useState(0);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamsRef = useRef<MediaStream[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const elapsedTimerRef = useRef<number | null>(null);
  const startedAtRef = useRef<number>(0);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const courseIds = courses.map((c) => c.id);
    if (courseIds.length === 0) {
      setMeetings([]);
      setRecordings([]);
      setLoading(false);
      return;
    }
    const [mRes, rRes] = await Promise.all([
      supabase
        .from("course_meetings")
        .select("*")
        .in("course_id", courseIds)
        .order("created_at", { ascending: false }),
      supabase
        .from("lecture_recordings")
        .select("*")
        .in("course_id", courseIds)
        .order("created_at", { ascending: false }),
    ]);
    if (mRes.error) toast({ title: "خطأ", description: mRes.error.message, variant: "destructive" });
    else setMeetings((mRes.data ?? []) as Meeting[]);
    if (!rRes.error) setRecordings((rRes.data ?? []) as Recording[]);
    setLoading(false);
  };

  useEffect(() => {
    if (!coursesLoading) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coursesLoading, courses.map((c) => c.id).join(",")]);

  const openAdd = () => {
    setForm({
      course_id: courseFilter !== "all" ? courseFilter : courses[0]?.id ?? "",
      title: "",
      description: "",
      meet_url: "",
      scheduled_at: "",
    });
    setOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.course_id || !form.title || !form.meet_url) return;
    setSubmitting(true);
    const { error } = await supabase.from("course_meetings").insert({
      course_id: form.course_id,
      title: form.title,
      description: form.description,
      meet_url: form.meet_url,
      scheduled_at: form.scheduled_at || null,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "تعذرت الإضافة", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "تمت إضافة المحاضرة" });
    setOpen(false);
    load();
  };

  const removeMeeting = async (id: string) => {
    if (!confirm("حذف هذه المحاضرة؟")) return;
    const { error } = await supabase.from("course_meetings").delete().eq("id", id);
    if (error) {
      toast({ title: "تعذر الحذف", description: error.message, variant: "destructive" });
      return;
    }
    load();
  };

  const removeRecording = async (rec: Recording) => {
    if (!confirm("حذف هذا التسجيل نهائياً؟")) return;
    await supabase.storage.from("lecture-recordings").remove([rec.file_path]);
    const { error } = await supabase.from("lecture_recordings").delete().eq("id", rec.id);
    if (error) {
      toast({ title: "تعذر الحذف", description: error.message, variant: "destructive" });
      return;
    }
    load();
  };

  // ---------- Recording ----------
  const cleanupStreams = () => {
    streamsRef.current.forEach((s) => s.getTracks().forEach((t) => t.stop()));
    streamsRef.current = [];
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    if (elapsedTimerRef.current) {
      window.clearInterval(elapsedTimerRef.current);
      elapsedTimerRef.current = null;
    }
  };

  const startRecording = async (meeting: Meeting) => {
    if (recState !== "idle") {
      toast({ title: "هناك تسجيل قيد التشغيل بالفعل", variant: "destructive" });
      return;
    }
    try {
      // 1) Microphone
      const micStream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      streamsRef.current.push(micStream);

      // 2) Tab audio (Meet)
      let tabStream: MediaStream | null = null;
      try {
        tabStream = await (navigator.mediaDevices as any).getDisplayMedia({
          video: true, // required by API
          audio: true,
        });
        // Stop the video track immediately, keep audio only
        tabStream!.getVideoTracks().forEach((t) => t.stop());
        if (tabStream!.getAudioTracks().length === 0) {
          toast({
            title: "لم يتم مشاركة صوت التبويب",
            description: "فعّل \"مشاركة صوت التبويب\" عند اختيار تبويب Meet.",
            variant: "destructive",
          });
        }
        streamsRef.current.push(tabStream!);
      } catch (e) {
        toast({
          title: "تم التسجيل بدون صوت الطلاب",
          description: "لم يتم مشاركة تبويب Meet — سيُسجَّل صوت الميكروفون فقط.",
        });
      }

      // 3) Mix
      const AudioContextCtor =
        (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext;
      const ctx = new AudioContextCtor();
      audioCtxRef.current = ctx;
      const dest = ctx.createMediaStreamDestination();

      const micSrc = ctx.createMediaStreamSource(micStream);
      micSrc.connect(dest);
      if (tabStream && tabStream.getAudioTracks().length > 0) {
        const tabSrc = ctx.createMediaStreamSource(
          new MediaStream(tabStream.getAudioTracks())
        );
        tabSrc.connect(dest);
      }

      // 4) Recorder
      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";
      const recorder = new MediaRecorder(dest.stream, {
        mimeType: mime,
        audioBitsPerSecond: 32000,
      });
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: mime });
        const durationSec = Math.round((Date.now() - startedAtRef.current) / 1000);
        cleanupStreams();
        await uploadRecording(meeting, blob, durationSec);
      };
      recorder.start(5000); // chunk every 5s for safety
      recorderRef.current = recorder;
      startedAtRef.current = Date.now();
      setRecMeetingId(meeting.id);
      setRecState("recording");
      setRecElapsed(0);
      elapsedTimerRef.current = window.setInterval(() => {
        setRecElapsed(Math.round((Date.now() - startedAtRef.current) / 1000));
      }, 1000);

      // Update meeting status to live
      await supabase
        .from("course_meetings")
        .update({ status: "live", started_at: new Date().toISOString() })
        .eq("id", meeting.id);
      load();
    } catch (e: any) {
      cleanupStreams();
      setRecState("idle");
      setRecMeetingId(null);
      toast({
        title: "تعذر بدء التسجيل",
        description: e?.message || "تأكد من منح إذن الميكروفون.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      setRecState("uploading");
      recorderRef.current.stop();
    }
  };

  const uploadRecording = async (
    meeting: Meeting,
    blob: Blob,
    durationSec: number
  ) => {
    if (!user) return;
    try {
      const filename = `meet-${Date.now()}.webm`;
      const path = `${meeting.course_id}/${filename}`;
      const { error: upErr } = await supabase.storage
        .from("lecture-recordings")
        .upload(path, blob, {
          contentType: blob.type || "audio/webm",
          upsert: false,
        });
      if (upErr) throw upErr;

      const { error: insErr } = await supabase.from("lecture_recordings").insert({
        course_id: meeting.course_id,
        meeting_id: meeting.id,
        title: `تسجيل: ${meeting.title}`,
        file_path: path,
        duration_seconds: durationSec,
        size_bytes: blob.size,
        mime_type: blob.type || "audio/webm",
        recorded_by: user.id,
      });
      if (insErr) throw insErr;

      await supabase
        .from("course_meetings")
        .update({ status: "ended", ended_at: new Date().toISOString() })
        .eq("id", meeting.id);

      toast({
        title: "✅ تم رفع التسجيل",
        description: `${formatDuration(durationSec)} — ${formatBytes(blob.size)}`,
      });
    } catch (e: any) {
      toast({
        title: "فشل رفع التسجيل",
        description: e?.message || "حاول مجدداً",
        variant: "destructive",
      });
    } finally {
      setRecState("idle");
      setRecMeetingId(null);
      setRecElapsed(0);
      load();
    }
  };

  useEffect(() => {
    return () => {
      cleanupStreams();
    };
  }, []);

  const filteredMeetings =
    courseFilter === "all" ? meetings : meetings.filter((m) => m.course_id === courseFilter);

  const courseTitle = (id: string) => courses.find((c) => c.id === id)?.title ?? "—";

  const recordingsByMeeting = (mid: string) =>
    recordings.filter((r) => r.meeting_id === mid);

  const playRecording = async (rec: Recording) => {
    const { data, error } = await supabase.storage
      .from("lecture-recordings")
      .createSignedUrl(rec.file_path, 3600);
    if (error || !data) {
      toast({ title: "تعذر فتح التسجيل", description: error?.message, variant: "destructive" });
      return;
    }
    window.open(data.signedUrl, "_blank");
  };

  return (
    <TeacherLayout title="المحاضرات المباشرة">
      <div className="flex items-end justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-primary mb-1">المحاضرات المباشرة</h2>
          <p className="text-sm text-muted-foreground">
            أنشئ اجتماع Google Meet للمقرر، وابدأ المحاضرة من هنا. عند الضغط على "ابدأ + سجّل"
            سنطلب الميكروفون ومشاركة تبويب Meet (مع تفعيل صوت التبويب) لتسجيل المحاضرة كاملة
            ورفعها تلقائياً للطلاب.
          </p>
        </div>
        <div className="flex items-center gap-2">
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
          <Button onClick={openAdd} disabled={courses.length === 0} className="gap-2">
            <Plus size={16} /> إضافة محاضرة
          </Button>
        </div>
      </div>

      {recState !== "idle" && (
        <Card className="mb-4 border-red-500/50 bg-red-500/5">
          <CardContent className="p-3 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-sm">
              {recState === "recording" ? (
                <Circle size={14} className="fill-red-500 text-red-500 animate-pulse" />
              ) : (
                <Loader2 size={14} className="animate-spin" />
              )}
              <span className="font-bold">
                {recState === "recording" ? "جارٍ التسجيل" : "جارٍ رفع التسجيل..."}
              </span>
              {recState === "recording" && (
                <span className="text-muted-foreground" dir="ltr">
                  {formatDuration(recElapsed)}
                </span>
              )}
            </div>
            {recState === "recording" && (
              <Button size="sm" variant="destructive" onClick={stopRecording} className="gap-1">
                <Square size={14} /> إيقاف وحفظ
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : filteredMeetings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Video className="mx-auto mb-3 opacity-40" size={40} />
            لا توجد محاضرات بعد. أضف محاضرة جديدة بإدخال رابط Google Meet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filteredMeetings.map((m) => {
            const recs = recordingsByMeeting(m.id);
            const isRecordingThis = recMeetingId === m.id;
            return (
              <Card key={m.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-sm text-primary">{m.title}</h3>
                        <Badge
                          variant={m.status === "live" ? "default" : "outline"}
                          className="text-[10px]"
                        >
                          {m.status === "scheduled" ? "مجدول" : m.status === "live" ? "مباشر" : "منتهٍ"}
                        </Badge>
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        {courseTitle(m.course_id)}
                      </div>
                      {m.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {m.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <a
                        href={m.meet_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-1"
                      >
                        <ExternalLink size={12} /> فتح Meet
                      </a>
                      {isRecordingThis ? (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={stopRecording}
                          className="gap-1"
                        >
                          <Square size={14} /> إيقاف
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          disabled={recState !== "idle"}
                          onClick={() => startRecording(m)}
                          className="gap-1 bg-red-600 hover:bg-red-700 text-white"
                        >
                          <Mic size={14} /> ابدأ + سجّل
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeMeeting(m.id)}
                        className="text-destructive hover:text-destructive gap-1"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>

                  {recs.length > 0 && (
                    <div className="mt-3 border-t border-border pt-3 space-y-1.5">
                      <div className="text-[11px] font-bold text-muted-foreground flex items-center gap-1">
                        <AudioLines size={12} /> التسجيلات المرفوعة
                      </div>
                      {recs.map((r) => (
                        <div
                          key={r.id}
                          className="flex items-center justify-between gap-2 text-xs bg-muted/40 rounded px-2 py-1.5"
                        >
                          <span className="truncate">{r.title}</span>
                          <span className="text-muted-foreground text-[10px] shrink-0">
                            {formatDuration(r.duration_seconds)} • {formatBytes(r.size_bytes)}
                          </span>
                          <button
                            type="button"
                            onClick={() => playRecording(r)}
                            className="text-accent hover:underline text-[11px] shrink-0"
                          >
                            تشغيل
                          </button>
                          <button
                            type="button"
                            onClick={() => removeRecording(r)}
                            className="text-destructive hover:underline text-[11px] shrink-0"
                          >
                            حذف
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>إضافة محاضرة</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1 block">المقرر *</label>
              <Select
                value={form.course_id}
                onValueChange={(v) => setForm({ ...form, course_id: v })}
              >
                <SelectTrigger><SelectValue placeholder="اختر المقرر" /></SelectTrigger>
                <SelectContent>
                  {courses.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">عنوان المحاضرة *</label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">رابط Google Meet *</label>
              <Input
                dir="ltr"
                placeholder="https://meet.google.com/xxx-xxxx-xxx"
                value={form.meet_url}
                onChange={(e) => setForm({ ...form, meet_url: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">الوقت المجدول (اختياري)</label>
              <Input
                type="datetime-local"
                value={form.scheduled_at}
                onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">وصف</label>
              <Textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={submitting || !form.course_id || !form.title || !form.meet_url}
              >
                {submitting ? "جارٍ الحفظ..." : "حفظ"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </TeacherLayout>
  );
}
