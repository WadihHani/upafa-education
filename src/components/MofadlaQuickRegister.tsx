import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { useSiteContent } from "@/hooks/use-site-content";
import {
  ClipboardList,
  Upload,
  Trash2,
  ImageIcon,
  CheckCircle2,
  IdCard,
  FileBadge,
  ReceiptText,
  UserSquare,
  MessageCircle,
} from "lucide-react";

const schema = z.object({
  full_name: z.string().trim().min(3, "الاسم الكامل مطلوب").max(200),
  father_name: z.string().trim().max(100).optional().or(z.literal("")),
  mother_name: z.string().trim().max(100).optional().or(z.literal("")),
  national_id: z.string().trim().min(3, "الرقم الوطني مطلوب").max(50),
  phone: z.string().trim().min(6, "رقم الهاتف مطلوب").max(30),
  email: z.string().trim().email("البريد غير صالح").max(255).optional().or(z.literal("")),
  birth_date: z.string().optional().or(z.literal("")),
  address: z.string().trim().max(500).optional().or(z.literal("")),
  last_certificate: z.string().trim().max(200).optional().or(z.literal("")),
  average: z.string().optional().or(z.literal("")),
  graduation_year: z.string().optional().or(z.literal("")),
});

type DocKey = "personal_photo" | "national_id_doc" | "certificate" | "receipt";

interface DocConfig {
  key: DocKey;
  label: string;
  hint: string;
  Icon: typeof UserSquare;
}

const DOCS: DocConfig[] = [
  {
    key: "personal_photo",
    label: "صورة شخصية حديثة بخلفية بيضاء",
    hint: "صورة واضحة، حديثة، خلفية بيضاء",
    Icon: UserSquare,
  },
  {
    key: "national_id_doc",
    label: "صورة عن الهوية / الرقم الوطني / إخراج قيد",
    hint: "هوية شخصية أو إخراج قيد حديث",
    Icon: IdCard,
  },
  {
    key: "certificate",
    label: "صورة مصدّقة عن آخر شهادة",
    hint: "نسخة مصدّقة من الشهادة الأخيرة",
    Icon: FileBadge,
  },
  {
    key: "receipt",
    label: "إيصال دفع رسوم التسجيل",
    hint: "صورة وصل تحويل / دفع الرسوم",
    Icon: ReceiptText,
  },
];

export default function MofadlaQuickRegister() {
  const { get } = useSiteContent();
  const paymentPhoneRaw = get("mofadla_payment_whatsapp", "+963 989 801 010");
  const paymentPhoneDigits = paymentPhoneRaw.replace(/\D/g, "");
  const paymentWaLink = `https://wa.me/${paymentPhoneDigits}?text=${encodeURIComponent(
    "مرحباً، أرغب بدفع رسوم التسجيل في جامعة UPAFA – فرع سوريا وإرسال إيصال الدفع."
  )}`;

  const [submitting, setSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const [form, setForm] = useState({
    full_name: "",
    father_name: "",
    mother_name: "",
    national_id: "",
    phone: "",
    email: "",
    birth_date: "",
    address: "",
    last_certificate: "",
    average: "",
    graduation_year: "",
  });

  const [files, setFiles] = useState<Record<DocKey, File | null>>({
    personal_photo: null,
    national_id_doc: null,
    certificate: null,
    receipt: null,
  });
  const [previews, setPreviews] = useState<Record<DocKey, string>>({
    personal_photo: "",
    national_id_doc: "",
    certificate: "",
    receipt: "",
  });

  const update = (k: keyof typeof form) => (v: string) =>
    setForm((s) => ({ ...s, [k]: v }));

  const handleFile = (key: DocKey) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      toast({
        title: "نوع الملف غير صالح",
        description: "يرجى رفع صورة أو ملف PDF",
        variant: "destructive",
      });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "حجم الملف كبير جداً",
        description: "الحد الأقصى 5 ميغابايت",
        variant: "destructive",
      });
      return;
    }
    setFiles((s) => ({ ...s, [key]: file }));
    setPreviews((s) => {
      if (s[key]) URL.revokeObjectURL(s[key]);
      return {
        ...s,
        [key]: file.type.startsWith("image/") ? URL.createObjectURL(file) : "",
      };
    });
  };

  const removeFile = (key: DocKey) => {
    setFiles((s) => ({ ...s, [key]: null }));
    setPreviews((s) => {
      if (s[key]) URL.revokeObjectURL(s[key]);
      return { ...s, [key]: "" };
    });
  };

  const uploadFile = async (file: File, prefix: string): Promise<string> => {
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `quick-register/${prefix}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from("mofadla-receipts")
      .upload(path, file, { contentType: file.type, upsert: false });
    if (error) throw new Error(error.message);
    const { data } = supabase.storage.from("mofadla-receipts").getPublicUrl(path);
    return data.publicUrl;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast({
        title: "بيانات غير مكتملة",
        description: parsed.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    // Required documents check
    const missing = DOCS.filter((d) => !files[d.key]);
    if (missing.length > 0) {
      toast({
        title: "مستندات ناقصة",
        description: `يرجى رفع: ${missing.map((m) => m.label).join("، ")}`,
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const urls: Record<DocKey, string> = {
        personal_photo: "",
        national_id_doc: "",
        certificate: "",
        receipt: "",
      };
      for (const d of DOCS) {
        const f = files[d.key];
        if (!f) continue;
        urls[d.key] = await uploadFile(f, d.key);
      }

      const avgNum = form.average ? parseFloat(form.average) : 0;
      const yrNum = form.graduation_year ? parseInt(form.graduation_year) : null;

      const { data, error } = await supabase
        .from("mofadla_quick_registrations")
        .insert({
          full_name: form.full_name.trim(),
          father_name: form.father_name.trim(),
          mother_name: form.mother_name.trim(),
          national_id: form.national_id.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          birth_date: form.birth_date || null,
          address: form.address.trim(),
          last_certificate: form.last_certificate.trim(),
          average: Number.isFinite(avgNum) ? avgNum : 0,
          graduation_year: yrNum && Number.isFinite(yrNum) ? yrNum : null,
          personal_photo_url: urls.personal_photo,
          national_id_url: urls.national_id_doc,
          certificate_url: urls.certificate,
          payment_receipt_url: urls.receipt,
        })
        .select("id")
        .single();

      if (error || !data) throw new Error(error?.message ?? "تعذر حفظ التسجيل");
      setSubmittedId(data.id);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      toast({
        title: "تعذر إرسال التسجيل",
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedId) {
    return (
      <Card className="max-w-2xl mx-auto border-t-4 border-t-accent">
        <CardContent className="p-8 text-center">
          <CheckCircle2 size={56} className="mx-auto text-accent mb-4" />
          <h3 className="text-xl font-extrabold text-primary mb-2">
            تم استلام تسجيلك بنجاح
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            رقم التسجيل
          </p>
          <p className="text-xs font-mono bg-muted/50 rounded px-3 py-1.5 inline-block mb-5" dir="ltr">
            {submittedId}
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            ستقوم إدارة الجامعة بمراجعة بياناتك ومستنداتك والتواصل معك مباشرة.
            يرجى الاحتفاظ برقم التسجيل أعلاه للمتابعة.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={submit} className="max-w-3xl mx-auto">
      <Card className="border-t-4 border-t-accent">
        <CardContent className="p-5 sm:p-7 space-y-6">
          {/* Personal info */}
          <div>
            <h3 className="font-bold text-primary mb-1">البيانات الشخصية</h3>
            <p className="text-xs text-muted-foreground mb-4">
              املأ بياناتك بدقّة كما تظهر في وثائقك الرسمية.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="الاسم الكامل *" value={form.full_name} onChange={update("full_name")} full />
              <Field label="اسم الأب" value={form.father_name} onChange={update("father_name")} />
              <Field label="اسم الأم" value={form.mother_name} onChange={update("mother_name")} />
              <Field label="الرقم الوطني *" value={form.national_id} onChange={update("national_id")} ltr />
              <Field
                label="رقم الهاتف *"
                value={form.phone}
                onChange={update("phone")}
                ltr
                placeholder="+963 9XX XXX XXX"
              />
              <Field label="البريد الإلكتروني" value={form.email} onChange={update("email")} ltr type="email" />
              <div>
                <label className="text-xs font-medium mb-1 block">تاريخ الميلاد</label>
                <Input
                  type="date"
                  value={form.birth_date}
                  onChange={(e) => update("birth_date")(e.target.value)}
                />
              </div>
              <Field label="آخر شهادة" value={form.last_certificate} onChange={update("last_certificate")} />
              <Field
                label="المعدل / العلامة"
                value={form.average}
                onChange={update("average")}
                type="number"
                placeholder="مثال: 87.5"
              />
              <Field
                label="سنة التخرج"
                value={form.graduation_year}
                onChange={update("graduation_year")}
                type="number"
              />
              <div className="sm:col-span-2">
                <label className="text-xs font-medium mb-1 block">العنوان</label>
                <Textarea
                  rows={2}
                  value={form.address}
                  maxLength={500}
                  onChange={(e) => update("address")(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="border-t border-border pt-6">
            <h3 className="font-bold text-primary mb-1">المستندات المطلوبة</h3>
            <p className="text-xs text-muted-foreground mb-4">
              ارفع نسخة واضحة من كل مستند (صورة JPG / PNG أو PDF، حتى 5 ميغابايت).
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DOCS.map((d) => (
                <DocUpload
                  key={d.key}
                  doc={d}
                  file={files[d.key]}
                  preview={previews[d.key]}
                  onChange={handleFile(d.key)}
                  onRemove={() => removeFile(d.key)}
                />
              ))}
            </div>
          </div>

          <div className="border-t border-border pt-5">
            <Button
              type="submit"
              disabled={submitting}
              size="lg"
              className="w-full sm:w-auto bg-accent text-accent-foreground hover:brightness-110 font-bold gap-2"
            >
              <ClipboardList size={18} />
              {submitting ? "جارٍ إرسال التسجيل..." : "إرسال التسجيل"}
            </Button>
            <p className="text-[11px] text-muted-foreground mt-3 leading-relaxed">
              بإرسالك هذا النموذج فإنك توافق على مراجعة بياناتك من قِبَل إدارة
              الجامعة، وسيتم التواصل معك للمتابعة.
            </p>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  ltr,
  full,
  type,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  ltr?: boolean;
  full?: boolean;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label className="text-xs font-medium mb-1 block">{label}</label>
      <Input
        type={type ?? "text"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        dir={ltr ? "ltr" : undefined}
        placeholder={placeholder}
      />
    </div>
  );
}

function DocUpload({
  doc,
  file,
  preview,
  onChange,
  onRemove,
}: {
  doc: DocConfig;
  file: File | null;
  preview: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}) {
  const inputId = `doc-${doc.key}`;
  if (file) {
    return (
      <div className="rounded-md border border-accent/40 bg-accent/5 overflow-hidden">
        {preview ? (
          <img
            src={preview}
            alt={doc.label}
            className="w-full h-32 object-contain bg-muted/30"
          />
        ) : (
          <div className="h-32 flex items-center justify-center bg-muted/30 text-muted-foreground text-xs gap-2">
            <ImageIcon size={16} />
            ملف PDF مرفق
          </div>
        )}
        <div className="flex items-center justify-between p-2 border-t border-border bg-card">
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-primary truncate">{doc.label}</div>
            <div className="text-[10px] text-muted-foreground truncate">{file.name}</div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 gap-1"
          >
            <Trash2 size={12} />
            إزالة
          </Button>
        </div>
      </div>
    );
  }
  return (
    <label
      htmlFor={inputId}
      className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border hover:border-accent hover:bg-accent/5 rounded-md p-5 cursor-pointer transition-colors text-center min-h-[164px]"
    >
      <div className="w-10 h-10 rounded-full bg-accent/15 text-accent flex items-center justify-center">
        <doc.Icon size={18} />
      </div>
      <span className="text-xs font-bold text-primary leading-tight">{doc.label}</span>
      <span className="text-[10px] text-muted-foreground leading-tight flex items-center gap-1">
        <Upload size={10} />
        {doc.hint}
      </span>
      <input
        id={inputId}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={onChange}
      />
    </label>
  );
}
