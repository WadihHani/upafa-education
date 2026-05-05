import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { TurnstileWidget } from "@/components/TurnstileWidget";
import {
  ArrowLeft,
  ArrowRight,
  ChevronUp,
  ChevronDown,
  GraduationCap,
  CheckCircle2,
  Trash2,
  Plus,
  ClipboardList,
  CircleAlert,
  ShieldCheck,
  MessageCircle,
  Upload,
  ImageIcon,
  Loader2,
} from "lucide-react";

const WHATSAPP_NUMBER_DISPLAY = "+963 989 801 010";
const WHATSAPP_NUMBER_INTL = "963989801010";
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER_INTL}?text=${encodeURIComponent(
  "السلام عليكم، أرغب بالاستفسار عن أقساط ومستلزمات التسجيل في المفاضلة الجامعية.",
)}`;

type Branch = "scientific" | "literary" | "industrial" | "vocational" | "arts" | "sharia";
type ProgramBranch = Branch | "both";
type Program = {
  id: string;
  name: string;
  faculty: string;
  description: string;
  seats: number;
  min_score: number;
  required_branch: ProgramBranch;
  is_open: boolean;
};

const personalSchema = z.object({
  full_name: z.string().trim().min(3, "الاسم مطلوب").max(200),
  national_id: z.string().trim().min(3, "الرقم الوطني مطلوب").max(50),
  exam_number: z.string().trim().max(50).optional().or(z.literal("")),
  birth_date: z.string().optional().or(z.literal("")),
  gender: z.string().max(20).optional().or(z.literal("")),
  phone: z.string().trim().min(6, "الهاتف مطلوب").max(30),
  email: z.string().trim().email("البريد غير صالح").max(255).optional().or(z.literal("")),
  address: z.string().trim().max(500).optional().or(z.literal("")),
  last_certificate: z.string().trim().min(2, "اسم الشهادة مطلوب").max(200),
  graduation_year: z
    .number({ invalid_type_error: "سنة غير صالحة" })
    .int()
    .min(1980)
    .max(new Date().getFullYear() + 1)
    .optional()
    .nullable(),
});

export default function MofadlaApply() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [submitting, setSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  // captcha
  const [turnstileToken, setTurnstileToken] = useState<string>("");
  const [turnstileSiteKey, setTurnstileSiteKey] = useState<string>("");

  useEffect(() => {
    supabase.functions
      .invoke("get-turnstile-config")
      .then(({ data }) => {
        if (data?.siteKey) setTurnstileSiteKey(data.siteKey as string);
      })
      .catch(() => {
        /* ignore — captcha will simply not render */
      });
  }, []);

  // step 1: personal
  const [personal, setPersonal] = useState({
    full_name: "",
    national_id: "",
    exam_number: "",
    birth_date: "",
    gender: "",
    phone: "",
    email: "",
    address: "",
    last_certificate: "",
    graduation_year: "" as string | "",
  });

  // step 2: average grade (branch removed — kept internally for DB compatibility)
  const branch: Branch = "scientific";
  const [average, setAverage] = useState<string>("");
  const averageNum = useMemo(() => parseFloat(average) || 0, [average]);

  // step 3: programs + preferences
  const [programs, setPrograms] = useState<Program[]>([]);
  const [programsLoading, setProgramsLoading] = useState(true);
  const [preferences, setPreferences] = useState<string[]>([]); // ordered program IDs

  useEffect(() => {
    (async () => {
      setProgramsLoading(true);
      const { data, error } = await supabase
        .from("mofadla_programs")
        .select("*")
        .eq("is_open", true)
        .order("sort_order", { ascending: true });
      if (error) {
        toast({ title: "خطأ في تحميل البرامج", description: error.message, variant: "destructive" });
      } else {
        setPrograms(data ?? []);
      }
      setProgramsLoading(false);
    })();
  }, []);

  const eligiblePrograms = useMemo(() => programs, [programs]);

  const [extraNotes, setExtraNotes] = useState("");

  // Payment receipt
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string>("");
  const [uploadingReceipt, setUploadingReceipt] = useState(false);

  const handleReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "نوع الملف غير صالح", description: "يرجى رفع صورة فقط", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "حجم الملف كبير جداً", description: "الحد الأقصى 5 ميغابايت", variant: "destructive" });
      return;
    }
    setReceiptFile(file);
    setReceiptPreview(URL.createObjectURL(file));
  };

  const removeReceipt = () => {
    setReceiptFile(null);
    if (receiptPreview) URL.revokeObjectURL(receiptPreview);
    setReceiptPreview("");
  };

  // ========== validation per step ==========
  const validateStep1 = () => {
    const parsed = personalSchema.safeParse({
      ...personal,
      graduation_year: personal.graduation_year ? parseInt(personal.graduation_year) : null,
    });
    if (!parsed.success) {
      const first = parsed.error.errors[0];
      toast({ title: "بيانات غير مكتملة", description: first.message, variant: "destructive" });
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (average === "" || isNaN(averageNum)) {
      toast({ title: "أدخل المعدل", variant: "destructive" });
      return false;
    }
    if (averageNum < 0 || averageNum > 100) {
      toast({ title: "المعدل يجب أن يكون بين 0 و 100", variant: "destructive" });
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (preferences.length === 0) {
      toast({ title: "اختر برنامجاً واحداً على الأقل", variant: "destructive" });
      return false;
    }
    return true;
  };

  const next = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    if (step === 3 && !validateStep3()) return;
    setStep((s) => (Math.min(4, s + 1) as 1 | 2 | 3 | 4));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const prev = () => {
    setStep((s) => (Math.max(1, s - 1) as 1 | 2 | 3 | 4));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ========== preference helpers ==========
  const addPreference = (id: string) => {
    if (preferences.includes(id)) return;
    setPreferences([...preferences, id]);
  };
  const removePreference = (id: string) =>
    setPreferences(preferences.filter((p) => p !== id));
  const movePref = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= preferences.length) return;
    const next = [...preferences];
    [next[idx], next[target]] = [next[target], next[idx]];
    setPreferences(next);
  };

  // ========== submit ==========
  const submit = async () => {
    if (!validateStep1() || !validateStep2() || !validateStep3()) return;
    if (turnstileSiteKey && !turnstileToken) {
      toast({
        title: "يرجى إكمال التحقق الأمني",
        description: "اضغط على مربع \"أنا لست روبوتاً\" قبل الإرسال",
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);

    // Upload receipt to storage if provided
    let receiptUrl = "";
    if (receiptFile) {
      setUploadingReceipt(true);
      const ext = receiptFile.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("mofadla-receipts")
        .upload(path, receiptFile, {
          contentType: receiptFile.type,
          upsert: false,
        });
      setUploadingReceipt(false);
      if (upErr) {
        setSubmitting(false);
        toast({
          title: "تعذر رفع وصل التحويل",
          description: upErr.message,
          variant: "destructive",
        });
        return;
      }
      const { data: pub } = supabase.storage
        .from("mofadla-receipts")
        .getPublicUrl(path);
      receiptUrl = pub.publicUrl;
    }

    const noteWithReceipt = [
      extraNotes.trim(),
      receiptUrl ? `وصل التحويل: ${receiptUrl}` : "",
    ].filter(Boolean).join("\n");

    const { data, error } = await supabase.functions.invoke(
      "submit-mofadla-application",
      {
        body: {
          personal: {
            full_name: personal.full_name.trim(),
            national_id: personal.national_id.trim(),
            exam_number: personal.exam_number.trim(),
            birth_date: personal.birth_date || null,
            gender: personal.gender,
            phone: personal.phone.trim(),
            email: personal.email.trim(),
            address: personal.address.trim(),
            graduation_year: personal.graduation_year
              ? parseInt(personal.graduation_year)
              : null,
            last_certificate: personal.last_certificate.trim(),
          },
          branch,
          average: averageNum,
          preferences,
          notes: noteWithReceipt,
          payment_receipt_url: receiptUrl,
          turnstileToken,
        },
      },
    );

    if (error || !data?.id) {
      setSubmitting(false);
      setTurnstileToken(""); // captcha tokens are single-use; force re-verify on retry
      toast({
        title: "تعذر إرسال الطلب",
        description: error?.message ?? data?.error ?? "خطأ غير معروف",
        variant: "destructive",
      });
      return;
    }

    const appId = data.id as string;

    setSubmitting(false);
    setSubmittedId(appId);
    setStep(4);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (step === 4 && submittedId) {
    return (
      <div dir="rtl" className="min-h-screen bg-muted/30 flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <CheckCircle2 size={64} className="mx-auto text-accent mb-4" />
            <h2 className="text-2xl font-bold text-primary mb-2">تم إرسال طلبك بنجاح</h2>
            <p className="text-sm text-muted-foreground mb-1">
              رقم الطلب
            </p>
            <p className="text-xs font-mono bg-muted/50 rounded px-2 py-1 inline-block mb-5" dir="ltr">
              {submittedId}
            </p>

            <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 mb-6 text-right">
              <p className="text-sm font-semibold text-primary mb-2">
                ماذا يحدث الآن؟
              </p>
              <ul className="text-xs text-muted-foreground space-y-1.5 leading-relaxed list-disc pr-4">
                <li>سيتم مراجعة بياناتك من قِبَل الإدارة.</li>
                <li>عند قبولك، سيتم التواصل معك مباشرة عبر الهاتف أو البريد الإلكتروني.</li>
                <li>يرجى الاحتفاظ برقم الطلب أعلاه للمتابعة.</li>
              </ul>
            </div>

            <Button onClick={() => navigate("/")} className="w-full">
              العودة إلى الصفحة الرئيسية
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-muted/30">
      <header className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-sm font-bold hover:underline">
            <GraduationCap size={20} className="text-accent" />
            المفاضلة الجامعية
          </Link>
          <Link to="/" className="text-xs text-primary-foreground/80 hover:text-primary-foreground">
            الرئيسية
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-2">
            التقديم على المفاضلة
          </h1>
          <p className="text-sm text-muted-foreground">
            أدخل بياناتك ومعدلك ورتّب رغباتك بدقة. سيتم النظر في طلبك حسب معدلك وترتيب رغباتك.
          </p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-between mb-8 text-xs">
          {[
            { n: 1, label: "البيانات الشخصية" },
            { n: 2, label: "المعدل" },
            { n: 3, label: "ترتيب الرغبات" },
          ].map((s, i, arr) => (
            <div key={s.n} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                    step >= (s.n as 1 | 2 | 3)
                      ? "bg-accent text-accent-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {s.n}
                </div>
                <span
                  className={`text-[10px] sm:text-xs ${
                    step >= (s.n as 1 | 2 | 3) ? "text-primary font-bold" : "text-muted-foreground"
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < arr.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 ${
                    step > (s.n as 1 | 2 | 3) ? "bg-accent" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <Card>
          <CardContent className="p-5 sm:p-7">
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="font-bold text-primary mb-2">البيانات الشخصية</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FieldInput
                    label="الاسم الكامل *"
                    value={personal.full_name}
                    onChange={(v) => setPersonal({ ...personal, full_name: v })}
                    full
                  />
                  <FieldInput
                    label="الرقم الوطني *"
                    value={personal.national_id}
                    onChange={(v) => setPersonal({ ...personal, national_id: v })}
                    ltr
                  />
                  <FieldInput
                    label="رقم الاكتتاب"
                    value={personal.exam_number}
                    onChange={(v) => setPersonal({ ...personal, exam_number: v })}
                    ltr
                  />
                  <div>
                    <label className="text-xs font-medium mb-1 block">تاريخ الميلاد</label>
                    <Input
                      type="date"
                      value={personal.birth_date}
                      onChange={(e) => setPersonal({ ...personal, birth_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block">الجنس</label>
                    <Select
                      value={personal.gender}
                      onValueChange={(v) => setPersonal({ ...personal, gender: v })}
                    >
                      <SelectTrigger><SelectValue placeholder="اختر" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ذكر">ذكر</SelectItem>
                        <SelectItem value="أنثى">أنثى</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <FieldInput
                    label="رقم الهاتف * (مع رمز الدولة، مثال: ‎+963 أو ‎+966)"
                    value={personal.phone}
                    onChange={(v) => setPersonal({ ...personal, phone: v })}
                    ltr
                    placeholder="+963 9XX XXX XXX"
                  />
                  <FieldInput
                    label="البريد الإلكتروني"
                    value={personal.email}
                    onChange={(v) => setPersonal({ ...personal, email: v })}
                    ltr
                    type="email"
                  />
                  <FieldInput
                    label="آخر شهادة حصلت عليها *"
                    value={personal.last_certificate}
                    onChange={(v) => setPersonal({ ...personal, last_certificate: v })}
                    full
                  />
                  <FieldInput
                    label="سنة التخرج"
                    value={personal.graduation_year}
                    onChange={(v) => setPersonal({ ...personal, graduation_year: v })}
                    type="number"
                  />
                  <div className="sm:col-span-2">
                    <label className="text-xs font-medium mb-1 block">العنوان</label>
                    <Textarea
                      rows={2}
                      value={personal.address}
                      onChange={(e) => setPersonal({ ...personal, address: e.target.value })}
                      maxLength={500}
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h2 className="font-bold text-primary">المعدل</h2>

                <div className="bg-muted/30 rounded-md p-4 border border-border">
                  <label className="text-sm font-bold text-primary mb-2 block">
                    معدل الثانوية العامة (أو معدل آخر شهادة)
                  </label>
                  <p className="text-[11px] text-muted-foreground mb-3">
                    أدخل المعدل العام كنسبة مئوية من 100.
                  </p>
                  <div className="flex items-center gap-2 max-w-xs">
                    <Input
                      type="number"
                      placeholder="مثال: 87.5"
                      min={0}
                      max={100}
                      step={0.01}
                      value={average}
                      onChange={(e) => setAverage(e.target.value)}
                      className="text-center text-lg font-bold"
                    />
                    <span className="text-muted-foreground text-sm">/ 100</span>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-accent/10 border border-accent/30 rounded-md px-4 py-3">
                  <span className="text-sm font-bold text-primary">المعدل المُدخل</span>
                  <span className="text-lg font-bold text-accent">
                    {averageNum.toFixed(2)} / 100
                  </span>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <h2 className="font-bold text-primary">ترتيب الرغبات</h2>
                <p className="text-xs text-muted-foreground">
                  اختر البرامج التي تريد التقديم عليها ثم رتّبها حسب الأولوية. سيُقبل الطلب
                  في أعلى رغبة تسمح بها علامتك ومقاعدها متوفرة.
                </p>

                {programsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                  </div>
                ) : eligiblePrograms.length === 0 ? (
                  <div className="bg-muted/40 rounded-md p-6 text-center text-sm text-muted-foreground">
                    لا توجد برامج مفتوحة لفرعك حالياً.
                  </div>
                ) : (
                  <>
                    {/* Selected preferences (ordered) */}
                    {preferences.length > 0 && (
                      <div>
                        <h3 className="text-xs font-bold text-muted-foreground mb-2 uppercase">
                          رغباتك المرتّبة ({preferences.length})
                        </h3>
                        <ol className="space-y-2">
                          {preferences.map((pid, idx) => {
                            const p = programs.find((x) => x.id === pid);
                            if (!p) return null;
                            const eligibleByScore = averageNum >= Number(p.min_score);
                            return (
                              <li
                                key={pid}
                                className="flex items-center gap-2 bg-card border border-border rounded-md p-3"
                              >
                                <span className="w-7 h-7 shrink-0 rounded-full bg-accent text-accent-foreground text-xs font-bold flex items-center justify-center">
                                  {idx + 1}
                                </span>
                                <div className="min-w-0 flex-1">
                                  <div className="text-sm font-bold text-primary">{p.name}</div>
                                  {p.faculty && (
                                    <div className="text-[11px] text-muted-foreground">{p.faculty}</div>
                                  )}
                                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    <Badge variant="outline" className="text-[10px]">
                                      الحد الأدنى: {Number(p.min_score)}
                                    </Badge>
                                    {!eligibleByScore && (
                                      <Badge variant="destructive" className="text-[10px] gap-1">
                                        <CircleAlert size={10} /> علامتك أقل من المطلوب
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <div className="flex flex-col gap-1">
                                  <button
                                    type="button"
                                    onClick={() => movePref(idx, -1)}
                                    disabled={idx === 0}
                                    className="w-7 h-7 rounded border border-border flex items-center justify-center hover:bg-muted disabled:opacity-30"
                                  >
                                    <ChevronUp size={14} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => movePref(idx, 1)}
                                    disabled={idx === preferences.length - 1}
                                    className="w-7 h-7 rounded border border-border flex items-center justify-center hover:bg-muted disabled:opacity-30"
                                  >
                                    <ChevronDown size={14} />
                                  </button>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removePreference(pid)}
                                  className="w-8 h-8 rounded border border-border flex items-center justify-center text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </li>
                            );
                          })}
                        </ol>
                      </div>
                    )}

                    {/* Available programs */}
                    <div>
                      <h3 className="text-xs font-bold text-muted-foreground mb-2 uppercase">
                        البرامج المتاحة
                      </h3>
                      <div className="grid gap-2">
                        {eligiblePrograms
                          .filter((p) => !preferences.includes(p.id))
                          .map((p) => {
                            const eligibleByScore = averageNum >= Number(p.min_score);
                            return (
                              <div
                                key={p.id}
                                className="flex items-center justify-between gap-3 bg-muted/30 border border-border rounded-md p-3"
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="text-sm font-bold text-primary">{p.name}</div>
                                  {p.faculty && (
                                    <div className="text-[11px] text-muted-foreground">{p.faculty}</div>
                                  )}
                                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    <Badge variant="outline" className="text-[10px]">
                                      المقاعد: {p.seats}
                                    </Badge>
                                    <Badge variant="outline" className="text-[10px]">
                                      الحد الأدنى: {Number(p.min_score)}
                                    </Badge>
                                    {!eligibleByScore && (
                                      <Badge variant="destructive" className="text-[10px]">
                                        علامتك أقل
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => addPreference(p.id)}
                                  className="gap-1 shrink-0"
                                >
                                  <Plus size={14} /> إضافة
                                </Button>
                              </div>
                            );
                          })}
                        {eligiblePrograms.filter((p) => !preferences.includes(p.id)).length === 0 && (
                          <div className="text-xs text-muted-foreground text-center py-4">
                            تمت إضافة جميع البرامج المتاحة.
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="text-xs font-medium mb-1 block">ملاحظات إضافية (اختياري)</label>
                  <Textarea
                    rows={2}
                    value={extraNotes}
                    onChange={(e) => setExtraNotes(e.target.value)}
                    maxLength={1000}
                  />
                </div>
              </div>
            )}

            {/* Captcha — shown on the final step only */}
            {step === 3 && turnstileSiteKey && (
              <div className="mt-6 pt-5 border-t border-border">
                <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
                  <ShieldCheck size={14} className="text-accent" />
                  <span>يرجى إكمال التحقق الأمني قبل إرسال الطلب</span>
                </div>
                <TurnstileWidget
                  siteKey={turnstileSiteKey}
                  onVerify={(token) => setTurnstileToken(token)}
                  onExpire={() => setTurnstileToken("")}
                  onError={() => setTurnstileToken("")}
                />
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-7 pt-5 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={prev}
                disabled={step === 1 || submitting}
                className="gap-1"
              >
                <ArrowRight size={14} /> السابق
              </Button>
              {step < 3 ? (
                <Button type="button" onClick={next} className="gap-1">
                  التالي <ArrowLeft size={14} />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={submit}
                  disabled={submitting || (!!turnstileSiteKey && !turnstileToken)}
                  className="gap-1 bg-accent text-accent-foreground hover:brightness-110"
                >
                  <ClipboardList size={14} />
                  {submitting ? "جارٍ الإرسال..." : "إرسال الطلب"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function FieldInput({
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
