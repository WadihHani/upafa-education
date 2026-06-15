import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSiteContent, clearSiteContentCache } from "@/hooks/use-site-content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import {
  Monitor,
  Smartphone,
  Save,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronLeft,
  Image as ImageIcon,
  Palette,
  Layers,
  Loader2,
  Upload,
  Copy,
  Trash2,
} from "lucide-react";

/* ============================================================
   PAGE / SECTION DEFINITIONS
   ============================================================ */
type FieldType = "title" | "content" | "image_url" | "link_url";
interface Field {
  key: FieldType;
  label: string;
  multiline?: boolean;
}
interface SectionDef {
  /** site_content key for the toggle row (section_xxx) */
  sectionKey: string;
  label: string;
  /** the content keys with fields that live in this section */
  blocks: { contentKey: string; label: string; fields: Field[] }[];
}
interface PageDef {
  path: string;
  label: string;
  sections: SectionDef[];
}

const PAGES: PageDef[] = [
  {
    path: "/",
    label: "الصفحة الرئيسية",
    sections: [
      {
        sectionKey: "section_hero",
        label: "Hero — البانر العلوي",
        blocks: [],
      },
      {
        sectionKey: "section_home_intro",
        label: "المقدمة التعريفية",
        blocks: [
          {
            contentKey: "home_intro_h1",
            label: "العنوان الرئيسي",
            fields: [
              { key: "title", label: "السطر الأول" },
              { key: "content", label: "السطر الثاني" },
            ],
          },
          {
            contentKey: "home_intro_p1",
            label: "الفقرة الأولى",
            fields: [{ key: "content", label: "النص", multiline: true }],
          },
          {
            contentKey: "home_intro_p2",
            label: "الفقرة الثانية",
            fields: [{ key: "content", label: "النص", multiline: true }],
          },
        ],
      },
      { sectionKey: "section_announcements", label: "أهم الإعلانات", blocks: [] },
      {
        sectionKey: "section_systems",
        label: "أنظمة وخدمات الجامعة",
        blocks: [
          {
            contentKey: "systems_title",
            label: "عنوان القسم",
            fields: [{ key: "content", label: "النص" }],
          },
        ],
      },
      {
        sectionKey: "section_vision",
        label: "الرؤية والرسالة والقيم",
        blocks: [
          {
            contentKey: "about_vision",
            label: "بطاقة الرؤية",
            fields: [
              { key: "title", label: "العنوان" },
              { key: "content", label: "النص", multiline: true },
            ],
          },
          {
            contentKey: "about_mission",
            label: "بطاقة الرسالة",
            fields: [
              { key: "title", label: "العنوان" },
              { key: "content", label: "النص", multiline: true },
            ],
          },
          {
            contentKey: "about_values",
            label: "بطاقة القيم",
            fields: [
              { key: "title", label: "العنوان" },
              { key: "content", label: "النص", multiline: true },
            ],
          },
        ],
      },
    ],
  },
  {
    path: "/about",
    label: "من نحن",
    sections: [
      {
        sectionKey: "section_about",
        label: "محتوى صفحة من نحن",
        blocks: [
          {
            contentKey: "about_intro",
            label: "مقدمة",
            fields: [
              { key: "title", label: "العنوان" },
              { key: "content", label: "النص", multiline: true },
            ],
          },
        ],
      },
    ],
  },
  {
    path: "/contact",
    label: "اتصل بنا",
    sections: [
      {
        sectionKey: "section_contact",
        label: "بيانات التواصل",
        blocks: [
          {
            contentKey: "contact_phone",
            label: "الهاتف",
            fields: [{ key: "content", label: "الرقم" }],
          },
          {
            contentKey: "contact_email",
            label: "البريد",
            fields: [{ key: "content", label: "البريد الإلكتروني" }],
          },
          {
            contentKey: "contact_address",
            label: "العنوان",
            fields: [{ key: "content", label: "النص", multiline: true }],
          },
        ],
      },
    ],
  },
  {
    path: "/mofadla",
    label: "المفاضلة",
    sections: [
      {
        sectionKey: "section_mofadla_hero",
        label: "بانر المفاضلة",
        blocks: [
          {
            contentKey: "mofadla_hero",
            label: "العنوان والوصف",
            fields: [
              { key: "title", label: "العنوان" },
              { key: "content", label: "الوصف", multiline: true },
            ],
          },
        ],
      },
    ],
  },
];

/* ============================================================
   COMPONENT
   ============================================================ */
type PendingMap = Record<
  string,
  { title?: string; content?: string; image_url?: string; link_url?: string; is_hidden?: boolean }
>;

export default function AdminThemeEditor() {
  const { data } = useSiteContent();
  const [pageIdx, setPageIdx] = useState(0);
  const [tab, setTab] = useState<"sections" | "colors" | "media">("sections");
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [pending, setPending] = useState<PendingMap>({});
  const [saving, setSaving] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const page = PAGES[pageIdx];
  const previewUrl = `${page.path}?themePreview=1`;

  const eff = (key: string, field: keyof PendingMap[string], fallback: any = "") => {
    const p = pending[key]?.[field];
    if (p !== undefined) return p as any;
    return (data[key] as any)?.[field] ?? fallback;
  };

  const setField = (
    key: string,
    field: keyof PendingMap[string],
    value: string | boolean
  ) => {
    setPending((prev) => ({ ...prev, [key]: { ...(prev[key] || {}), [field]: value as any } }));
  };

  const hasChanges = Object.keys(pending).length > 0;

  const save = async () => {
    setSaving(true);
    try {
      const rows = Object.entries(pending).map(([section_key, fields]) => {
        const existing = (data[section_key] || {}) as any;
        return {
          section_key,
          title: fields.title ?? existing.title ?? null,
          content: fields.content ?? existing.content ?? null,
          image_url: fields.image_url ?? existing.image_url ?? null,
          link_url: fields.link_url ?? existing.link_url ?? null,
          is_hidden: fields.is_hidden ?? existing.is_hidden ?? false,
        };
      });
      if (rows.length) {
        const { error } = await (supabase as any)
          .from("site_content")
          .upsert(rows, { onConflict: "section_key" });
        if (error) throw error;
      }
      clearSiteContentCache();
      setPending({});
      toast({ title: "تم الحفظ والنشر", description: `${rows.length} عنصر` });
      // Refresh iframe
      iframeRef.current?.contentWindow?.postMessage({ type: "theme:reload" }, "*");
    } catch (e: any) {
      toast({ title: "فشل الحفظ", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background" dir="rtl">
      {/* Top bar */}
      <div className="border-b bg-card flex items-center justify-between px-4 py-2 gap-3">
        <div className="flex items-center gap-3">
          <h1 className="font-bold text-lg">🎨 محرر الثيم</h1>
          <a href="/admin" className="text-xs text-muted-foreground hover:text-foreground">
            ← لوحة الإدارة
          </a>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-muted rounded-md p-0.5 flex">
            <button
              onClick={() => setDevice("desktop")}
              className={`px-3 py-1.5 rounded text-xs flex items-center gap-1 ${device === "desktop" ? "bg-card shadow" : ""}`}
            >
              <Monitor size={14} /> ديسكتوب
            </button>
            <button
              onClick={() => setDevice("mobile")}
              className={`px-3 py-1.5 rounded text-xs flex items-center gap-1 ${device === "mobile" ? "bg-card shadow" : ""}`}
            >
              <Smartphone size={14} /> جوال
            </button>
          </div>
          {hasChanges && (
            <span className="text-xs bg-amber-100 text-amber-900 px-2 py-1 rounded font-bold">
              {Object.keys(pending).length} تغيير غير محفوظ
            </span>
          )}
          <Button onClick={save} disabled={!hasChanges || saving} className="gap-1">
            {saving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
            حفظ ونشر
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-[360px] border-l bg-card overflow-y-auto flex flex-col">
          {/* Tabs */}
          <div className="border-b grid grid-cols-3">
            {[
              { id: "sections", icon: Layers, label: "الأقسام" },
              { id: "colors", icon: Palette, label: "الألوان" },
              { id: "media", icon: ImageIcon, label: "الصور" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id as any)}
                className={`py-3 text-xs font-bold flex flex-col items-center gap-1 border-b-2 ${
                  tab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground"
                }`}
              >
                <t.icon size={16} /> {t.label}
              </button>
            ))}
          </div>

          {tab === "sections" && (
            <div className="p-3 space-y-3">
              <div>
                <label className="text-xs font-bold block mb-1">الصفحة</label>
                <select
                  value={pageIdx}
                  onChange={(e) => setPageIdx(Number(e.target.value))}
                  className="w-full border rounded-md px-2 py-2 bg-background text-sm"
                >
                  {PAGES.map((p, i) => (
                    <option key={p.path} value={i}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                {page.sections.map((s) => (
                  <SectionRow
                    key={s.sectionKey}
                    def={s}
                    hidden={!!eff(s.sectionKey, "is_hidden", false)}
                    onToggleHidden={(v) => setField(s.sectionKey, "is_hidden", v)}
                    valueOf={(k, f) => eff(k, f, "")}
                    onChange={(k, f, v) => setField(k, f, v)}
                  />
                ))}
              </div>
            </div>
          )}

          {tab === "colors" && (
            <ColorsPanel
              data={data}
              pending={pending}
              setField={setField}
              iframe={iframeRef.current}
            />
          )}

          {tab === "media" && <MediaLibrary />}
        </aside>

        {/* Preview */}
        <div className="flex-1 bg-muted/30 flex items-center justify-center p-4 overflow-hidden">
          <div
            className="bg-card shadow-2xl rounded-md overflow-hidden transition-all"
            style={{
              width: device === "mobile" ? 390 : "100%",
              height: "100%",
              maxWidth: device === "mobile" ? 390 : 1400,
            }}
          >
            <iframe
              ref={iframeRef}
              src={previewUrl}
              title="معاينة الموقع"
              className="w-full h-full border-0"
              key={page.path}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   SECTION ROW
   ============================================================ */
function SectionRow({
  def,
  hidden,
  onToggleHidden,
  valueOf,
  onChange,
}: {
  def: SectionDef;
  hidden: boolean;
  onToggleHidden: (v: boolean) => void;
  valueOf: (k: string, f: keyof PendingMap[string]) => any;
  onChange: (k: string, f: keyof PendingMap[string], v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border rounded-md ${hidden ? "bg-muted/40" : "bg-background"}`}>
      <div className="flex items-center justify-between p-2">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 text-sm font-bold flex-1 text-right"
        >
          {open ? <ChevronDown size={14} /> : <ChevronLeft size={14} />}
          <span className={hidden ? "line-through text-muted-foreground" : ""}>{def.label}</span>
        </button>
        <button
          onClick={() => onToggleHidden(!hidden)}
          className="p-1.5 hover:bg-muted rounded"
          title={hidden ? "إظهار" : "إخفاء"}
        >
          {hidden ? <EyeOff size={16} className="text-muted-foreground" /> : <Eye size={16} />}
        </button>
      </div>
      {open && def.blocks.length > 0 && (
        <div className="p-3 pt-0 space-y-3 border-t">
          {def.blocks.map((b) => (
            <div key={b.contentKey} className="space-y-2">
              <div className="text-xs font-bold text-muted-foreground">{b.label}</div>
              {b.fields.map((f) => {
                const val = (valueOf(b.contentKey, f.key) as string) || "";
                return f.multiline ? (
                  <Textarea
                    key={f.key}
                    value={val}
                    rows={3}
                    placeholder={f.label}
                    onChange={(e) => onChange(b.contentKey, f.key, e.target.value)}
                  />
                ) : (
                  <Input
                    key={f.key}
                    value={val}
                    placeholder={f.label}
                    onChange={(e) => onChange(b.contentKey, f.key, e.target.value)}
                  />
                );
              })}
            </div>
          ))}
        </div>
      )}
      {open && def.blocks.length === 0 && (
        <div className="p-3 pt-0 text-xs text-muted-foreground border-t">
          هذا القسم لا يحتوي حقول قابلة للتعديل من هنا. استخدم زر الإخفاء للتحكم بظهوره.
        </div>
      )}
    </div>
  );
}

/* ============================================================
   COLORS PANEL
   ============================================================ */
function ColorsPanel({
  data,
  pending,
  setField,
  iframe,
}: {
  data: any;
  pending: PendingMap;
  setField: (k: string, f: keyof PendingMap[string], v: string) => void;
  iframe: HTMLIFrameElement | null;
}) {
  const currentRaw = pending["theme_colors"]?.content ?? data["theme_colors"]?.content ?? "{}";
  let parsed: { primary?: string; accent?: string } = {};
  try {
    parsed = JSON.parse(currentRaw);
  } catch {}

  const [primary, setPrimary] = useState(parsed.primary || "215 65% 35%");
  const [accent, setAccent] = useState(parsed.accent || "43 90% 52%");

  const apply = (p: string, a: string) => {
    setField("theme_colors", "content", JSON.stringify({ primary: p, accent: a }));
    iframe?.contentWindow?.postMessage({ type: "theme:colors", primary: p, accent: a }, "*");
  };

  // hsl picker via 3 sliders is overkill; expose hex picker that converts to HSL
  const hslToHex = (h: number, s: number, l: number) => {
    s /= 100; l /= 100;
    const k = (n: number) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    const toHex = (x: number) => Math.round(255 * x).toString(16).padStart(2, "0");
    return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
  };
  const hexToHsl = (hex: string) => {
    const m = hex.replace("#", "");
    const r = parseInt(m.slice(0, 2), 16) / 255;
    const g = parseInt(m.slice(2, 4), 16) / 255;
    const b = parseInt(m.slice(4, 6), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s, l = (max + min) / 2;
    if (max === min) { h = 0; s = 0; }
    else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  };
  const hslStrToHex = (str: string) => {
    const m = str.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
    if (!m) return "#000000";
    return hslToHex(+m[1], +m[2], +m[3]);
  };

  return (
    <div className="p-4 space-y-5">
      <div>
        <label className="text-xs font-bold block mb-2">اللون الأساسي (Primary)</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={hslStrToHex(primary)}
            onChange={(e) => {
              const hsl = hexToHsl(e.target.value);
              setPrimary(hsl);
              apply(hsl, accent);
            }}
            className="w-12 h-10 rounded border"
          />
          <Input value={primary} onChange={(e) => { setPrimary(e.target.value); apply(e.target.value, accent); }} dir="ltr" />
        </div>
      </div>
      <div>
        <label className="text-xs font-bold block mb-2">اللون المميّز (Accent)</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={hslStrToHex(accent)}
            onChange={(e) => {
              const hsl = hexToHsl(e.target.value);
              setAccent(hsl);
              apply(primary, hsl);
            }}
            className="w-12 h-10 rounded border"
          />
          <Input value={accent} onChange={(e) => { setAccent(e.target.value); apply(primary, e.target.value); }} dir="ltr" />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        التغيير يظهر فوراً في المعاينة. اضغط "حفظ ونشر" بالأعلى لتثبيت الألوان لكل الزوار.
      </p>
    </div>
  );
}

/* ============================================================
   MEDIA LIBRARY
   ============================================================ */
function MediaLibrary() {
  const [files, setFiles] = useState<{ name: string; url: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data: list } = await supabase.storage.from("site-images").list("", {
      limit: 200,
      sortBy: { column: "created_at", order: "desc" },
    });
    const items = (list || [])
      .filter((f) => f.name && !f.name.startsWith("."))
      .map((f) => ({
        name: f.name,
        url: supabase.storage.from("site-images").getPublicUrl(f.name).data.publicUrl,
      }));
    setFiles(items);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
    const { error } = await supabase.storage.from("site-images").upload(path, file);
    setUploading(false);
    if (error) toast({ title: "فشل الرفع", description: error.message, variant: "destructive" });
    else { toast({ title: "تم الرفع" }); load(); }
  };

  const handleDelete = async (name: string) => {
    if (!confirm(`حذف ${name}؟`)) return;
    await supabase.storage.from("site-images").remove([name]);
    load();
  };

  return (
    <div className="p-3 space-y-3">
      <label className="flex items-center justify-center gap-2 border-2 border-dashed rounded-md p-4 cursor-pointer hover:bg-muted text-sm">
        {uploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
        رفع صورة جديدة
        <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
      </label>
      {loading ? (
        <div className="text-center text-muted-foreground text-sm py-4">جاري التحميل...</div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {files.map((f) => (
            <div key={f.name} className="border rounded overflow-hidden group relative">
              <img src={f.url} alt={f.name} className="w-full h-24 object-cover" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 transition">
                <button
                  onClick={() => { navigator.clipboard.writeText(f.url); toast({ title: "تم نسخ الرابط" }); }}
                  className="text-white text-xs flex items-center gap-1 bg-primary px-2 py-1 rounded"
                >
                  <Copy size={12} /> نسخ الرابط
                </button>
                <button
                  onClick={() => handleDelete(f.name)}
                  className="text-white text-xs flex items-center gap-1 bg-destructive px-2 py-1 rounded"
                >
                  <Trash2 size={12} /> حذف
                </button>
              </div>
              <div className="text-[10px] truncate px-1 py-0.5 bg-muted">{f.name}</div>
            </div>
          ))}
          {files.length === 0 && (
            <div className="col-span-2 text-center text-muted-foreground text-xs py-4">
              لا توجد صور بعد
            </div>
          )}
        </div>
      )}
    </div>
  );
}
