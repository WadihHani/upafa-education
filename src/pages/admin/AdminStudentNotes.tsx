import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, StickyNote, Search } from "lucide-react";

type Student = {
  id: string;
  email: string;
  full_name: string;
};

type Note = {
  id: string;
  student_user_id: string;
  note: string;
  is_read: boolean;
  created_at: string;
};

export default function AdminStudentNotes() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Student | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Note | null>(null);
  const [noteText, setNoteText] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    const { data: studentsData, error: stErr } = await supabase.functions.invoke(
      "admin-manage-users",
      { body: { action: "list" } },
    );
    if (stErr) {
      toast({ title: "خطأ في تحميل الطلاب", description: stErr.message, variant: "destructive" });
    } else {
      const onlyStudents = (studentsData?.users ?? [])
        .filter((u: any) => u.roles?.includes("student"))
        .map((u: any) => ({ id: u.id, email: u.email, full_name: u.full_name }));
      setStudents(onlyStudents);
    }
    const { data: notesData } = await supabase
      .from("student_notes")
      .select("*")
      .order("created_at", { ascending: false });
    setNotes((notesData ?? []) as Note[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const studentNotes = (uid: string) => notes.filter((n) => n.student_user_id === uid);
  const filtered = students.filter(
    (s) =>
      !search ||
      s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase()),
  );

  const openAdd = (student: Student) => {
    setSelected(student);
    setEditing(null);
    setNoteText("");
    setDialogOpen(true);
  };

  const openEdit = (student: Student, note: Note) => {
    setSelected(student);
    setEditing(note);
    setNoteText(note.note);
    setDialogOpen(true);
  };

  const save = async () => {
    if (!selected || !noteText.trim()) return;
    setSaving(true);
    if (editing) {
      const { error } = await supabase
        .from("student_notes")
        .update({ note: noteText.trim(), is_read: false })
        .eq("id", editing.id);
      if (error) {
        toast({ title: "خطأ", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "تم تحديث الملاحظة" });
      }
    } else {
      const { error } = await supabase.from("student_notes").insert({
        student_user_id: selected.id,
        note: noteText.trim(),
        created_by: user?.id,
      });
      if (error) {
        toast({ title: "خطأ", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "تمت إضافة الملاحظة" });
      }
    }
    setSaving(false);
    setDialogOpen(false);
    fetchAll();
  };

  const remove = async (note: Note) => {
    if (!confirm("حذف هذه الملاحظة؟")) return;
    const { error } = await supabase.from("student_notes").delete().eq("id", note.id);
    if (error) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "تم الحذف" });
      fetchAll();
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">ملاحظات الطلاب</h1>
        <p className="text-sm text-muted-foreground mt-1">
          أضف ملاحظات خاصة لكل طالب — ستظهر له فور تسجيل الدخول إلى بوابته.
        </p>
      </div>

      <div className="relative mb-4 max-w-md">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
        <Input
          placeholder="ابحث باسم الطالب أو بريده..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pr-9"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            لا يوجد طلاب
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((s) => {
            const sNotes = studentNotes(s.id);
            const unread = sNotes.filter((n) => !n.is_read).length;
            return (
              <Card key={s.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <CardTitle className="text-base">{s.full_name || "—"}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-1" dir="ltr">{s.email}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {sNotes.length > 0 && (
                        <Badge variant="secondary" className="text-[10px]">
                          {sNotes.length} ملاحظة
                        </Badge>
                      )}
                      {unread > 0 && (
                        <Badge variant="destructive" className="text-[10px]">
                          {unread} غير مقروءة
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  {sNotes.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">لا توجد ملاحظات.</p>
                  ) : (
                    sNotes.map((n) => (
                      <div
                        key={n.id}
                        className="border border-border rounded-md p-2.5 bg-muted/20 text-xs"
                      >
                        <p className="whitespace-pre-wrap">{n.note}</p>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/60">
                          <span className="text-[10px] text-muted-foreground" dir="ltr">
                            {new Date(n.created_at).toLocaleString("ar-SY")}
                          </span>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => openEdit(s, n)}>
                              <Pencil size={12} />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 px-2 text-destructive" onClick={() => remove(n)}>
                              <Trash2 size={12} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  <Button size="sm" variant="outline" className="gap-1 w-full" onClick={() => openAdd(s)}>
                    <Plus size={14} /> إضافة ملاحظة
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <StickyNote size={18} />
              {editing ? "تعديل ملاحظة" : "ملاحظة جديدة"} — {selected?.full_name}
            </DialogTitle>
          </DialogHeader>
          <Textarea
            rows={6}
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="اكتب الملاحظة التي ستظهر للطالب..."
          />
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>إلغاء</Button>
            <Button onClick={save} disabled={saving || !noteText.trim()}>
              {saving ? "..." : "حفظ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
