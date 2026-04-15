import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Save, Upload } from "lucide-react";
import { clearSiteContentCache } from "@/hooks/use-site-content";

type ContentItem = {
  id: string;
  section_key: string;
  title: string | null;
  content: string | null;
};

const sections = [
  { key: "university_name", label: "اسم الجامعة", multiline: false },
  { key: "hero_subtitle", label: "العنوان الفرعي (الهيرو)", multiline: false },
  { key: "about_intro", label: "نص عن الجامعة", multiline: true },
  { key: "about_vision", label: "رؤيتنا", multiline: true },
  { key: "about_mission", label: "رسالتنا", multiline: true },
  { key: "about_values", label: "قيمنا (مفصولة بفاصلة)", multiline: false },
  { key: "publications_text", label: "نص المنشورات", multiline: true },
  { key: "payment_text", label: "نص الدفع الإلكتروني", multiline: true },
  { key: "contact_address", label: "عنوان التواصل", multiline: false },
  { key: "contact_phone", label: "رقم الهاتف", multiline: false },
  { key: "contact_email", label: "البريد الإلكتروني", multiline: false },
  { key: "contact_hours", label: "ساعات العمل", multiline: false },
  { key: "footer_about", label: "نص الفوتر", multiline: true },
  { key: "team_intro", label: "مقدمة صفحة الفريق", multiline: true },
  { key: "team_commitment", label: "نص الالتزام (الفريق)", multiline: true },
];

export default function AdminSiteContent() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<Record<string, { title: string; content: string }>>({});
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("site_content").select("*");
      setItems((data as ContentItem[]) || []);
      const fd: Record<string, { title: string; content: string }> = {};
      (data || []).forEach((item: any) => {
        fd[item.section_key] = { title: item.title || "", content: item.content || "" };
      });
      // Ensure all sections exist in form
      sections.forEach((s) => {
        if (!fd[s.key]) fd[s.key] = { title: s.label, content: "" };
      });
      setFormData(fd);

      // Check for logo
      const logoContent = (data || []).find((d: any) => d.section_key === "logo_url");
      if (logoContent) setLogoUrl((logoContent as any).content);

      setLoading(false);
    };
    fetch();
  }, []);

  const handleSaveAll = async () => {
    setSaving(true);
    for (const section of sections) {
      const fd = formData[section.key];
      if (!fd) continue;
      const existing = items.find((i) => i.section_key === section.key);
      if (existing) {
        await supabase.from("site_content").update({ title: fd.title, content: fd.content }).eq("id", existing.id);
      } else {
        await supabase.from("site_content").insert({ section_key: section.key, title: fd.title, content: fd.content });
      }
    }
    clearSiteContentCache();
    toast({ title: "تم حفظ جميع المحتوى بنجاح ✅" });
    setSaving(false);
  };

  const handleLogoUpload = async () => {
    if (!logoFile) return;
    const ext = logoFile.name.split(".").pop();
    const path = `logo.${ext}`;
    const { error } = await supabase.storage.from("site-images").upload(path, logoFile, { upsert: true });
    if (error) { toast({ title: "خطأ في رفع الشعار", description: error.message, variant: "destructive" }); return; }
    const { data: urlData } = supabase.storage.from("site-images").getPublicUrl(path);
    const url = urlData.publicUrl;
    setLogoUrl(url);

    // Save logo URL to site_content
    const existing = items.find((i) => i.section_key === "logo_url");
    if (existing) {
      await supabase.from("site_content").update({ content: url }).eq("id", existing.id);
    } else {
      await supabase.from("site_content").insert({ section_key: "logo_url", title: "الشعار", content: url });
    }
    clearSiteContentCache();
    toast({ title: "تم رفع الشعار بنجاح" });
    setLogoFile(null);
  };

  if (loading) return <div className="text-center py-12">جاري التحميل...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">إدارة محتوى الموقع</h1>
        <Button onClick={handleSaveAll} disabled={saving} className="gap-2">
          <Save size={16} />
          {saving ? "جاري الحفظ..." : "حفظ جميع التغييرات"}
        </Button>
      </div>

      {/* Logo Upload */}
      <Card className="mb-6">
        <CardHeader><CardTitle className="text-lg">شعار الجامعة</CardTitle></CardHeader>
        <CardContent className="flex items-center gap-4">
          {logoUrl && <img src={logoUrl} alt="الشعار" className="w-20 h-20 object-contain" />}
          <div className="flex-1">
            <Input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} />
          </div>
          <Button onClick={handleLogoUpload} disabled={!logoFile} variant="outline" className="gap-2">
            <Upload size={14} /> رفع
          </Button>
        </CardContent>
      </Card>

      {/* Content Sections */}
      <div className="grid gap-4">
        {sections.map((section) => {
          const fd = formData[section.key] || { title: "", content: "" };
          return (
            <Card key={section.key}>
              <CardContent className="p-4">
                <label className="text-sm font-bold text-primary mb-2 block">{section.label}</label>
                {section.multiline ? (
                  <Textarea
                    value={fd.content}
                    onChange={(e) => setFormData({ ...formData, [section.key]: { ...fd, content: e.target.value } })}
                    rows={4}
                    className="text-sm"
                  />
                ) : (
                  <Input
                    value={fd.content}
                    onChange={(e) => setFormData({ ...formData, [section.key]: { ...fd, content: e.target.value } })}
                    className="text-sm"
                    dir={section.key === "contact_phone" || section.key === "contact_email" ? "ltr" : "rtl"}
                  />
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-6">
        <Button onClick={handleSaveAll} disabled={saving} className="w-full gap-2">
          <Save size={16} />
          {saving ? "جاري الحفظ..." : "حفظ جميع التغييرات"}
        </Button>
      </div>
    </div>
  );
}
