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
import {
  UserPlus,
  Eye,
  Trash2,
  ExternalLink,
  Image as ImageIcon,
} from "lucide-react";

type Status = "pending" | "approved" | "rejected";

type Registration = {
  id: string;
  full_name: string;
  father_name: string;
  mother_name: string;
  national_id: string;
  birth_date: string | null;
  phone: string;
  email: string;
  address: string;
  last_certificate: string;
  average: number;
  graduation_year: number | null;
  personal_photo_url: string;
  national_id_url: string;
  certificate_url: string;
  payment_receipt_url: string;
  notes: string;
  status: Status;
  admin_notes: string;
  created_at: string;
};

const statusLabel = (s: Status) =>
  s === "approved" ? "مقبول" : s === "rejected" ? "مرفوض" : "قيد المراجعة";

const statusVariant = (s: Status): "default" | "secondary" | "destructive" =>
  s === "approved" ? "secondary" : s === "rejected" ? "destructive" : "default";

export default function AdminMofadlaQuickRegistrations() {
  const { user } = useAuth();
  const [items, setItems] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | Status>("pending");
  const [selected, setSelected] = useState<Registration | null>(null);
  const [draftStatus, setDraftStatus] = useState<Status>("pending");
  const [draftNotes, setDraftNotes] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("mofadla_quick_registrations")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    } else {
      setItems((data ?? []) as Registration[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel("admin-quick-registrations")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "mofadla_quick_registrations" },
        () => load(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const openDetail = (r: Registration) => {
    setSelected(r);
    setDraftStatus(r.status);
    setDraftNotes(r.admin_notes);
  };

  const saveDecision = async () => {
    if (!selected) return;
    setSavingId(selected.id);
    const { error } = await supabase
      .from("mofadla_quick_registrations")
      .update({
        status: draftStatus,
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
    if (!confirm("حذف التسجيل نهائياً؟")) return;
    const { error } = await supabase
      .from("mofadla_quick_registrations")
      .delete()
      .eq("id", id);
    if (error) {
      toast({ title: "تعذر الحذف", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "تم الحذف" });
    load();
  };

  const filtered = filter === "all" ? items : items.filter((i) => i.status === filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">تثبيت التسجيل</h1>
          <p className="text-sm text-muted-foreground mt-1">
            بيانات الطلاب الذين سجّلوا عبر النموذج المختصر مع المستندات وإيصال الدفع.
          </p>
        </div>
        <div className="w-48">
          <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
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
            <UserPlus className="mx-auto mb-3 opacity-40" size={40} />
            لا توجد تسجيلات.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map((r) => (
            <Card key={r.id}>
              <CardContent className="p-4 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3 min-w-0">
                  {r.personal_photo_url ? (
                    <img
                      src={r.personal_photo_url}
                      alt={r.full_name}
                      className="w-12 h-12 rounded-md object-cover border border-border shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                      <ImageIcon size={18} />
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-bold text-primary truncate">{r.full_name}</h3>
                      <Badge variant={statusVariant(r.status)} className="text-[10px]">
                        {statusLabel(r.status)}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span>
                        الرقم الوطني: <span dir="ltr">{r.national_id}</span>
                      </span>
                      <span>
                        الهاتف: <span dir="ltr">{r.phone}</span>
                      </span>
                      {r.average > 0 && (
                        <span>
                          المعدل:{" "}
                          <strong className="text-foreground">{Number(r.average)}</strong>
                        </span>
                      )}
                      <span>
                        التاريخ:{" "}
                        {new Date(r.created_at).toLocaleDateString("ar-EG")}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => openDetail(r)} className="gap-1">
                    <Eye size={14} /> عرض
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => remove(r.id)}
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
        <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>تفاصيل التسجيل</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-5 text-sm">
              <Section title="البيانات الشخصية">
                <Field label="الاسم الكامل" value={selected.full_name} />
                <Field label="اسم الأب" value={selected.father_name || "—"} />
                <Field label="اسم الأم" value={selected.mother_name || "—"} />
                <Field label="الرقم الوطني" value={selected.national_id} ltr />
                <Field label="الهاتف" value={selected.phone || "—"} ltr />
                <Field label="البريد" value={selected.email || "—"} ltr />
                <Field label="تاريخ الميلاد" value={selected.birth_date ?? "—"} />
                <Field
                  label="سنة التخرج"
                  value={selected.graduation_year?.toString() ?? "—"}
                />
                <Field label="آخر شهادة" value={selected.last_certificate || "—"} />
                <Field
                  label="المعدل"
                  value={selected.average ? String(Number(selected.average)) : "—"}
                />
                <Field label="العنوان" value={selected.address || "—"} full />
                {selected.notes && (
                  <Field label="ملاحظات الطالب" value={selected.notes} full />
                )}
              </Section>

              <Section title="المستندات المرفقة">
                <DocCard label="صورة شخصية" url={selected.personal_photo_url} />
                <DocCard label="الهوية / الرقم الوطني" url={selected.national_id_url} />
                <DocCard label="آخر شهادة" url={selected.certificate_url} />
                <DocCard label="إيصال دفع رسوم التسجيل" url={selected.payment_receipt_url} />
              </Section>

              <Section title="القرار">
                <div className="col-span-2">
                  <label className="text-xs font-medium mb-1 block">الحالة</label>
                  <Select
                    value={draftStatus}
                    onValueChange={(v) => setDraftStatus(v as Status)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">قيد المراجعة</SelectItem>
                      <SelectItem value="approved">مقبول</SelectItem>
                      <SelectItem value="rejected">مرفوض</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
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
            <Button variant="outline" onClick={() => setSelected(null)}>
              إغلاق
            </Button>
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

function Field({
  label,
  value,
  ltr,
  full,
}: {
  label: string;
  value: string;
  ltr?: boolean;
  full?: boolean;
}) {
  return (
    <div className={`bg-muted/30 rounded-md px-3 py-2 ${full ? "col-span-2" : ""}`}>
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div
        className={`text-xs font-medium mt-0.5 ${ltr ? "text-left" : ""}`}
        dir={ltr ? "ltr" : undefined}
      >
        {value}
      </div>
    </div>
  );
}

function DocCard({ label, url }: { label: string; url: string }) {
  if (!url) {
    return (
      <div className="bg-muted/30 rounded-md p-3 text-center text-xs text-muted-foreground">
        <div className="font-bold mb-1">{label}</div>
        <div>غير مرفق</div>
      </div>
    );
  }
  const isPdf = url.toLowerCase().endsWith(".pdf");
  return (
    <div className="bg-card border border-border rounded-md overflow-hidden">
      {isPdf ? (
        <div className="h-32 flex items-center justify-center bg-muted/30 text-muted-foreground text-xs gap-2">
          <ExternalLink size={16} />
          ملف PDF
        </div>
      ) : (
        <a href={url} target="_blank" rel="noopener noreferrer">
          <img
            src={url}
            alt={label}
            className="w-full h-32 object-contain bg-muted/30 hover:opacity-90 transition-opacity cursor-zoom-in"
          />
        </a>
      )}
      <div className="flex items-center justify-between p-2 border-t border-border">
        <span className="text-xs font-bold text-primary truncate">{label}</span>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-accent hover:underline flex items-center gap-1 shrink-0"
        >
          <ExternalLink size={12} /> فتح
        </a>
      </div>
    </div>
  );
}
