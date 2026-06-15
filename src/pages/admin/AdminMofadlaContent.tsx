import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { clearSiteContentCache } from "@/hooks/use-site-content";
import {
  Save, Upload, Trash2, Plus, FileText, GraduationCap,
  ClipboardList, UserPlus, ExternalLink, Loader2, RotateCcw
} from "lucide-react";
import { MOFADLA_DEFAULTS } from "./mofadla-defaults";

// ---------- Field config ----------
type Field = { key: string; label: string; type: "text" | "textarea"; rows?: number; hint?: string };
type Section = { id: string; title: string; fields: Field[] };

const SECTIONS: Section[] = [
  {
    id: "hero",
    title: "البطل (Hero)",
    fields: [
      { key: "mofadla_hero_badge", label: "الشارة", type: "text" },
      { key: "mofadla_hero_title", label: "العنوان الرئيسي", type: "text" },
      { key: "mofadla_hero_desc", label: "الوصف", type: "textarea", rows: 3 },
      { key: "mofadla_cta_apply", label: "زر «قدّم الآن»", type: "text" },
      { key: "mofadla_cta_register", label: "زر «تثبيت التسجيل»", type: "text" },
      { key: "mofadla_cta_programs", label: "زر «عرض البرامج»", type: "text" },
    ],
  },
  {
    id: "stats",
    title: "الإحصاءات (4 بطاقات)",
    fields: [1, 2, 3, 4].flatMap((i) => [
      { key: `mofadla_stat_${i}_label`, label: `بطاقة ${i} - النص`, type: "text" as const },
      { key: `mofadla_stat_${i}_value`, label: `بطاقة ${i} - القيمة`, type: "text" as const },
    ]),
  },
  {
    id: "calendar",
    title: "التقويم الجامعي",
    fields: [
      { key: "mofadla_cal_badge", label: "الشارة", type: "text" },
      { key: "mofadla_cal_title", label: "العنوان", type: "text" },
      { key: "mofadla_cal_subtitle", label: "الوصف", type: "textarea", rows: 2 },
      { key: "mofadla_sem1_title", label: "اسم الفصل الأول", type: "text" },
      { key: "mofadla_sem1_duration", label: "مدة الفصل الأول", type: "text" },
      { key: "mofadla_sem1_rows", label: "بنود الفصل الأول (سطر لكل بند: اسم|قيمة)", type: "textarea", rows: 4 },
      { key: "mofadla_sem2_title", label: "اسم الفصل الثاني", type: "text" },
      { key: "mofadla_sem2_duration", label: "مدة الفصل الثاني", type: "text" },
      { key: "mofadla_sem2_rows", label: "بنود الفصل الثاني (سطر لكل بند: اسم|قيمة)", type: "textarea", rows: 4 },
    ],
  },
  {
    id: "docs",
    title: "الوثائق والخطوات",
    fields: [
      { key: "mofadla_docs_badge", label: "شارة الوثائق", type: "text" },
      { key: "mofadla_docs_title", label: "عنوان الوثائق", type: "text" },
      { key: "mofadla_docs_subtitle", label: "وصف الوثائق", type: "textarea", rows: 2 },
      { key: "mofadla_docs_list", label: "قائمة الوثائق (سطر لكل بند)", type: "textarea", rows: 6 },
      { key: "mofadla_steps_badge", label: "شارة الخطوات", type: "text" },
      { key: "mofadla_steps_title", label: "عنوان الخطوات", type: "text" },
      { key: "mofadla_steps_subtitle", label: "وصف الخطوات", type: "textarea", rows: 2 },
      { key: "mofadla_steps_list", label: "الخطوات (سطر: عنوان|وصف)", type: "textarea", rows: 5 },
    ],
  },
  {
    id: "programs",
    title: "نصوص قسم البرامج",
    fields: [
      { key: "mofadla_prog_badge", label: "الشارة", type: "text" },
      { key: "mofadla_prog_title", label: "العنوان", type: "text" },
      { key: "mofadla_prog_subtitle", label: "الوصف", type: "textarea", rows: 2 },
      { key: "mofadla_prog_empty", label: "نص فراغ البرامج", type: "text" },
      { key: "mofadla_prog_seats_label", label: "تسمية «المقاعد»", type: "text" },
      { key: "mofadla_prog_min_label", label: "تسمية «الحد الأدنى»", type: "text" },
    ],
  },
  {
    id: "register",
    title: "نصوص قسم التسجيل",
    fields: [
      { key: "mofadla_reg_badge", label: "الشارة", type: "text" },
      { key: "mofadla_reg_title", label: "العنوان", type: "text" },
      { key: "mofadla_reg_subtitle", label: "الوصف", type: "textarea", rows: 2 },
    ],
  },
  {
    id: "notes",
    title: "الملاحظات الهامة",
    fields: [
      { key: "mofadla_notes_badge", label: "الشارة", type: "text" },
      { key: "mofadla_notes_title", label: "العنوان", type: "text" },
      { key: "mofadla_notes_subtitle", label: "الوصف", type: "textarea", rows: 2 },
      { key: "mofadla_notes_list", label: "قائمة الملاحظات (سطر لكل ملاحظة)", type: "textarea", rows: 6 },
    ],
  },
  {
    id: "cta",
    title: "الدعوة + التواصل",
    fields: [
      { key: "mofadla_cta_title", label: "عنوان CTA", type: "text" },
      { key: "mofadla_cta_desc", label: "وصف CTA", type: "textarea", rows: 2 },
      { key: "mofadla_cta_apply_btn", label: "زر التقديم", type: "text" },
      { key: "mofadla_cta_faq_btn", label: "زر FAQ", type: "text" },
      { key: "mofadla_contact_title", label: "عنوان التواصل", type: "text" },
      { key: "mofadla_contact_phone", label: "الهاتف", type: "text" },
      { key: "mofadla_contact_wa", label: "واتساب", type: "text" },
      { key: "mofadla_contact_email", label: "البريد", type: "text" },
      { key: "mofadla_contact_address", label: "العنوان", type: "text" },
    ],
  },
  {
    id: "seo",
    title: "SEO",
    fields: [
      { key: "mofadla_seo_title", label: "عنوان SEO", type: "text" },
      { key: "mofadla_seo_desc", label: "وصف SEO", type: "textarea", rows: 2 },
    ],
  },
];

const DOWNLOADS_KEY = "mofadla_dl_list";
const DOWNLOADS_META_FIELDS: Field[] = [
  { key: "mofadla_dl_badge", label: "الشارة", type: "text" },
  { key: "mofadla_dl_title", label: "العنوان", type: "text" },
  { key: "mofadla_dl_subtitle", label: "الوصف", type: "textarea", rows: 2 },
  { key: "mofadla_dl_btn", label: "نص زر التحميل", type: "text" },
];

// All text keys we need to load
const ALL_KEYS = [
  ...SECTIONS.flatMap((s) => s.fields.map((f) => f.key)),
  ...DOWNLOADS_META_FIELDS.map((f) => f.key),
  DOWNLOADS_KEY,
];

type DLItem = { name: string; desc: string; url: string };

const parseDownloads = (raw: string): DLItem[] =>
  raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const [name = "", desc = "", url = ""] = l.split("|").map((s) => s.trim());
      return { name, desc, url };
    });

const serializeDownloads = (items: DLItem[]) =>
  items
    .filter((i) => i.name || i.url)
    .map((i) => `${i.name}|${i.desc}|${i.url}`)
    .join("\n");

export default function AdminMofadlaContent() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [downloads, setDownloads] = useState<DLItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const [stats, setStats] = useState({ programs: 0, applications: 0, pending: 0 });

  useEffect(() => {
    (async () => {
      const { data } = await (supabase as any)
        .from("site_content")
        .select("section_key, content")
        .in("section_key", ALL_KEYS);
      const map: Record<string, string> = {};
      (data || []).forEach((r: any) => {
        map[r.section_key] = r.content ?? "";
      });
      setValues(map);
      setDownloads(parseDownloads(map[DOWNLOADS_KEY] || ""));

      const [pg, ap, pr] = await Promise.all([
        supabase.from("mofadla_programs").select("id", { count: "exact", head: true }),
        supabase.from("mofadla_applications").select("id", { count: "exact", head: true }),
        supabase
          .from("mofadla_quick_registrations")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending"),
      ]);
      setStats({
        programs: pg.count ?? 0,
        applications: ap.count ?? 0,
        pending: pr.count ?? 0,
      });
      setLoading(false);
    })();
  }, []);

  const setVal = (k: string, v: string) => setValues((s) => ({ ...s, [k]: v }));

  const updateDL = (i: number, patch: Partial<DLItem>) =>
    setDownloads((arr) => arr.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));

  const addDL = () => setDownloads((a) => [...a, { name: "", desc: "", url: "" }]);
  const removeDL = (i: number) => setDownloads((a) => a.filter((_, idx) => idx !== i));

  const uploadFile = async (i: number, file: File) => {
    setUploadingIdx(i);
    try {
      const ext = file.name.split(".").pop() || "pdf";
      const path = `mofadla/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage
        .from("site-images")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from("site-images").getPublicUrl(path);
      updateDL(i, { url: data.publicUrl, name: downloads[i]?.name || file.name.replace(/\.[^.]+$/, "") });
      toast({ title: "تم رفع الملف" });
    } catch (e: any) {
      toast({ title: "تعذر الرفع", description: e.message, variant: "destructive" });
    } finally {
      setUploadingIdx(null);
    }
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      const rows = [
        ...Object.entries(values).map(([section_key, content]) => ({ section_key, content })),
        { section_key: DOWNLOADS_KEY, content: serializeDownloads(downloads) },
      ];
      const { error } = await (supabase as any)
        .from("site_content")
        .upsert(rows, { onConflict: "section_key" });
      if (error) throw error;
      clearSiteContentCache();
      toast({ title: "تم الحفظ ✅", description: "جميع تعديلات صفحة المفاضلة تم نشرها." });
    } catch (e: any) {
      toast({ title: "خطأ في الحفظ", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">إدارة صفحة المفاضلة</h1>
          <p className="text-sm text-muted-foreground mt-1">
            عدّل جميع نصوص ومحتوى صفحة المفاضلة وارفع ملفات PDF الرسمية.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm" className="gap-2">
            <Link to="/mofadla" target="_blank"><ExternalLink size={14} />معاينة الصفحة</Link>
          </Button>
          <Button onClick={saveAll} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            حفظ ونشر
          </Button>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid sm:grid-cols-3 gap-3">
        <QuickCard to="/admin/mofadla/programs" icon={GraduationCap} title="برامج المفاضلة" value={stats.programs} hint="إدارة الاختصاصات والمقاعد" />
        <QuickCard to="/admin/mofadla/applications" icon={ClipboardList} title="طلبات المفاضلة" value={stats.applications} hint="الطلبات الواردة" />
        <QuickCard to="/admin/mofadla/registrations" icon={UserPlus} title="تثبيت التسجيل" value={stats.pending} hint="بانتظار المراجعة" highlight={stats.pending > 0} />
      </div>

      <Tabs defaultValue="hero">
        <TabsList className="flex flex-wrap h-auto justify-start gap-1 bg-muted/40 p-1">
          {SECTIONS.map((s) => (
            <TabsTrigger key={s.id} value={s.id} className="text-xs">{s.title}</TabsTrigger>
          ))}
          <TabsTrigger value="downloads" className="text-xs">📎 الملفات (PDF)</TabsTrigger>
        </TabsList>

        {SECTIONS.map((s) => (
          <TabsContent key={s.id} value={s.id} className="mt-4">
            <Card>
              <CardContent className="p-5 grid md:grid-cols-2 gap-4">
                {s.fields.map((f) => (
                  <FieldEditor
                    key={f.key}
                    field={f}
                    value={values[f.key] || ""}
                    onChange={(v) => setVal(f.key, v)}
                    full={f.type === "textarea"}
                  />
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        ))}

        <TabsContent value="downloads" className="mt-4 space-y-4">
          <Card>
            <CardContent className="p-5 grid md:grid-cols-2 gap-4">
              {DOWNLOADS_META_FIELDS.map((f) => (
                <FieldEditor
                  key={f.key}
                  field={f}
                  value={values[f.key] || ""}
                  onChange={(v) => setVal(f.key, v)}
                  full={f.type === "textarea"}
                />
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold">ملفات التحميل</h3>
                <Button size="sm" variant="outline" onClick={addDL} className="gap-2">
                  <Plus size={14} />إضافة ملف
                </Button>
              </div>
              {downloads.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">
                  لا توجد ملفات. أضف ملفاً جديداً للبدء.
                </p>
              )}
              {downloads.map((d, i) => (
                <div key={i} className="border border-border rounded-lg p-4 space-y-2 bg-muted/20">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText size={16} className="text-primary" />
                    <span className="text-xs font-bold text-muted-foreground">ملف #{i + 1}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="me-auto text-destructive h-7 w-7"
                      onClick={() => removeDL(i)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-2">
                    <Input
                      placeholder="اسم الملف"
                      value={d.name}
                      onChange={(e) => updateDL(i, { name: e.target.value })}
                    />
                    <Input
                      placeholder="وصف قصير"
                      value={d.desc}
                      onChange={(e) => updateDL(i, { desc: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2 items-center">
                    <Input
                      placeholder="رابط الملف (يُعبّأ تلقائياً عند الرفع)"
                      value={d.url}
                      onChange={(e) => updateDL(i, { url: e.target.value })}
                      dir="ltr"
                      className="flex-1 text-xs"
                    />
                    <label>
                      <input
                        type="file"
                        accept="application/pdf,image/*,.doc,.docx,.xls,.xlsx"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) uploadFile(i, f);
                          e.target.value = "";
                        }}
                      />
                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                        disabled={uploadingIdx === i}
                        className="gap-2 cursor-pointer"
                      >
                        <span>
                          {uploadingIdx === i ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Upload size={14} />
                          )}
                          رفع ملف
                        </span>
                      </Button>
                    </label>
                  </div>
                  {d.url && (
                    <a
                      href={d.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                    >
                      <ExternalLink size={12} />فتح الملف
                    </a>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="sticky bottom-4 flex justify-end">
        <Button onClick={saveAll} disabled={saving} size="lg" className="gap-2 shadow-lg">
          {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          حفظ ونشر كل التعديلات
        </Button>
      </div>
    </div>
  );
}

function FieldEditor({
  field, value, onChange, full,
}: {
  field: Field;
  value: string;
  onChange: (v: string) => void;
  full?: boolean;
}) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <label className="text-xs font-bold text-muted-foreground mb-1.5 block">
        {field.label}
        <span className="text-[10px] text-muted-foreground/60 font-mono ms-2">{field.key}</span>
      </label>
      {field.type === "textarea" ? (
        <Textarea rows={field.rows || 3} value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <Input value={value} onChange={(e) => onChange(e.target.value)} />
      )}
      {field.hint && <p className="text-[11px] text-muted-foreground mt-1">{field.hint}</p>}
    </div>
  );
}

function QuickCard({
  to, icon: Icon, title, value, hint, highlight,
}: {
  to: string;
  icon: any;
  title: string;
  value: number;
  hint: string;
  highlight?: boolean;
}) {
  return (
    <Link to={to}>
      <Card className={`hover:shadow-md transition-all ${highlight ? "border-accent border-2" : ""}`}>
        <CardContent className="p-4 flex items-center gap-3">
          <div className="w-11 h-11 rounded-md bg-primary/10 text-primary flex items-center justify-center">
            <Icon size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-sm">{title}</div>
            <div className="text-xs text-muted-foreground">{hint}</div>
          </div>
          <div className={`text-2xl font-extrabold ${highlight ? "text-accent" : "text-primary"}`}>{value}</div>
        </CardContent>
      </Card>
    </Link>
  );
}
