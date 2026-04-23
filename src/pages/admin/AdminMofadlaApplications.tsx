import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ClipboardList, Eye, Trash2 } from "lucide-react";

type Status = "pending" | "accepted" | "rejected" | "waitlisted";
type Branch = "scientific" | "literary" | "both";

type Application = {
  id: string;
  full_name: string;
  national_id: string;
  exam_number: string;
  phone: string;
  email: string;
  address: string;
  branch: Branch;
  total_score: number;
  gender: string;
  birth_date: string | null;
  graduation_year: number | null;
  notes: string;
  status: Status;
  accepted_program_id: string | null;
  admin_notes: string;
  created_at: string;
};

type Grade = { id: string; subject: string; score: number; max_score: number };
type Preference = {
  id: string;
  preference_order: number;
  program_id: string;
  program?: { name: string; faculty: string };
};
type Program = { id: string; name: string };

const branchLabel = (b: Branch) =>
  b === "scientific" ? "علمي" : b === "literary" ? "أدبي" : "علمي/أدبي";

const statusLabel = (s: Status) =>
  s === "accepted" ? "مقبول" : s === "rejected" ? "مرفوض" : s === "waitlisted" ? "احتياط" : "قيد المراجعة";

const statusVariant = (s: Status): "default" | "secondary" | "outline" | "destructive" =>
  s === "accepted" ? "secondary" : s === "rejected" ? "destructive" : s === "waitlisted" ? "outline" : "default";

export default function AdminMofadlaApplications() {
  const { user } = useAuth();
  const [apps, setApps] = useState<Application[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | Status>("pending");
  const [selected, setSelected] = useState<Application | null>(null);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [prefs, setPrefs] = useState<Preference[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [draftStatus, setDraftStatus] = useState<Status>("pending");
  const [draftAcceptedProgram, setDraftAcceptedProgram] = useState<string>("");
  const [draftNotes, setDraftNotes] = useState("");

  const load = async () => {
    setLoading(true);
    const [appsRes, progsRes] = await Promise.all([
      supabase
        .from("mofadla_applications")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase.from("mofadla_programs").select("id, name").order("sort_order"),
    ]);
    if (appsRes.error) {
      toast({ title: "خطأ", description: appsRes.error.message, variant: "destructive" });
    } else {
      setApps(appsRes.data as Application[]);
    }
    if (!progsRes.error) setPrograms(progsRes.data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const openDetail = async (app: Application) => {
    setSelected(app);
    setDraftStatus(app.status);
    setDraftAcceptedProgram(app.accepted_program_id ?? "");
    setDraftNotes(app.admin_notes);
    setDetailLoading(true);

    const [gradesRes, prefsRes] = await Promise.all([
      supabase
        .from("mofadla_application_grades")
        .select("id, subject, score, max_score")
        .eq("application_id", app.id)
        .order("sort_order", { ascending: true }),
      supabase
        .from("mofadla_application_preferences")
        .select("id, preference_order, program_id")
        .eq("application_id", app.id)
        .order("preference_order", { ascending: true }),
    ]);

    setGrades((gradesRes.data ?? []) as Grade[]);

    const prefsData = (prefsRes.data ?? []) as Preference[];
    if (prefsData.length > 0) {
      const ids = prefsData.map((p) => p.program_id);
      const { data: progs } = await supabase
        .from("mofadla_programs")
        .select("id, name, faculty")
        .in("id", ids);
      const map: Record<string, { name: string; faculty: string }> = {};
      (progs ?? []).forEach((p) => (map[p.id] = { name: p.name, faculty: p.faculty }));
      prefsData.forEach((p) => {
        p.program = map[p.program_id];
      });
    }
    setPrefs(prefsData);
    setDetailLoading(false);
  };

  const saveDecision = async () => {
    if (!selected) return;
    setSavingId(selected.id);
    const { error } = await supabase
      .from("mofadla_applications")
      .update({
        status: draftStatus,
        accepted_program_id:
          draftStatus === "accepted" ? draftAcceptedProgram || null : null,
        admin_notes: draftNotes,
        decided_at: new Date().toISOString(),
        decided_by: user?.id ?? null,
      })
      .eq("id", selected.id);
    setSavingId(null);
    if (error) {
      toast({ title: "تعذر الحفظ", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "تم الحفظ" });
    setSelected(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("حذف الطلب نهائياً؟")) return;
    const { error } = await supabase.from("mofadla_applications").delete().eq("id", id);
    if (error) {
      toast({ title: "تعذر الحذف", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "تم الحذف" });
    load();
  };

  const filtered = filter === "all" ? apps : apps.filter((a) => a.status === filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">طلبات المفاضلة</h1>
          <p className="text-sm text-muted-foreground mt-1">
            راجع طلبات المتقدمين وقم بقبولهم أو رفضهم.
          </p>
        </div>
        <div className="w-48">
          <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">قيد المراجعة</SelectItem>
              <SelectItem value="accepted">مقبول</SelectItem>
              <SelectItem value="waitlisted">احتياط</SelectItem>
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
            <ClipboardList className="mx-auto mb-3 opacity-40" size={40} />
            لا توجد طلبات.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map((a) => (
            <Card key={a.id}>
              <CardContent className="p-4 flex items-center justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-bold text-primary">{a.full_name}</h3>
                    <Badge variant={statusVariant(a.status)} className="text-[10px]">
                      {statusLabel(a.status)}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      {branchLabel(a.branch)}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>الرقم الوطني: <span dir="ltr">{a.national_id}</span></span>
                    <span>الهاتف: <span dir="ltr">{a.phone}</span></span>
                    <span>المجموع: <strong className="text-foreground">{Number(a.total_score)}</strong></span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => openDetail(a)} className="gap-1">
                    <Eye size={14} /> عرض
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => remove(a.id)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>تفاصيل الطلب</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 text-sm">
              <Section title="البيانات الشخصية">
                <Field label="الاسم الكامل" value={selected.full_name} />
                <Field label="الرقم الوطني" value={selected.national_id} ltr />
                <Field label="رقم الاكتتاب" value={selected.exam_number || "—"} ltr />
                <Field label="تاريخ الميلاد" value={selected.birth_date ?? "—"} />
                <Field label="الجنس" value={selected.gender || "—"} />
                <Field label="الهاتف" value={selected.phone || "—"} ltr />
                <Field label="البريد" value={selected.email || "—"} ltr />
                <Field label="الفرع" value={branchLabel(selected.branch)} />
                <Field label="المجموع" value={String(Number(selected.total_score))} />
                <Field
                  label="سنة التخرج"
                  value={selected.graduation_year?.toString() ?? "—"}
                />
                <Field label="العنوان" value={selected.address || "—"} full />
                {selected.notes && (
                  <Field label="ملاحظات الطالب" value={selected.notes} full />
                )}
              </Section>

              <Section title="العلامات">
                {detailLoading ? (
                  <p className="text-xs text-muted-foreground">جارٍ التحميل...</p>
                ) : grades.length === 0 ? (
                  <p className="text-xs text-muted-foreground">لا توجد علامات.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {grades.map((g) => (
                      <div
                        key={g.id}
                        className="flex items-center justify-between bg-muted/40 rounded-md px-3 py-2"
                      >
                        <span className="text-xs">{g.subject}</span>
                        <span className="text-xs font-bold">
                          {Number(g.score)} / {Number(g.max_score)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </Section>

              <Section title="ترتيب الرغبات">
                {detailLoading ? (
                  <p className="text-xs text-muted-foreground">جارٍ التحميل...</p>
                ) : prefs.length === 0 ? (
                  <p className="text-xs text-muted-foreground">لا توجد رغبات.</p>
                ) : (
                  <ol className="space-y-1">
                    {prefs.map((p) => (
                      <li
                        key={p.id}
                        className="flex items-center gap-2 bg-muted/40 rounded-md px-3 py-2"
                      >
                        <span className="w-6 h-6 rounded-full bg-accent text-accent-foreground text-xs font-bold flex items-center justify-center">
                          {p.preference_order}
                        </span>
                        <div className="min-w-0">
                          <div className="text-xs font-bold">{p.program?.name ?? "—"}</div>
                          {p.program?.faculty && (
                            <div className="text-[11px] text-muted-foreground">
                              {p.program.faculty}
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
              </Section>

              <Section title="القرار">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 col-span-2 w-full">
                  <div>
                    <label className="text-xs font-medium mb-1 block">الحالة</label>
                    <Select
                      value={draftStatus}
                      onValueChange={(v) => setDraftStatus(v as Status)}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">قيد المراجعة</SelectItem>
                        <SelectItem value="accepted">مقبول</SelectItem>
                        <SelectItem value="waitlisted">احتياط</SelectItem>
                        <SelectItem value="rejected">مرفوض</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {draftStatus === "accepted" && (
                    <div>
                      <label className="text-xs font-medium mb-1 block">البرنامج المقبول</label>
                      <Select
                        value={draftAcceptedProgram}
                        onValueChange={setDraftAcceptedProgram}
                      >
                        <SelectTrigger><SelectValue placeholder="اختر البرنامج" /></SelectTrigger>
                        <SelectContent>
                          {programs.map((p) => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                <div className="col-span-2 w-full">
                  <label className="text-xs font-medium mb-1 block">ملاحظات الإدارة</label>
                  <Textarea
                    rows={2}
                    value={draftNotes}
                    onChange={(e) => setDraftNotes(e.target.value)}
                    maxLength={1000}
                  />
                </div>
              </Section>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setSelected(null)}>إغلاق</Button>
            <Button onClick={saveDecision} disabled={savingId === selected?.id}>
              {savingId === selected?.id ? "جارٍ الحفظ..." : "حفظ القرار"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wide">
        {title}
      </h3>
      <div className="grid grid-cols-2 gap-2">{children}</div>
    </div>
  );
}

function Field({ label, value, ltr, full }: { label: string; value: string; ltr?: boolean; full?: boolean }) {
  return (
    <div className={`bg-muted/30 rounded-md px-3 py-2 ${full ? "col-span-2" : ""}`}>
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className={`text-xs font-medium mt-0.5 ${ltr ? "text-left" : ""}`} dir={ltr ? "ltr" : undefined}>
        {value}
      </div>
    </div>
  );
}
