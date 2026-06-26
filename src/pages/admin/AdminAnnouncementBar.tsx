import { useEffect, useState } from "react";
import { Megaphone, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { clearSiteContentCache } from "@/hooks/use-site-content";
import AnnouncementBar from "@/components/AnnouncementBar";

const DEFAULT_TEXT = "أهلًا وسهلًا بك في جامعة أفريقيا الفرنسية العربية الافتراضية";

type AnnouncementRow = {
  id: string;
  content: string | null;
  is_hidden: boolean;
};

export default function AdminAnnouncementBar() {
  const [row, setRow] = useState<AnnouncementRow | null>(null);
  const [text, setText] = useState(DEFAULT_TEXT);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnnouncement = async () => {
      const { data, error } = await (supabase as any)
        .from("site_content")
        .select("id, content, is_hidden")
        .eq("section_key", "announcement_bar")
        .maybeSingle();

      if (error) {
        toast({ title: "تعذر تحميل شريط الأخبار", description: error.message, variant: "destructive" });
      }

      if (data) {
        setRow(data as AnnouncementRow);
        setText((data as AnnouncementRow).content || DEFAULT_TEXT);
      }

      setLoading(false);
    };

    loadAnnouncement();
  }, []);

  const save = async () => {
    const value = text.trim() || DEFAULT_TEXT;
    setSaving(true);

    const payload = {
      section_key: "announcement_bar",
      title: "شريط الأخبار المتحرك",
      content: value,
      content_type: "text",
      group_key: "general",
      label: "شريط الأخبار المتحرك (الأعلى)",
      sort_order: 0,
      is_hidden: false,
    };

    const request = row
      ? (supabase as any).from("site_content").update(payload).eq("id", row.id).select("id, content, is_hidden").single()
      : (supabase as any).from("site_content").insert(payload).select("id, content, is_hidden").single();

    const { data, error } = await request;
    setSaving(false);

    if (error) {
      toast({ title: "لم يتم الحفظ", description: error.message, variant: "destructive" });
      return;
    }

    setRow(data as AnnouncementRow);
    setText((data as AnnouncementRow).content || value);
    clearSiteContentCache();
    toast({ title: "تم حفظ شريط الأخبار وظهوره في الموقع ✅" });
  };

  if (loading) return <div className="text-center py-12">جاري التحميل...</div>;

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Megaphone size={24} />
          شريط الأخبار المتحرك
        </h1>
        <p className="text-sm text-muted-foreground mt-1">اكتب الخبر هنا واحفظه ليظهر أعلى الموقع مباشرة.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">النص الظاهر في الشريط</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            rows={4}
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder={DEFAULT_TEXT}
            className="text-base leading-8"
          />
          <Button onClick={save} disabled={saving} className="gap-2">
            <Save size={16} />
            {saving ? "جاري الحفظ..." : "حفظ وإظهار الشريط"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">معاينة مباشرة</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-hidden rounded-b-lg">
          <AnnouncementBar />
        </CardContent>
      </Card>
    </div>
  );
}