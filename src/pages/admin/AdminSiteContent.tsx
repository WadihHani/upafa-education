import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Save, Upload, Trash2, Plus, ImageIcon, Link as LinkIcon } from "lucide-react";
import { clearSiteContentCache } from "@/hooks/use-site-content";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

type ContentItem = {
  id: string;
  section_key: string;
  title: string | null;
  content: string | null;
  image_url: string | null;
  link_url: string | null;
  content_type: string;
  group_key: string;
  label: string | null;
  sort_order: number;
};

const GROUPS: { key: string; label: string }[] = [
  { key: "general", label: "عام" },
  { key: "branding", label: "الهوية والشعار" },
  { key: "home", label: "الصفحة الرئيسية" },
  { key: "about", label: "عن الجامعة" },
  { key: "contact", label: "اتصل بنا" },
  { key: "faq", label: "أسئلة شائعة" },
  { key: "tuition", label: "الرسوم والدراسة" },
  { key: "faculties", label: "الكليات" },
  { key: "publications", label: "المنشورات" },
  { key: "payment", label: "الدفع الإلكتروني" },
  { key: "portal", label: "البوابة (نصوص)" },
  { key: "programs_section", label: "قسم البرامج (الرئيسية)" },
  { key: "mofadla_hero", label: "المفاضلة - الهيرو" },
  { key: "mofadla_calendar", label: "المفاضلة - التقويم" },
  { key: "mofadla_docs", label: "المفاضلة - الوثائق والخطوات" },
  { key: "mofadla_downloads", label: "المفاضلة - تحميل ملفات" },
  { key: "mofadla_programs", label: "المفاضلة - قسم البرامج" },
  { key: "mofadla_register", label: "المفاضلة - تثبيت التسجيل" },
  { key: "mofadla_notes", label: "المفاضلة - ملاحظات" },
  { key: "mofadla_cta", label: "المفاضلة - دعوة + تواصل" },
  { key: "mofadla_seo", label: "المفاضلة - SEO" },
  { key: "footer", label: "الفوتر" },
  { key: "social", label: "وسائل التواصل" },
];

// Default keys to seed in UI if missing
const DEFAULT_KEYS: { key: string; group: string; label: string; type: "text" | "textarea" | "image" | "link"; placeholder?: string }[] = [
  { key: "university_name", group: "branding", label: "اسم الجامعة", type: "text" },
  { key: "logo_url", group: "branding", label: "شعار الجامعة", type: "image" },
  { key: "hero_subtitle", group: "home", label: "العنوان الفرعي (الهيرو)", type: "text" },
  { key: "footer_about", group: "footer", label: "نص الفوتر", type: "textarea" },
  { key: "contact_address", group: "contact", label: "العنوان", type: "text" },
  { key: "contact_phone", group: "contact", label: "الهاتف", type: "text" },
  { key: "contact_email", group: "contact", label: "البريد", type: "text" },
  { key: "contact_hours", group: "contact", label: "ساعات العمل", type: "text" },
  { key: "about_intro", group: "about", label: "نص عن الجامعة", type: "textarea" },
  { key: "about_vision", group: "about", label: "الرؤية", type: "textarea" },
  { key: "about_mission", group: "about", label: "الرسالة", type: "textarea" },
  { key: "about_values", group: "about", label: "القيم", type: "text" },
  { key: "publications_text", group: "publications", label: "نص المنشورات", type: "textarea" },
  { key: "payment_text", group: "payment", label: "نص الدفع", type: "textarea" },
  { key: "whatsapp_number", group: "social", label: "رقم واتساب", type: "text" },
  { key: "facebook_url", group: "social", label: "رابط فيسبوك", type: "link" },
  { key: "instagram_url", group: "social", label: "رابط انستغرام", type: "link" },
  { key: "youtube_url", group: "social", label: "رابط يوتيوب", type: "link" },
  { key: "telegram_url", group: "social", label: "رابط تلغرام", type: "link" },

  // Portal section (homepage block) + Portal page
  { key: "portal_section_title", group: "portal", label: "عنوان قسم البوابة (الرئيسية)", type: "text" },
  { key: "portal_section_subtitle", group: "portal", label: "العنوان الفرعي لقسم البوابة", type: "text" },
  { key: "portal_section_login_label", group: "portal", label: "نص زر تسجيل الدخول", type: "text" },
  { key: "portal_page_title", group: "portal", label: "عنوان صفحة /portal", type: "text" },
  { key: "portal_page_subtitle", group: "portal", label: "العنوان الفرعي لصفحة /portal", type: "text" },

  // Programs section
  { key: "programs_section_title", group: "programs_section", label: "عنوان قسم البرامج", type: "text" },
  { key: "programs_section_subtitle", group: "programs_section", label: "العنوان الفرعي لقسم البرامج", type: "text" },
  { key: "programs_section_more_label", group: "programs_section", label: "نص زر للمزيد", type: "text" },

  // === Mofadla page ===
  // Hero
  { key: "mofadla_hero_badge", group: "mofadla_hero", label: "الشارة (Badge)", type: "text" },
  { key: "mofadla_hero_title", group: "mofadla_hero", label: "العنوان الرئيسي", type: "text" },
  { key: "mofadla_hero_desc", group: "mofadla_hero", label: "الوصف", type: "textarea" },
  { key: "mofadla_cta_apply", group: "mofadla_hero", label: "نص زر التقديم", type: "text" },
  { key: "mofadla_cta_register", group: "mofadla_hero", label: "نص زر تثبيت التسجيل", type: "text" },
  { key: "mofadla_cta_programs", group: "mofadla_hero", label: "نص زر عرض البرامج", type: "text" },
  { key: "mofadla_stats", group: "mofadla_hero", label: "بطاقات الإحصاءات (سطر لكل بطاقة: التسمية|القيمة)", type: "textarea" },

  // Calendar
  { key: "mofadla_cal_badge", group: "mofadla_calendar", label: "شارة القسم", type: "text" },
  { key: "mofadla_cal_title", group: "mofadla_calendar", label: "عنوان التقويم", type: "text" },
  { key: "mofadla_cal_subtitle", group: "mofadla_calendar", label: "وصف التقويم", type: "textarea" },
  { key: "mofadla_sem1_title", group: "mofadla_calendar", label: "اسم الفصل الأول", type: "text" },
  { key: "mofadla_sem1_duration", group: "mofadla_calendar", label: "مدة الفصل الأول", type: "text" },
  { key: "mofadla_sem1_rows", group: "mofadla_calendar", label: "صفوف الفصل الأول (سطر: التسمية|القيمة)", type: "textarea" },
  { key: "mofadla_sem2_title", group: "mofadla_calendar", label: "اسم الفصل الثاني", type: "text" },
  { key: "mofadla_sem2_duration", group: "mofadla_calendar", label: "مدة الفصل الثاني", type: "text" },
  { key: "mofadla_sem2_rows", group: "mofadla_calendar", label: "صفوف الفصل الثاني (سطر: التسمية|القيمة)", type: "textarea" },

  // Docs + Steps
  { key: "mofadla_docs_badge", group: "mofadla_docs", label: "شارة الوثائق", type: "text" },
  { key: "mofadla_docs_title", group: "mofadla_docs", label: "عنوان الوثائق", type: "text" },
  { key: "mofadla_docs_subtitle", group: "mofadla_docs", label: "وصف الوثائق", type: "textarea" },
  { key: "mofadla_docs_list", group: "mofadla_docs", label: "قائمة الوثائق (سطر لكل وثيقة)", type: "textarea" },
  { key: "mofadla_steps_badge", group: "mofadla_docs", label: "شارة الخطوات", type: "text" },
  { key: "mofadla_steps_title", group: "mofadla_docs", label: "عنوان الخطوات", type: "text" },
  { key: "mofadla_steps_subtitle", group: "mofadla_docs", label: "وصف الخطوات", type: "textarea" },
  { key: "mofadla_steps_list", group: "mofadla_docs", label: "قائمة الخطوات (سطر: العنوان|الوصف)", type: "textarea" },

  // Downloads
  { key: "mofadla_dl_badge", group: "mofadla_downloads", label: "الشارة", type: "text" },
  { key: "mofadla_dl_title", group: "mofadla_downloads", label: "العنوان", type: "text" },
  { key: "mofadla_dl_subtitle", group: "mofadla_downloads", label: "الوصف", type: "textarea" },
  { key: "mofadla_dl_list", group: "mofadla_downloads", label: "البطاقات (سطر: العنوان|الوصف|الرابط)", type: "textarea" },
  { key: "mofadla_dl_btn", group: "mofadla_downloads", label: "نص زر التحميل", type: "text" },

  // Programs section (mofadla)
  { key: "mofadla_prog_badge", group: "mofadla_programs", label: "الشارة", type: "text" },
  { key: "mofadla_prog_title", group: "mofadla_programs", label: "العنوان", type: "text" },
  { key: "mofadla_prog_subtitle", group: "mofadla_programs", label: "الوصف", type: "textarea" },
  { key: "mofadla_prog_empty", group: "mofadla_programs", label: "نص حالة عدم وجود برامج", type: "text" },
  { key: "mofadla_prog_seats_label", group: "mofadla_programs", label: "تسمية المقاعد", type: "text" },
  { key: "mofadla_prog_min_label", group: "mofadla_programs", label: "تسمية الحد الأدنى", type: "text" },

  // Register
  { key: "mofadla_reg_badge", group: "mofadla_register", label: "الشارة", type: "text" },
  { key: "mofadla_reg_title", group: "mofadla_register", label: "العنوان", type: "text" },
  { key: "mofadla_reg_subtitle", group: "mofadla_register", label: "الوصف", type: "textarea" },

  // Notes
  { key: "mofadla_notes_badge", group: "mofadla_notes", label: "الشارة", type: "text" },
  { key: "mofadla_notes_title", group: "mofadla_notes", label: "العنوان", type: "text" },
  { key: "mofadla_notes_subtitle", group: "mofadla_notes", label: "الوصف", type: "textarea" },
  { key: "mofadla_notes_list", group: "mofadla_notes", label: "قائمة الملاحظات (سطر لكل ملاحظة)", type: "textarea" },

  // CTA + Contact
  { key: "mofadla_cta_title", group: "mofadla_cta", label: "عنوان الدعوة للتقديم", type: "text" },
  { key: "mofadla_cta_desc", group: "mofadla_cta", label: "وصف الدعوة", type: "textarea" },
  { key: "mofadla_cta_apply_btn", group: "mofadla_cta", label: "نص زر التقديم", type: "text" },
  { key: "mofadla_cta_faq_btn", group: "mofadla_cta", label: "نص زر الأسئلة الشائعة", type: "text" },
  { key: "mofadla_contact_title", group: "mofadla_cta", label: "عنوان بطاقة التواصل", type: "text" },
  { key: "mofadla_contact_phone", group: "mofadla_cta", label: "الهاتف", type: "text" },
  { key: "mofadla_contact_wa", group: "mofadla_cta", label: "واتساب", type: "text" },
  { key: "mofadla_contact_email", group: "mofadla_cta", label: "البريد", type: "text" },
  { key: "mofadla_contact_address", group: "mofadla_cta", label: "العنوان", type: "text" },

  // SEO
  { key: "mofadla_seo_title", group: "mofadla_seo", label: "عنوان SEO", type: "text" },
  { key: "mofadla_seo_desc", group: "mofadla_seo", label: "وصف SEO", type: "textarea" },
];

export default function AdminSiteContent() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeGroup, setActiveGroup] = useState("branding");
  const [addOpen, setAddOpen] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [newType, setNewType] = useState<"text" | "textarea" | "image" | "link">("text");

  const fetchAll = async () => {
    const { data } = await (supabase as any).from("site_content").select("*").order("sort_order");
    const existing = (data as ContentItem[]) || [];
    // Merge defaults: ensure defaults exist as in-memory rows even if not yet in DB
    const byKey = new Map(existing.map((i) => [i.section_key, i]));
    const merged: ContentItem[] = [...existing];
    DEFAULT_KEYS.forEach((d) => {
      if (!byKey.has(d.key)) {
        merged.push({
          id: `__new__${d.key}`,
          section_key: d.key,
          title: d.label,
          content: "",
          image_url: null,
          link_url: null,
          content_type: d.type,
          group_key: d.group,
          label: d.label,
          sort_order: 0,
        });
      } else {
        // Backfill group/label/type for legacy rows
        const r = byKey.get(d.key)!;
        if (!r.group_key || r.group_key === "general") r.group_key = d.group;
        if (!r.label) r.label = d.label;
        if (!r.content_type || r.content_type === "text") r.content_type = d.type;
      }
    });
    setItems(merged);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const updateField = (id: string, patch: Partial<ContentItem>) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  };

  const saveItem = async (it: ContentItem) => {
    const payload = {
      section_key: it.section_key,
      title: it.title,
      content: it.content,
      image_url: it.image_url,
      link_url: it.link_url,
      content_type: it.content_type,
      group_key: it.group_key,
      label: it.label,
      sort_order: it.sort_order,
    };
    if (it.id.startsWith("__new__")) {
      const { data, error } = await (supabase as any).from("site_content").insert(payload).select().single();
      if (error) { toast({ title: "خطأ", description: error.message, variant: "destructive" }); return; }
      setItems((prev) => prev.map((p) => (p.id === it.id ? { ...(data as any) } : p)));
    } else {
      const { error } = await (supabase as any).from("site_content").update(payload).eq("id", it.id);
      if (error) { toast({ title: "خطأ", description: error.message, variant: "destructive" }); return; }
    }
    clearSiteContentCache();
    toast({ title: "تم الحفظ ✅" });
  };

  const deleteItem = async (it: ContentItem) => {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;
    if (!it.id.startsWith("__new__")) {
      await (supabase as any).from("site_content").delete().eq("id", it.id);
    }
    setItems((prev) => prev.filter((p) => p.id !== it.id));
    clearSiteContentCache();
    toast({ title: "تم الحذف" });
  };

  const uploadImage = async (it: ContentItem, file: File) => {
    const ext = file.name.split(".").pop();
    const path = `${it.section_key}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("site-images").upload(path, file, { upsert: true });
    if (error) { toast({ title: "خطأ في الرفع", description: error.message, variant: "destructive" }); return; }
    const { data } = supabase.storage.from("site-images").getPublicUrl(path);
    updateField(it.id, { image_url: data.publicUrl });
    toast({ title: "تم رفع الصورة. اضغط حفظ." });
  };

  const addNewKey = async () => {
    if (!newKey.trim()) { toast({ title: "اكتب مفتاحاً", variant: "destructive" }); return; }
    if (items.some((i) => i.section_key === newKey)) { toast({ title: "المفتاح موجود", variant: "destructive" }); return; }
    const item: ContentItem = {
      id: `__new__${newKey}`,
      section_key: newKey,
      title: newLabel,
      content: "",
      image_url: null,
      link_url: null,
      content_type: newType,
      group_key: activeGroup,
      label: newLabel || newKey,
      sort_order: 0,
    };
    setItems((p) => [...p, item]);
    setNewKey(""); setNewLabel(""); setNewType("text");
    setAddOpen(false);
  };

  if (loading) return <div className="text-center py-12">جاري التحميل...</div>;

  const grouped = items.filter((i) => i.group_key === activeGroup);

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">إدارة محتوى الموقع</h1>
          <p className="text-sm text-muted-foreground mt-1">عدّل النصوص والصور والروابط لكل صفحة. اضغط حفظ بعد كل تغيير.</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus size={16} /> إضافة حقل جديد</Button>
          </DialogTrigger>
          <DialogContent dir="rtl">
            <DialogHeader><DialogTitle>إضافة حقل محتوى</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">المفتاح (إنجليزي، بدون مسافات)</label>
                <Input dir="ltr" value={newKey} onChange={(e) => setNewKey(e.target.value)} placeholder="about_extra" />
              </div>
              <div>
                <label className="text-sm font-medium">التسمية</label>
                <Input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="نص إضافي" />
              </div>
              <div>
                <label className="text-sm font-medium">النوع</label>
                <Select value={newType} onValueChange={(v) => setNewType(v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">نص قصير</SelectItem>
                    <SelectItem value="textarea">نص طويل</SelectItem>
                    <SelectItem value="image">صورة</SelectItem>
                    <SelectItem value="link">رابط</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={addNewKey} className="w-full">إضافة</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeGroup} onValueChange={setActiveGroup} dir="rtl">
        <TabsList className="flex flex-wrap h-auto">
          {GROUPS.map((g) => (
            <TabsTrigger key={g.key} value={g.key}>{g.label}</TabsTrigger>
          ))}
        </TabsList>
        {GROUPS.map((g) => (
          <TabsContent key={g.key} value={g.key} className="space-y-4 mt-4">
            {grouped.length === 0 && g.key === activeGroup && (
              <p className="text-muted-foreground text-center py-8">لا توجد حقول. اضغط "إضافة حقل جديد".</p>
            )}
            {grouped.map((it) => (
              <Card key={it.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>{it.label || it.section_key}</span>
                    <code className="text-xs font-normal text-muted-foreground" dir="ltr">{it.section_key}</code>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(it.content_type === "text") && (
                    <Input value={it.content || ""} onChange={(e) => updateField(it.id, { content: e.target.value })} />
                  )}
                  {(it.content_type === "textarea") && (
                    <Textarea rows={5} value={it.content || ""} onChange={(e) => updateField(it.id, { content: e.target.value })} />
                  )}
                  {(it.content_type === "image") && (
                    <div className="flex items-center gap-3">
                      {it.image_url && <img src={it.image_url} alt="" className="w-20 h-20 object-contain border rounded" />}
                      <div className="flex-1 space-y-2">
                        <Input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadImage(it, e.target.files[0])} />
                        <Input dir="ltr" placeholder="أو الصق رابط الصورة" value={it.image_url || ""} onChange={(e) => updateField(it.id, { image_url: e.target.value })} />
                      </div>
                    </div>
                  )}
                  {(it.content_type === "link") && (
                    <Input dir="ltr" placeholder="https://..." value={it.link_url || ""} onChange={(e) => updateField(it.id, { link_url: e.target.value })} />
                  )}
                  {/* Always allow optional link + image for any type */}
                  {it.content_type !== "image" && it.content_type !== "link" && (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-muted-foreground">حقول إضافية (صورة / رابط)</summary>
                      <div className="space-y-2 mt-2">
                        <div className="flex items-center gap-2">
                          <ImageIcon size={14} />
                          <Input dir="ltr" placeholder="رابط صورة (اختياري)" value={it.image_url || ""} onChange={(e) => updateField(it.id, { image_url: e.target.value })} />
                        </div>
                        <div className="flex items-center gap-2">
                          <LinkIcon size={14} />
                          <Input dir="ltr" placeholder="رابط (اختياري)" value={it.link_url || ""} onChange={(e) => updateField(it.id, { link_url: e.target.value })} />
                        </div>
                      </div>
                    </details>
                  )}
                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={() => deleteItem(it)} className="text-destructive"><Trash2 size={14} /></Button>
                    <Button size="sm" onClick={() => saveItem(it)} className="gap-1"><Save size={14} /> حفظ</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
