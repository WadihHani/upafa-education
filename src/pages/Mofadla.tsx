import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Users,
  BookOpen,
  ScrollText,
  Clock,
  MessageCircle,
} from "lucide-react";

const REQUIRED_DOCS = [
  "صورة شخصية حديثة بخلفية بيضاء",
  "صورة عن الهوية الشخصية / الرقم الوطني",
  "وثيقة درجات شهادة الثانوية العامة (الأصلية)",
  "صورة مصدّقة عن شهادة الثانوية العامة",
  "إخراج قيد فردي حديث (لا يتجاوز 3 أشهر)",
  "إيصال دفع رسم التقديم",
];

const ACADEMIC_CALENDAR = [
  {
    semester: "الفصل الأول",
    duration: "16 أسبوعاً تقريباً",
    rows: [
      { label: "بدء التسجيل", value: "آب + أيلول", Icon: ClipboardList },
      { label: "بداية الفصل", value: "تشرين الأول", Icon: BookOpen },
      { label: "الامتحانات", value: "آخر كانون الثاني", Icon: FileCheck2 },
    ],
  },
  {
    semester: "الفصل الثاني",
    duration: "16 أسبوعاً تقريباً",
    rows: [
      { label: "بدء التسجيل", value: "بداية شباط", Icon: ClipboardList },
      { label: "بداية الفصل الثاني", value: "شباط", Icon: BookOpen },
      { label: "الامتحانات", value: "حزيران", Icon: FileCheck2 },
    ],
  },
];

const STEPS = [
  { n: 1, title: "أدخل بياناتك الشخصية", desc: "اسم رباعي، رقم وطني، تواصل، وعنوان." },
  { n: 2, title: "أدخل معدلك", desc: "اختر الفرع وأدخل معدل الثانوية أو آخر شهادة." },
  { n: 3, title: "رتّب الرغبات", desc: "اختر البرامج التي تناسبك ورتّبها حسب الأولوية." },
  { n: 4, title: "أرسل الطلب", desc: "احصل على رقم الطلب واحتفظ به للمراجعة." },
];

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

  const totalSeats = programs.reduce((s, p) => s + (p.seats || 0), 0);

  return (
    <div dir="rtl">
      {/* Hero */}
      <section className="relative bg-primary text-primary-foreground overflow-hidden">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 80% 20%, hsl(var(--accent)) 0%, transparent 50%)",
          }}
        />
        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <div className="max-w-3xl">
            <Badge className="bg-accent text-accent-foreground hover:bg-accent mb-4 text-xs font-bold">
              مفاضلة صيف 2026
            </Badge>
            <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
              التقديم على المفاضلة الجامعية
            </h1>
            <p className="text-base md:text-lg text-primary-foreground/85 leading-relaxed mb-6 max-w-2xl">
              فُتح باب التقديم على مفاضلة صيف 2026 في جامعة UPAFA – فرع سوريا. أكمل
              طلبك إلكترونياً خلال دقائق، اختر الكلية والاختصاص المناسبين لك، وثبّت
              مقعدك الجامعي.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="bg-accent text-accent-foreground hover:brightness-110 font-bold gap-2"
              >
                <Link to="/mofadla/apply">
                  <ClipboardList size={18} />
                  قدّم الآن
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-transparent border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground gap-2"
              >
                <a href="#programs">
                  <BookOpen size={18} />
                  عرض البرامج المتاحة
                </a>
              </Button>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-10 max-w-3xl">
            <StatCard label="بدء التسجيل" value="27 / 4" Icon={ClipboardList} />
            <StatCard label="آخر موعد" value="15 / 6" Icon={CalendarDays} />
            <StatCard label="إعلان النتائج" value="15 / 6" Icon={CheckCircle2} />
            <StatCard label="بدء الفصل الصيفي" value="25 / 6" Icon={BookOpen} />
          </div>
        </div>
      </section>

      {/* Academic Calendar */}
      <section className="py-14 md:py-20 bg-background">
        <div className="container mx-auto px-4">
          <SectionHeading
            badge="التقويم الجامعي"
            title="التقويم الجامعي للعام الدراسي 2026 - 2027"
            subtitle="جدول الفصلين الدراسيين: التسجيل، بداية الفصل، والامتحانات."
          />
          <div className="grid md:grid-cols-2 gap-6 mt-10 max-w-5xl mx-auto">
            {ACADEMIC_CALENDAR.map((sem) => (
              <Card
                key={sem.semester}
                className="border-t-4 border-t-accent hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="bg-primary text-primary-foreground px-5 py-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-lg">{sem.semester}</h3>
                    <p className="text-xs text-primary-foreground/80 mt-0.5">{sem.duration}</p>
                  </div>
                  <div className="w-11 h-11 rounded-md bg-accent text-accent-foreground flex items-center justify-center">
                    <CalendarDays size={20} />
                  </div>
                </div>
                <CardContent className="p-0">
                  <ul className="divide-y divide-border">
                    {sem.rows.map((r) => (
                      <li key={r.label} className="flex items-center gap-3 px-5 py-4">
                        <div className="w-9 h-9 rounded-md bg-accent/15 text-primary flex items-center justify-center shrink-0">
                          <r.Icon size={16} />
                        </div>
                        <div className="flex-1 flex items-center justify-between gap-3">
                          <span className="text-sm font-bold text-primary">{r.label}</span>
                          <span className="text-sm font-bold text-accent">{r.value}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Required documents */}
      <section className="py-14 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-10 items-start">
            <div>
              <SectionHeading
                badge="الوثائق المطلوبة"
                title="ما تحتاجه لإتمام التقديم"
                subtitle="جهّز نسخاً واضحة من الوثائق التالية قبل البدء بالتقديم."
                align="start"
              />
              <ul className="space-y-2 mt-6">
                {REQUIRED_DOCS.map((doc, i) => (
                  <li
                    key={doc}
                    className="flex items-start gap-3 bg-card border border-border rounded-md px-4 py-3"
                  >
                    <span className="mt-0.5 w-6 h-6 rounded-full bg-accent text-accent-foreground text-xs font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-sm text-foreground leading-relaxed">{doc}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* How it works */}
            <div>
              <SectionHeading
                badge="كيف تتقدّم؟"
                title="خطوات بسيطة لإكمال طلبك"
                subtitle="نظام التقديم إلكتروني بالكامل ولن يستغرق منك أكثر من 10 دقائق."
                align="start"
              />
              <ol className="mt-6 space-y-3">
                {STEPS.map((s) => (
                  <li
                    key={s.n}
                    className="flex gap-4 bg-card border border-border rounded-md p-4"
                  >
                    <div className="w-10 h-10 rounded-md bg-primary text-primary-foreground font-bold flex items-center justify-center shrink-0">
                      {s.n}
                    </div>
                    <div>
                      <h4 className="font-bold text-primary mb-0.5 text-sm">{s.title}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* Programs */}
      <section id="programs" className="py-14 md:py-20 bg-background scroll-mt-24">
        <div className="container mx-auto px-4">
          <SectionHeading
            badge="البرامج المتاحة"
            title="اختصاصات مفاضلة صيف 2026"
            subtitle="اطّلع على البرامج المفتوحة للتقديم وعدد المقاعد والحدّ الأدنى للقبول."
          />

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : programs.length === 0 ? (
            <Card className="mt-10">
              <CardContent className="py-12 text-center">
                <AlertCircle className="mx-auto text-muted-foreground/40 mb-3" size={40} />
                <p className="text-sm text-muted-foreground">
                  لا توجد برامج مفتوحة للتقديم حالياً. يرجى المتابعة لاحقاً.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
              {programs.map((p) => (
                <Card
                  key={p.id}
                  className="hover:shadow-md hover:border-primary/40 transition-all"
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="w-10 h-10 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                        <GraduationCap size={20} />
                      </div>
                      <Badge variant="outline" className="text-[10px]">
                        {branchLabel(p.required_branch)}
                      </Badge>
                    </div>
                    <h3 className="font-bold text-primary mb-1">{p.name}</h3>
                    {p.faculty && (
                      <p className="text-xs text-muted-foreground mb-3">{p.faculty}</p>
                    )}
                    <div className="flex items-center justify-between text-xs pt-3 border-t border-border">
                      <span className="text-muted-foreground">
                        المقاعد: <strong className="text-foreground">{p.seats}</strong>
                      </span>
                      <span className="text-muted-foreground">
                        الحد الأدنى:{" "}
                        <strong className="text-foreground">{Number(p.min_score)}</strong>
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Important notes */}
      <section className="py-14 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4 max-w-4xl">
          <SectionHeading
            badge="ملاحظات هامة"
            title="قبل أن تبدأ التقديم"
            subtitle="معلومات يجب عليك معرفتها لضمان قبول طلبك."
          />
          <Card className="mt-10 border-r-4 border-r-accent">
            <CardContent className="p-6">
              <ul className="space-y-3 text-sm leading-relaxed">
                {[
                  "الطلب الإلكتروني نهائي بعد الإرسال ولا يمكن تعديله — راجع بياناتك جيداً.",
                  "ترتيب الرغبات مهمّ: سيُقبل الطالب في أعلى رغبة تسمح بها علامته ومقاعدها متوفرة.",
                  "أيّ بيانات أو علامات غير صحيحة تؤدي إلى استبعاد الطلب نهائياً.",
                  "احتفظ برقم الطلب الذي يظهر بعد الإرسال للرجوع إليه عند الاستفسار.",
                  "ستتواصل معك إدارة الجامعة عبر الهاتف أو البريد عند صدور النتائج.",
                ].map((note) => (
                  <li key={note} className="flex items-start gap-3">
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
              <h2 className="text-2xl md:text-4xl font-extrabold mb-3 leading-tight">
                جاهز للتقديم؟ ثبّت مقعدك الآن
              </h2>
              <p className="text-primary-foreground/85 leading-relaxed mb-5 text-base">
                ابدأ تعبئة طلبك مباشرة. لن يستغرق الأمر أكثر من 10 دقائق، وستحصل على رقم
                طلب فوري لمتابعة حالة قبولك.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  asChild
                  size="lg"
                  className="bg-accent text-accent-foreground hover:brightness-110 font-bold gap-2"
                >
                  <Link to="/mofadla/apply">
                    قدّم الآن
                    <ArrowLeft size={18} />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground gap-2"
                >
                  <Link to="/faq">
                    <ScrollText size={18} />
                    أسئلة شائعة
                  </Link>
                </Button>
              </div>
            </div>

            <Card className="bg-primary-foreground/5 border-primary-foreground/15 backdrop-blur">
              <CardContent className="p-5 space-y-3">
                <h3 className="font-bold text-primary-foreground mb-2">
                  للاستفسار والدعم
                </h3>
                <ContactRow Icon={Phone} text="+963 989 801 010" href="tel:+963989801010" />
                <ContactRow
                  Icon={MessageCircle}
                  text="واتساب: +963 989 801 010"
                  href="https://wa.me/963989801010"
                  external
                />
                <ContactRow Icon={Mail} text="academic@upafa.education" href="mailto:academic@upafa.education" />
                <ContactRow Icon={MapPin} text="دمشق – سوريا" />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionHeading({
  badge,
  title,
  subtitle,
  align = "center",
}: {
  badge: string;
  title: string;
  subtitle?: string;
  align?: "center" | "start";
}) {
  return (
    <div className={align === "center" ? "text-center max-w-2xl mx-auto" : "text-start"}>
      <span className="inline-block bg-accent/15 text-primary text-xs font-bold px-3 py-1 rounded-full mb-3">
        {badge}
      </span>
      <h2 className="text-2xl md:text-3xl font-extrabold text-primary mb-2 leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  Icon,
}: {
  label: string;
  value: string;
  Icon: typeof GraduationCap;
}) {
  return (
    <div className="bg-primary-foreground/10 backdrop-blur rounded-md p-3 border border-primary-foreground/15">
      <Icon size={18} className="text-accent mb-1.5" />
      <div className="text-xl md:text-2xl font-extrabold leading-none">{value}</div>
      <div className="text-[11px] text-primary-foreground/75 mt-1">{label}</div>
    </div>
  );
}

function ContactRow({
  Icon,
  text,
  href,
  external,
}: {
  Icon: typeof Phone;
  text: string;
  href?: string;
  external?: boolean;
}) {
  const content = (
    <>
      <span className="w-8 h-8 rounded-md bg-accent/20 text-accent flex items-center justify-center shrink-0">
        <Icon size={14} />
      </span>
      <span dir="ltr" className="font-medium">
        {text}
      </span>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className="flex items-center gap-3 text-sm text-primary-foreground/90 hover:text-primary-foreground transition-colors"
      >
        {content}
      </a>
    );
  }

  return (
    <div className="flex items-center gap-3 text-sm text-primary-foreground/90">
      {content}
    </div>
  );
}
