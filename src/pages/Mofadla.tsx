import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import MofadlaQuickRegister from "@/components/MofadlaQuickRegister";
import Seo from "@/components/Seo";
import { useSiteContent } from "@/hooks/use-site-content";
import {
  GraduationCap,
  CalendarDays,
  FileCheck2,
  ClipboardList,
  CheckCircle2,
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
  BookOpen,
  ScrollText,
  MessageCircle,
  Download,
  FileText,
  UserPlus,
} from "lucide-react";

// Helper: parse multi-line text where each line is one item, fields split by '|'
const parseLines = (txt: string) =>
  txt
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => l.split("|").map((f) => f.trim()));

type Program = {
  id: string;
  name: string;
  faculty: string;
  seats: number;
  min_score: number;
  required_branch: "scientific" | "literary" | "both" | "industrial" | "vocational" | "arts" | "sharia";
};

const branchLabel = (b: Program["required_branch"]) =>
  b === "scientific" ? "علمي"
  : b === "literary" ? "أدبي"
  : b === "industrial" ? "صناعي"
  : b === "vocational" ? "مهني"
  : b === "arts" ? "فني"
  : b === "sharia" ? "شرعي"
  : "علمي + أدبي";

export default function Mofadla() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const { get } = useSiteContent();

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("mofadla_programs")
        .select("id,name,faculty,seats,min_score,required_branch")
        .eq("is_open", true)
        .order("sort_order", { ascending: true });
      setPrograms((data as Program[]) ?? []);
      setLoading(false);
    })();
  }, []);

  // Editable defaults
  const heroBadge = get("mofadla_hero_badge", "مفاضلة صيف 2026");
  const heroTitle = get("mofadla_hero_title", "التقديم على المفاضلة الجامعية");
  const heroDesc = get(
    "mofadla_hero_desc",
    "فُتح باب التقديم على مفاضلة صيف 2026 في جامعة UPAFA – فرع سوريا. أكمل طلبك إلكترونياً خلال دقائق، اختر الكلية والاختصاص المناسبين لك، وثبّت مقعدك الجامعي."
  );
  const ctaApply = get("mofadla_cta_apply", "قدّم الآن");
  const ctaRegister = get("mofadla_cta_register", "تثبيت التسجيل");
  const ctaPrograms = get("mofadla_cta_programs", "عرض البرامج المتاحة");
  const stats = parseLines(
    get(
      "mofadla_stats",
      "بدء التسجيل|27 / 4\nآخر موعد|15 / 6\nإعلان النتائج|15 / 6\nبدء الفصل الصيفي|25 / 6"
    )
  );

  const calBadge = get("mofadla_cal_badge", "التقويم الجامعي");
  const calTitle = get("mofadla_cal_title", "التقويم الجامعي للعام الدراسي 2026 - 2027");
  const calSubtitle = get("mofadla_cal_subtitle", "جدول الفصلين الدراسيين: التسجيل، بداية الفصل، والامتحانات.");
  const sem1Title = get("mofadla_sem1_title", "الفصل الأول");
  const sem1Duration = get("mofadla_sem1_duration", "16 أسبوعاً تقريباً");
  const sem1Rows = parseLines(
    get("mofadla_sem1_rows", "بدء التسجيل|آب + أيلول\nبداية الفصل|تشرين الأول\nالامتحانات|آخر كانون الثاني")
  );
  const sem2Title = get("mofadla_sem2_title", "الفصل الثاني");
  const sem2Duration = get("mofadla_sem2_duration", "16 أسبوعاً تقريباً");
  const sem2Rows = parseLines(
    get("mofadla_sem2_rows", "بدء التسجيل|بداية شباط\nبداية الفصل الثاني|شباط\nالامتحانات|حزيران")
  );

  const docsBadge = get("mofadla_docs_badge", "الوثائق المطلوبة");
  const docsTitle = get("mofadla_docs_title", "ما تحتاجه لإتمام التقديم");
  const docsSubtitle = get("mofadla_docs_subtitle", "جهّز نسخاً واضحة من الوثائق التالية قبل البدء بالتقديم.");
  const docs = get(
    "mofadla_docs_list",
    "صورة شخصية حديثة بخلفية بيضاء\nصورة عن الهوية الشخصية / الرقم الوطني\nوثيقة درجات شهادة الثانوية العامة (الأصلية)\nصورة مصدّقة عن شهادة الثانوية العامة\nإخراج قيد فردي حديث (لا يتجاوز 3 أشهر)\nإيصال دفع رسم التقديم"
  )
    .split("\n").map((s) => s.trim()).filter(Boolean);

  const stepsBadge = get("mofadla_steps_badge", "كيف تتقدّم؟");
  const stepsTitle = get("mofadla_steps_title", "خطوات بسيطة لإكمال طلبك");
  const stepsSubtitle = get("mofadla_steps_subtitle", "نظام التقديم إلكتروني بالكامل ولن يستغرق منك أكثر من 10 دقائق.");
  const steps = parseLines(
    get(
      "mofadla_steps_list",
      "أدخل بياناتك الشخصية|اسم رباعي، رقم وطني، تواصل، وعنوان.\nأدخل معدلك|اختر الفرع وأدخل معدل الثانوية أو آخر شهادة.\nرتّب الرغبات|اختر البرامج التي تناسبك ورتّبها حسب الأولوية.\nأرسل الطلب|احصل على رقم الطلب واحتفظ به للمراجعة."
    )
  );

  const dlBadge = get("mofadla_dl_badge", "ملفات للتحميل");
  const dlTitle = get("mofadla_dl_title", "الوثائق والإجراءات الرسمية");
  const dlSubtitle = get("mofadla_dl_subtitle", "حمّل الملفات التالية للاطلاع على إجراءات القيد وجداول البرامج بشكل تفصيلي.");
  const downloads = parseLines(
    get(
      "mofadla_dl_list",
      "إجراءات القيد لدرجة الإجازة|الشروط والوثائق المطلوبة للقيد في مرحلة الإجازة.|/downloads/registration-bachelor.pdf\nإجراءات القيد لدرجة الماجستير|الشروط والوثائق المطلوبة للقيد في مرحلة الماجستير.|/downloads/registration-master.pdf\nإجراءات القيد لدرجة الدكتوراه|الشروط والوثائق المطلوبة للقيد في مرحلة الدكتوراه.|/downloads/registration-phd.pdf\nجداول البرامج|الجداول التفصيلية للبرامج الأكاديمية المتاحة.|/downloads/programs-schedule.pdf"
    )
  );
  const dlBtn = get("mofadla_dl_btn", "تحميل PDF");

  const progBadge = get("mofadla_prog_badge", "البرامج المتاحة");
  const progTitle = get("mofadla_prog_title", "اختصاصات مفاضلة صيف 2026");
  const progSubtitle = get("mofadla_prog_subtitle", "اطّلع على البرامج المفتوحة للتقديم وعدد المقاعد والحدّ الأدنى للقبول.");
  const progEmpty = get("mofadla_prog_empty", "لا توجد برامج مفتوحة للتقديم حالياً. يرجى المتابعة لاحقاً.");
  const progSeatsLabel = get("mofadla_prog_seats_label", "المقاعد:");
  const progMinLabel = get("mofadla_prog_min_label", "الحد الأدنى:");

  const regBadge = get("mofadla_reg_badge", "تثبيت التسجيل");
  const regTitle = get("mofadla_reg_title", "تثبيت التسجيل في المفاضلة");
  const regSubtitle = get("mofadla_reg_subtitle", "املأ بياناتك الشخصية وارفع المستندات المطلوبة وإيصال دفع رسوم التسجيل من خلال النموذج التالي.");

  const notesBadge = get("mofadla_notes_badge", "ملاحظات هامة");
  const notesTitle = get("mofadla_notes_title", "قبل أن تبدأ التقديم");
  const notesSubtitle = get("mofadla_notes_subtitle", "معلومات يجب عليك معرفتها لضمان قبول طلبك.");
  const notes = get(
    "mofadla_notes_list",
    "الطلب الإلكتروني نهائي بعد الإرسال ولا يمكن تعديله — راجع بياناتك جيداً.\nترتيب الرغبات مهمّ: سيُقبل الطالب في أعلى رغبة تسمح بها علامته ومقاعدها متوفرة.\nأيّ بيانات أو علامات غير صحيحة تؤدي إلى استبعاد الطلب نهائياً.\nاحتفظ برقم الطلب الذي يظهر بعد الإرسال للرجوع إليه عند الاستفسار.\nستتواصل معك إدارة الجامعة عبر الهاتف أو البريد عند صدور النتائج."
  )
    .split("\n").map((s) => s.trim()).filter(Boolean);

  const ctaTitle = get("mofadla_cta_title", "جاهز للتقديم؟ ثبّت مقعدك الآن");
  const ctaDesc = get(
    "mofadla_cta_desc",
    "ابدأ تعبئة طلبك مباشرة. لن يستغرق الأمر أكثر من 10 دقائق، وستحصل على رقم طلب فوري لمتابعة حالة قبولك."
  );
  const ctaApplyBtn = get("mofadla_cta_apply_btn", "قدّم الآن");
  const ctaFaqBtn = get("mofadla_cta_faq_btn", "أسئلة شائعة");

  const contactTitle = get("mofadla_contact_title", "للاستفسار والدعم");
  const contactPhone = get("mofadla_contact_phone", "+963 989 801 010");
  const contactWa = get("mofadla_contact_wa", "+963 989 801 010");
  const contactEmail = get("mofadla_contact_email", "academic@upafa.education");
  const contactAddress = get("mofadla_contact_address", "دمشق – سوريا");

  const seoTitle = get("mofadla_seo_title", "المفاضلة والقبول الجامعي 2026 | UPAFA سوريا");
  const seoDesc = get(
    "mofadla_seo_desc",
    "مفاضلة جامعة UPAFA – فرع سوريا 2026: التخصصات المتاحة، شروط القبول، والتسجيل المباشر للمتقدمين الجدد."
  );

  const calIcons = [ClipboardList, BookOpen, FileCheck2];
  const statIcons = [ClipboardList, CalendarDays, CheckCircle2, BookOpen];

  return (
    <div dir="rtl">
      <Seo title={seoTitle} description={seoDesc} path="/mofadla" />

      {/* Hero */}
      <section className="relative bg-primary text-primary-foreground overflow-hidden">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ background: "radial-gradient(circle at 80% 20%, hsl(var(--accent)) 0%, transparent 50%)" }}
        />
        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <div className="max-w-3xl">
            <Badge className="bg-accent text-accent-foreground hover:bg-accent mb-4 text-xs font-bold">{heroBadge}</Badge>
            <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">{heroTitle}</h1>
            <p className="text-base md:text-lg text-primary-foreground/85 leading-relaxed mb-6 max-w-2xl">{heroDesc}</p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-accent text-accent-foreground hover:brightness-110 font-bold gap-2">
                <Link to="/mofadla/apply"><ClipboardList size={18} />{ctaApply}</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-transparent border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground gap-2">
                <a href="#register"><UserPlus size={18} />{ctaRegister}</a>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-transparent border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground gap-2">
                <a href="#programs"><BookOpen size={18} />{ctaPrograms}</a>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-10 max-w-3xl">
            {stats.map((s, i) => {
              const Icon = statIcons[i] || ClipboardList;
              return (
                <div key={i} className="bg-primary-foreground/10 backdrop-blur rounded-md p-3 border border-primary-foreground/15">
                  <Icon size={18} className="text-accent mb-1.5" />
                  <div className="text-xl md:text-2xl font-extrabold leading-none">{s[1]}</div>
                  <div className="text-[11px] text-primary-foreground/75 mt-1">{s[0]}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Academic Calendar */}
      <section className="py-14 md:py-20 bg-background">
        <div className="container mx-auto px-4">
          <SectionHeading badge={calBadge} title={calTitle} subtitle={calSubtitle} />
          <div className="grid md:grid-cols-2 gap-6 mt-10 max-w-5xl mx-auto">
            {[
              { title: sem1Title, duration: sem1Duration, rows: sem1Rows },
              { title: sem2Title, duration: sem2Duration, rows: sem2Rows },
            ].map((sem, si) => (
              <Card key={si} className="border-t-4 border-t-accent hover:shadow-md transition-shadow overflow-hidden">
                <div className="bg-primary text-primary-foreground px-5 py-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-lg">{sem.title}</h3>
                    <p className="text-xs text-primary-foreground/80 mt-0.5">{sem.duration}</p>
                  </div>
                  <div className="w-11 h-11 rounded-md bg-accent text-accent-foreground flex items-center justify-center">
                    <CalendarDays size={20} />
                  </div>
                </div>
                <CardContent className="p-0">
                  <ul className="divide-y divide-border">
                    {sem.rows.map((r, ri) => {
                      const Icon = calIcons[ri] || ClipboardList;
                      return (
                        <li key={ri} className="flex items-center gap-3 px-5 py-4">
                          <div className="w-9 h-9 rounded-md bg-accent/15 text-primary flex items-center justify-center shrink-0">
                            <Icon size={16} />
                          </div>
                          <div className="flex-1 flex items-center justify-between gap-3">
                            <span className="text-sm font-bold text-primary">{r[0]}</span>
                            <span className="text-sm font-bold text-accent">{r[1]}</span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Required documents + Steps */}
      <section className="py-14 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-10 items-start">
            <div>
              <SectionHeading badge={docsBadge} title={docsTitle} subtitle={docsSubtitle} align="start" />
              <ul className="space-y-2 mt-6">
                {docs.map((doc, i) => (
                  <li key={i} className="flex items-start gap-3 bg-card border border-border rounded-md px-4 py-3">
                    <span className="mt-0.5 w-6 h-6 rounded-full bg-accent text-accent-foreground text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                    <span className="text-sm text-foreground leading-relaxed">{doc}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <SectionHeading badge={stepsBadge} title={stepsTitle} subtitle={stepsSubtitle} align="start" />
              <ol className="mt-6 space-y-3">
                {steps.map((s, i) => (
                  <li key={i} className="flex gap-4 bg-card border border-border rounded-md p-4">
                    <div className="w-10 h-10 rounded-md bg-primary text-primary-foreground font-bold flex items-center justify-center shrink-0">{i + 1}</div>
                    <div>
                      <h4 className="font-bold text-primary mb-0.5 text-sm">{s[0]}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">{s[1] || ""}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* Downloads */}
      <section className="py-14 md:py-20 bg-background">
        <div className="container mx-auto px-4">
          <SectionHeading badge={dlBadge} title={dlTitle} subtitle={dlSubtitle} />
          <div className="grid md:grid-cols-3 gap-4 mt-10">
            {downloads.map((f, i) => (
              <Card key={i} className="hover:shadow-md hover:border-primary/40 transition-all">
                <CardContent className="p-5 flex flex-col h-full">
                  <div className="w-12 h-12 rounded-md bg-primary/10 text-primary flex items-center justify-center mb-4">
                    <FileText size={24} />
                  </div>
                  <h3 className="font-bold text-primary mb-2">{f[0]}</h3>
                  <p className="text-xs text-muted-foreground mb-4 leading-relaxed flex-1">{f[1]}</p>
                  <Button asChild variant="outline" size="sm" className="gap-2 w-full">
                    <a href={f[2] || "#"} target="_blank" rel="noopener noreferrer" download>
                      <Download size={16} />{dlBtn}
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Programs */}
      <section id="programs" className="py-14 md:py-20 bg-muted/30 scroll-mt-24">
        <div className="container mx-auto px-4">
          <SectionHeading badge={progBadge} title={progTitle} subtitle={progSubtitle} />
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : programs.length === 0 ? (
            <Card className="mt-10">
              <CardContent className="py-12 text-center">
                <AlertCircle className="mx-auto text-muted-foreground/40 mb-3" size={40} />
                <p className="text-sm text-muted-foreground">{progEmpty}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
              {programs.map((p) => (
                <Card key={p.id} className="hover:shadow-md hover:border-primary/40 transition-all">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="w-10 h-10 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                        <GraduationCap size={20} />
                      </div>
                      <Badge variant="outline" className="text-[10px]">{branchLabel(p.required_branch)}</Badge>
                    </div>
                    <h3 className="font-bold text-primary mb-1">{p.name}</h3>
                    {p.faculty && <p className="text-xs text-muted-foreground mb-3">{p.faculty}</p>}
                    <div className="flex items-center justify-between text-xs pt-3 border-t border-border">
                      <span className="text-muted-foreground">{progSeatsLabel} <strong className="text-foreground">{p.seats}</strong></span>
                      <span className="text-muted-foreground">{progMinLabel} <strong className="text-foreground">{Number(p.min_score)}%</strong></span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Quick Register */}
      <section id="register" className="py-14 md:py-20 bg-background scroll-mt-24">
        <div className="container mx-auto px-4">
          <SectionHeading badge={regBadge} title={regTitle} subtitle={regSubtitle} />
          <div className="mt-10">
            <MofadlaQuickRegister />
          </div>
        </div>
      </section>

      {/* Notes */}
      <section className="py-14 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4 max-w-4xl">
          <SectionHeading badge={notesBadge} title={notesTitle} subtitle={notesSubtitle} />
          <Card className="mt-10 border-r-4 border-r-accent">
            <CardContent className="p-6">
              <ul className="space-y-3 text-sm leading-relaxed">
                {notes.map((note, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <FileCheck2 size={18} className="text-accent shrink-0 mt-0.5" />
                    <span className="text-foreground">{note}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA + Contact */}
      <section className="py-14 md:py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-2">
              <h2 className="text-2xl md:text-4xl font-extrabold mb-3 leading-tight">{ctaTitle}</h2>
              <p className="text-primary-foreground/85 leading-relaxed mb-5 text-base">{ctaDesc}</p>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg" className="bg-accent text-accent-foreground hover:brightness-110 font-bold gap-2">
                  <Link to="/mofadla/apply">{ctaApplyBtn}<ArrowLeft size={18} /></Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="bg-transparent border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground gap-2">
                  <Link to="/faq"><ScrollText size={18} />{ctaFaqBtn}</Link>
                </Button>
              </div>
            </div>

            <Card className="bg-primary-foreground/5 border-primary-foreground/15 backdrop-blur">
              <CardContent className="p-5 space-y-3">
                <h3 className="font-bold text-primary-foreground mb-2">{contactTitle}</h3>
                <ContactRow Icon={Phone} text={contactPhone} href={`tel:${contactPhone.replace(/\s+/g, "")}`} />
                <ContactRow Icon={MessageCircle} text={`واتساب: ${contactWa}`} href={`https://wa.me/${contactWa.replace(/\D/g, "")}`} external />
                <ContactRow Icon={Mail} text={contactEmail} href={`mailto:${contactEmail}`} />
                <ContactRow Icon={MapPin} text={contactAddress} />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionHeading({ badge, title, subtitle, align = "center" }: { badge: string; title: string; subtitle?: string; align?: "center" | "start"; }) {
  return (
    <div className={align === "center" ? "text-center max-w-2xl mx-auto" : "text-start"}>
      <span className="inline-block bg-accent/15 text-primary text-xs font-bold px-3 py-1 rounded-full mb-3">{badge}</span>
      <h2 className="text-2xl md:text-3xl font-extrabold text-primary mb-2 leading-tight">{title}</h2>
      {subtitle && <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{subtitle}</p>}
    </div>
  );
}

function ContactRow({ Icon, text, href, external }: { Icon: typeof Phone; text: string; href?: string; external?: boolean; }) {
  const content = (
    <>
      <span className="w-8 h-8 rounded-md bg-accent/20 text-accent flex items-center justify-center shrink-0">
        <Icon size={14} />
      </span>
      <span dir="ltr" className="font-medium">{text}</span>
    </>
  );
  if (href) {
    return (
      <a href={href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined} className="flex items-center gap-3 text-sm text-primary-foreground/90 hover:text-primary-foreground transition-colors">
        {content}
      </a>
    );
  }
  return <div className="flex items-center gap-3 text-sm text-primary-foreground/90">{content}</div>;
}
