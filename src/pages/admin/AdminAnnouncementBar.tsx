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
const DEFAULT_SPEED = 80; // pixels per second

type AnnouncementRow = {
  id: string;
  content: string | null;
  is_hidden: boolean;
};

export default function AdminAnnouncementBar() {
  const [row, setRow] = useState<AnnouncementRow | null>(null);
  const [speedRow, setSpeedRow] = useState<AnnouncementRow | null>(null);
  const [text, setText] = useState(DEFAULT_TEXT);
  const [speed, setSpeed] = useState<number>(DEFAULT_SPEED);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await (supabase as any)
        .from("site_content")
        .select("id, section_key, content, is_hidden")
        .in("section_key", ["announcement_bar", "announcement_bar_speed"]);

      if (data) {
        const t = data.find((d: any) => d.section_key === "announcement_bar");
        const s = data.find((d: any) => d.section_key === "announcement_bar_speed");
        if (t) { setRow(t); setText(t.content || DEFAULT_TEXT); }
        if (s) {
          setSpeedRow(s);
          const parsed = parseInt(s.content || "", 10);
          if (Number.isFinite(parsed) && parsed > 0) setSpeed(parsed);
        }
      }
      setLoading(false);
    };
    load();
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