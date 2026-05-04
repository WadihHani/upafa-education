import type { ElementType } from "react";
import { useParams, Link } from "react-router-dom";
import { GraduationCap, Clock, BookOpen, CheckCircle2, FileText, Globe, ClipboardList, ListChecks } from "lucide-react";

type RegistrationInfo = {
  conditions?: { title: string; items: string[] };
  documents?: { title: string; items: string[] };
  steps: { title: string; items: string[] };
  applyMethods?: { title: string; items: string[] };
  completion?: { title: string; items: string[] };
  upgrade?: { title: string; items: string[] };
  notes?: string[];
};

const REGISTRATION: Record<string, RegistrationInfo> = {
  bachelor: {
    documents: {
      title: "الوثائق المطلوبة للقيد (للمستجدين)",
      items: [
        "صورة مصدقة عن الشهادة الثانوية الأصلية.",
        "صورة عن الهوية الشخصية (للوجهين) أو قيد نفوس حديث (للسوريين) أو صورة عن جواز السفر (لغير السوريين).",
        "صورة شخصية حديثة.",
        "استمارة المفاضلة الإلكترونية: يتم فيها ملء البيانات الكاملة ووضع الرغبات.",
        "لطلاب الانتقال: صورة عن كشف العلامات للمواد المنجزة في الجامعة السابقة لإجراء المعادلة لدى القسم المختص.",
      ],
    },
    steps: {
      title: "خطوات إجراءات القيد",
      items: [
        "استخراج إشعار القبول: بعد صدور نتائج القبول، يتوجه الطالب إلى القسم الذي قُبل به للتأكد من وجود اسمه في قوائم المقبولين.",
        "تسديد الرسوم الدراسية: يتم الدفع نقداً في إدارة الجامعة أو عبر الدفع الإلكتروني حسب النظام المتبع، أو عبر إحدى مكاتب التحويل المباشر.",
        "تسليم الملف: يُسلم الطالب جميع الوثائق السابقة إلى الموظف المختص في قسم شؤون الطلاب بالجامعة أو لدى وكلاء الجامعة.",
      ],
    },
    applyMethods: {
      title: "طرق التقديم المتاحة",
      items: [
        "الموقع الرسمي: التقديم عبر رابط استمارة التسجيل المباشر.",
        "الواتساب: إرسال صور الوثائق المطلوبة إلى مكتب التسجيل والقبول في دمشق عبر الرقم المخصص.",
        "مكاتب التسجيل والقبول ووكلاء الجامعة في دمشق وجميع الفروع.",
      ],
    },
    notes: [
      "تشترط الجامعة أن تكون الشهادات العلمية مصدقة أصولاً، والقبول متاح لبرامج الإجازة (البكالوريوس)، الماجستير، والدكتوراه.",
      "لمعرفة المواعيد الدقيقة والرسوم الحالية لعام 2026 يمكن مراجعة صفحة الرسوم الدراسية أو التواصل مع مكتب القبول والتسجيل.",
    ],
  },
  master: {
    conditions: {
      title: "الشروط العامة للقيد",
      items: [
        "أن يكون الطالب حاصلاً على درجة الإجازة بتقدير «جيد» على الأقل من إحدى كليات الجامعات الحكومية السورية أو ما يعادلها من كلية أخرى أو معهد عالٍ معترف به من مجلس الجامعة، وأن تكون الإجازة مناسبة للقيد بدرجة الماجستير.",
        "اجتياز امتحان اللغة الأجنبية للقيد (مستوى الإنكليزية 3 من 6).",
        "أن تكون الإجازة في نفس الاختصاص أو في اختصاص معادل يقبله القسم.",
      ],
    },
    steps: {
      title: "خطوات إجراءات القيد",
      items: [
        "التقديم: يتم تقديم الطلبات إلكترونياً أو في جميع مراكز التسجيل المحددة.",
        "امتحان اللغة: اجتياز امتحان القيد باللغة الأجنبية (أو تقديم وثيقة نجاح سارية).",
        "إعلان النتائج والتسجيل: بعد صدور نتائج القبول، يتم تسليم الأوراق الثبوتية الورقية والإلكترونية (مصدقة التخرج، الهوية، وثيقة اللغة، صورة شخصية) إلى قسم الدراسات العليا بالجامعة أو مكاتبها الفرعية.",
        "تثبيت القيد: دفع الرسوم الدراسية المطلوبة لتثبيت القيد في إدارة الجامعة أو مكاتبها الفرعية.",
      ],
    },
    notes: [
      "يمكن التسجيل عبر الإنترنت أو من خلال مكتب التسجيل والقبول ووكلاء الجامعة في دمشق وجميع الفروع.",
      "لمعرفة المواعيد الدقيقة والرسوم الحالية لعام 2026 يمكن مراجعة صفحة الرسوم الدراسية أو التواصل مع مكتب القبول والتسجيل.",
    ],
  },
  phd: {
    conditions: {
      title: "الشروط العامة للقيد",
      items: [
        "أن يكون الطالب حاصلاً على درجة الماجستير في الاختصاص الذي يحدده نظام الدراسات العليا الخاص بالقسم بتقدير «جيد» على الأقل، من إحدى الأقسام ذات التخصص في الجامعة الإفريقية الفرنسية العربية أو الكليات في الجامعات الحكومية السورية أو ما يعادلها من كلية أخرى أو معهد عالٍ معترف به من مجلس الجامعة.",
      ],
    },
    documents: {
      title: "الأوراق المطلوبة للقيد في درجة الدكتوراه (نسخة ورقية + إلكترونية)",
      items: [
        "صورة مصدقة عن وثيقة التخرج أو الإجازة.",
        "صورة مصدقة عن شهادة الماجستير للشهادات السورية.",
        "صورة مصدقة عن شهادة الماجستير مع صورة قرار معادلة الشهادة للشهادات غير السورية.",
        "وثيقة نجاح الطالب بامتحان اللغة الأجنبية الخاص بالتسجيل في الدكتوراه (مستوى 4 من 6).",
        "مخطط البحث موثقاً من الطالب والأستاذ المشرف (والمشارك إن وجد).",
        "محضر السمنار (المناقشة العلنية) لمخطط البحث موقعاً من النائب العلمي ورئيس القسم المختص والمشرفين وأعضاء مجلس القسم.",
        "استمارة مشروع البحث العلمي بعد ملء كافة المعلومات فيها وموقعة من رئيس القسم.",
      ],
    },
    upgrade: {
      title: "نظام الانتقال من الدكتوراه المهنية إلى الأكاديمية",
      items: [
        "التقدم بوثيقة الدكتوراه المهنية مصدقة أصولاً.",
        "يُعفى الطالب من المواد الدراسية المقررة لبرنامج الدكتوراه.",
        "إعداد رسالة دكتوراه بحثية لمدة سنة واحدة.",
      ],
    },
    steps: {
      title: "خطوات إجراءات القيد",
      items: [
        "التقديم: يتم تقديم الطلبات إلكترونياً أو في جميع مراكز التسجيل المحددة.",
        "امتحان اللغة: اجتياز امتحان القيد باللغة الأجنبية (أو تقديم وثيقة نجاح سارية).",
        "إعلان النتائج والتسجيل: بعد صدور نتائج القبول، يتم تسليم الأوراق الثبوتية الورقية والإلكترونية إلى قسم الدراسات العليا بالجامعة أو مكاتبها الفرعية.",
        "تثبيت القيد: دفع الرسوم الدراسية المطلوبة لتثبيت القيد في إدارة الجامعة أو مكاتبها الفرعية.",
      ],
    },
    completion: {
      title: "شروط إتمام الدكتوراه",
      items: [
        "عدد الساعات المعتمدة: 6 ساعات معتمدة (حسب مجلس البحث العلمي).",
        "إعداد رسالة دكتوراه بحثية.",
        "المدة: سنة ونصف حداً أدنى.",
        "الحصول على شهادة قيادة الحاسب ICDL.",
      ],
    },
    notes: [
      "يمكن التسجيل عبر الإنترنت أو من خلال مكتب التسجيل والقبول ووكلاء الجامعة في دمشق وجميع الفروع.",
      "لمعرفة المواعيد الدقيقة والرسوم الحالية لعام 2026 يمكن مراجعة صفحة الرسوم الدراسية أو التواصل مع مكتب القبول والتسجيل.",
    ],
  },
};

type LevelInfo = {
  title: string;
  subtitle: string;
  duration: string;
  description: string;
  highlights: string[];
};

const LEVELS: Record<string, LevelInfo> = {
  bachelor: {
    title: "البكالوريوس",
    subtitle: "المرحلة الجامعية الأولى",
    duration: "4 سنوات (8 فصول دراسية)",
    description:
      "برنامج البكالوريوس في جامعة أفريقيا – فرع سوريا يُعدّ الطلاب أكاديمياً ومهنياً في مختلف التخصصات، عبر مناهج حديثة وأساتذة متخصصين، مع التركيز على التطبيق العملي والبحث العلمي.",
    highlights: [
      "أكثر من 20 تخصصاً في 6 كليات",
      "نظام الساعات المعتمدة",
      "إمكانية الدراسة الحضورية وعن بُعد",
      "شهادة معترف بها دولياً",
      "تدريب عملي وميداني",
    ],
  },
  master: {
    title: "الماجستير",
    subtitle: "الدراسات العليا – المرحلة الأولى",
    duration: "سنتان دراسيتان (4 فصول)",
    description:
      "برامج الماجستير في جامعة أفريقيا – فرع سوريا تهدف إلى تعميق المعرفة التخصصية وتطوير مهارات البحث العلمي، وتشمل 45 ساعة معتمدة + 15 ساعة لرسالة التخرج (60 ساعة إجمالاً) موزعة على 4 فصول دراسية تحت إشراف نخبة من الأساتذة.",
    highlights: [
      "22 برنامج ماجستير في مختلف التخصصات",
      "60 ساعة معتمدة (45 مقررات + 15 رسالة تخرج)",
      "إشراف أكاديمي مباشر على الرسالة البحثية",
      "ندوات ومؤتمرات علمية دورية",
      "إمكانية النشر في مجلات محكمة",
    ],
  },
  phd: {
    title: "الدكتوراه",
    subtitle: "الدراسات العليا – المرحلة العليا",
    duration: "من 3 إلى 5 سنوات",
    description:
      "برنامج الدكتوراه يُعدّ أعلى الدرجات الأكاديمية، ويهدف إلى إعداد باحثين متميزين قادرين على إنتاج معرفة جديدة في مجال تخصصهم، عبر إعداد أطروحة بحثية أصيلة تحت إشراف نخبة من الأساتذة.",
    highlights: [
      "أطروحة بحثية أصيلة",
      "إشراف من نخبة الأساتذة",
      "نشر علمي في مجلات محكمة",
      "شهادة معترف بها دولياً",
      "فرص للتعاون مع مراكز بحثية",
    ],
  },
};

type MasterProgram = {
  code: string;
  title: string;
  degree: string;
  language: string;
  prerequisite: string;
};

const MASTER_PROGRAMS: MasterProgram[] = [
  { code: "MMH", title: "ماجستير في الصحة النفسية", degree: "ماجستير أكاديمي", language: "العربية والإنكليزية", prerequisite: "جميع الإجازات الجامعية المعتمدة من قبل وزارة التعليم العالي" },
  { code: "MECE", title: "ماجستير رياض الأطفال", degree: "ماجستير أكاديمي", language: "العربية والإنكليزية", prerequisite: "جميع الإجازات الجامعية المعتمدة من قبل وزارة التعليم العالي" },
  { code: "MBA", title: "ماجستير إدارة الأعمال", degree: "ماجستير أكاديمي", language: "العربية والإنكليزية", prerequisite: "جميع الإجازات الجامعية المعتمدة ذات الصلة والتخصص" },
  { code: "MCT", title: "ماجستير معلم صف", degree: "ماجستير أكاديمي", language: "العربية والإنكليزية", prerequisite: "جميع الإجازات الجامعية المعتمدة من قبل وزارة التعليم العالي" },
  { code: "MCP", title: "ماجستير علم النفس الإكلينيكي", degree: "ماجستير أكاديمي", language: "العربية والإنكليزية", prerequisite: "الإجازة في التربية (علم نفس – إرشاد نفسي)" },
  { code: "MSES", title: "ماجستير التربية الخاصة والنطق", degree: "ماجستير أكاديمي", language: "العربية والإنكليزية", prerequisite: "الإجازة في التربية (علم نفس – إرشاد نفسي – تربية خاصة – رياض أطفال – معلم صف)" },
  { code: "MFAT", title: "ماجستير الترجمة (فرنسي – عربي)", degree: "ماجستير أكاديمي", language: "العربية والفرنسية", prerequisite: "الإجازة في اللغة الفرنسية وآدابها" },
  { code: "MEAT", title: "ماجستير الترجمة (إنكليزي – عربي)", degree: "ماجستير أكاديمي", language: "العربية والإنكليزية", prerequisite: "الإجازة في اللغة الإنكليزية وآدابها" },
  { code: "MVDM", title: "ماجستير الإعلام المرئي والإلكتروني", degree: "ماجستير أكاديمي", language: "العربية والإنكليزية", prerequisite: "الإجازة في الإعلام والعلاقات العامة" },
  { code: "MMPR", title: "ماجستير الإعلام والعلاقات العامة", degree: "ماجستير أكاديمي", language: "العربية والإنكليزية", prerequisite: "جميع الإجازات الجامعية المعتمدة من قبل وزارة التعليم العالي" },
  { code: "MQSI", title: "ماجستير علوم القرآن وتفسيره", degree: "ماجستير أكاديمي", language: "العربية", prerequisite: "جميع الإجازات الجامعية المعتمدة من قبل وزارة التعليم العالي" },
  { code: "MCF", title: "ماجستير الفقه المقارن", degree: "ماجستير أكاديمي", language: "العربية", prerequisite: "جميع الإجازات الجامعية المعتمدة من قبل وزارة التعليم العالي" },
  { code: "MIA", title: "ماجستير العقيدة الإسلامية", degree: "ماجستير أكاديمي", language: "العربية", prerequisite: "جميع الإجازات الجامعية المعتمدة من قبل وزارة التعليم العالي" },
  { code: "MIC", title: "ماجستير السيرة النبوية", degree: "ماجستير أكاديمي", language: "العربية", prerequisite: "جميع الإجازات الجامعية المعتمدة من قبل وزارة التعليم العالي" },
  { code: "MMKTG", title: "ماجستير التسويق", degree: "ماجستير أكاديمي", language: "العربية والإنكليزية", prerequisite: "جميع الإجازات الجامعية المعتمدة ذات الصلة والتخصص" },
  { code: "MPB", title: "ماجستير المصارف والتأمين", degree: "ماجستير أكاديمي", language: "العربية والإنكليزية", prerequisite: "جميع الإجازات الجامعية المعتمدة ذات الصلة والتخصص" },
  { code: "MACC", title: "ماجستير المحاسبة", degree: "ماجستير أكاديمي", language: "العربية والإنكليزية", prerequisite: "جميع الإجازات الجامعية المعتمدة ذات الصلة والتخصص" },
  { code: "MCLC", title: "ماجستير قانون العقوبات والعلوم الجزائية", degree: "ماجستير أكاديمي", language: "العربية", prerequisite: "الإجازة في الحقوق" },
  { code: "MPIL", title: "ماجستير القانون الدولي العام", degree: "ماجستير أكاديمي", language: "العربية", prerequisite: "الإجازة في الحقوق – الإجازة في العلوم السياسية – الإجازة في العلاقات الدولية" },
  { code: "MPL", title: "ماجستير القانون الخاص", degree: "ماجستير أكاديمي", language: "العربية والإنكليزية", prerequisite: "الإجازة في الحقوق" },
  { code: "MPUL", title: "ماجستير القانون العام", degree: "ماجستير أكاديمي", language: "العربية والإنكليزية", prerequisite: "الإجازة في الحقوق – الإجازة في العلوم السياسية" },
  { code: "MNGOs", title: "ماجستير إدارة المنظمات غير الحكومية", degree: "ماجستير مهني", language: "العربية والإنكليزية", prerequisite: "جميع الإجازات الجامعية المعتمدة ذات الصلة والتخصص" },
];

const PHD_PROGRAMS: { title: string; field: string; prerequisite: string }[] = [
  { title: "دكتوراه في العلوم التربوية والنفسية", field: "كلية التربية", prerequisite: "ماجستير في تخصص ذي صلة (تربية، علم نفس، إرشاد، تربية خاصة)" },
  { title: "دكتوراه في إدارة الأعمال", field: "كلية الاقتصاد وإدارة الأعمال", prerequisite: "ماجستير في إدارة الأعمال أو تخصص ذي صلة" },
  { title: "دكتوراه في المحاسبة", field: "كلية الاقتصاد وإدارة الأعمال", prerequisite: "ماجستير في المحاسبة أو تخصص ذي صلة" },
  { title: "دكتوراه في الإعلام والعلاقات العامة", field: "كلية الإعلام", prerequisite: "ماجستير في الإعلام أو العلاقات العامة" },
  { title: "دكتوراه في الشريعة الإسلامية", field: "كلية الشريعة", prerequisite: "ماجستير في الشريعة أو الفقه أو علوم القرآن" },
  { title: "دكتوراه في القانون الخاص", field: "كلية الحقوق", prerequisite: "ماجستير في القانون الخاص" },
  { title: "دكتوراه في القانون العام", field: "كلية الحقوق", prerequisite: "ماجستير في القانون العام أو القانون الدولي" },
  { title: "دكتوراه في الآداب والعلوم الإنسانية", field: "كلية الآداب", prerequisite: "ماجستير في تخصص ذي صلة" },
];

export default function ProgramLevel() {
  const { level } = useParams<{ level: string }>();
  const info = level ? LEVELS[level] : null;

  if (!info) {
    return (
      <section className="py-20 text-center">
        <h1 className="text-2xl font-bold text-foreground">المرحلة غير موجودة</h1>
        <Link to="/programs" className="text-primary hover:underline mt-4 inline-block">العودة إلى البرامج</Link>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-10">
          <p className="text-sm font-semibold text-accent tracking-wider mb-2">{info.subtitle}</p>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">{info.title}</h1>
          <div className="w-16 h-1 bg-accent mx-auto mt-4 rounded-full" />
        </div>

        <div className="bg-card rounded-xl shadow-lg p-6 md:p-8 border border-border/50 mb-8">
          <div className="flex flex-wrap items-center gap-6 pb-6 border-b border-border/50 mb-6">
            <div className="flex items-center gap-2 text-foreground/80">
              <GraduationCap className="text-primary" size={20} />
              <span className="font-semibold">{info.title}</span>
            </div>
            <div className="flex items-center gap-2 text-foreground/80">
              <Clock className="text-primary" size={20} />
              <span>{info.duration}</span>
            </div>
            <div className="flex items-center gap-2 text-foreground/80">
              <BookOpen className="text-primary" size={20} />
              <Link to="/faculties" className="text-primary hover:underline">جميع الكليات</Link>
            </div>
          </div>

          <p className="text-foreground/80 leading-[2] mb-6">{info.description}</p>

          <h3 className="text-lg font-bold text-foreground mb-4">المميزات</h3>
          <ul className="space-y-3">
            {info.highlights.map((h) => (
              <li key={h} className="flex items-start gap-3 text-foreground/80">
                <CheckCircle2 className="text-accent shrink-0 mt-0.5" size={20} />
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </div>

        {level === "master" && (
          <div className="bg-card rounded-xl shadow-lg p-6 md:p-8 border border-border/50 mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">قائمة برامج الماجستير</h2>
            <p className="text-sm text-muted-foreground mb-6">
              كل برنامج ماجستير يتطلب إجازة جامعية محددة. القائمة أدناه تُبيّن نوع الإجازة المطلوبة لكل تخصص.
            </p>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-primary/10 text-foreground">
                    <th className="border border-border p-3 text-right font-semibold">رمز البرنامج</th>
                    <th className="border border-border p-3 text-right font-semibold">البرنامج</th>
                    <th className="border border-border p-3 text-right font-semibold">الإجازة المطلوبة</th>
                    <th className="border border-border p-3 text-right font-semibold">لغة الدراسة</th>
                  </tr>
                </thead>
                <tbody>
                  {MASTER_PROGRAMS.map((p, i) => (
                    <tr key={p.code} className={i % 2 === 0 ? "bg-background" : "bg-muted/30"}>
                      <td className="border border-border p-3 font-mono text-primary font-semibold">{p.code}</td>
                      <td className="border border-border p-3 font-semibold">{p.title}</td>
                      <td className="border border-border p-3 text-foreground/80">{p.prerequisite}</td>
                      <td className="border border-border p-3 text-foreground/80 whitespace-nowrap">{p.language}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-4">
              {MASTER_PROGRAMS.map((p) => (
                <div key={p.code} className="border border-border rounded-lg p-4 bg-background">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-foreground">{p.title}</h3>
                    <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-1 rounded">{p.code}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">{p.degree}</p>
                  <div className="flex items-start gap-2 text-sm text-foreground/80 mt-2">
                    <FileText className="text-accent shrink-0 mt-0.5" size={16} />
                    <span><strong>الإجازة المطلوبة:</strong> {p.prerequisite}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-foreground/80 mt-1">
                    <Globe className="text-accent shrink-0" size={16} />
                    <span>{p.language}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg text-sm text-foreground/80 leading-[1.9]">
              <strong className="text-primary">ملاحظات عامة لجميع البرامج:</strong>
              <ul className="list-disc pr-5 mt-2 space-y-1">
                <li>الحد الأدنى لمدة الدراسة: سنتان (4 فصول).</li>
                <li>عدد الساعات: 45 ساعة معتمدة + 15 ساعة رسالة التخرج = 60 ساعة.</li>
                <li>توزيع المقررات: الفصل الأول 4 – الثاني 4 – الثالث 4 – الرابع 3.</li>
              </ul>
            </div>
          </div>
        )}

        {level === "phd" && (
          <div className="bg-card rounded-xl shadow-lg p-6 md:p-8 border border-border/50 mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">قائمة برامج الدكتوراه</h2>
            <p className="text-sm text-muted-foreground mb-6">
              يتطلب القبول في برامج الدكتوراه شهادة الماجستير في تخصص ذي صلة. القائمة أدناه تُبيّن متطلبات كل برنامج.
            </p>

            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-primary/10 text-foreground">
                    <th className="border border-border p-3 text-right font-semibold">البرنامج</th>
                    <th className="border border-border p-3 text-right font-semibold">الكلية</th>
                    <th className="border border-border p-3 text-right font-semibold">الشهادة المطلوبة</th>
                  </tr>
                </thead>
                <tbody>
                  {PHD_PROGRAMS.map((p, i) => (
                    <tr key={p.title} className={i % 2 === 0 ? "bg-background" : "bg-muted/30"}>
                      <td className="border border-border p-3 font-semibold">{p.title}</td>
                      <td className="border border-border p-3 text-foreground/80">{p.field}</td>
                      <td className="border border-border p-3 text-foreground/80">{p.prerequisite}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden space-y-4">
              {PHD_PROGRAMS.map((p) => (
                <div key={p.title} className="border border-border rounded-lg p-4 bg-background">
                  <h3 className="font-bold text-foreground mb-1">{p.title}</h3>
                  <p className="text-xs text-muted-foreground mb-2">{p.field}</p>
                  <div className="flex items-start gap-2 text-sm text-foreground/80">
                    <FileText className="text-accent shrink-0 mt-0.5" size={16} />
                    <span><strong>الشهادة المطلوبة:</strong> {p.prerequisite}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg text-sm text-foreground/80 leading-[1.9]">
              <strong className="text-primary">ملاحظة:</strong> يخضع القبول في برامج الدكتوراه لمقابلة علمية وتقييم لمشروع البحث المقترح، إضافة إلى المعدل التراكمي في الماجستير.
            </div>
          </div>
        )}

        {level && REGISTRATION[level] && (
          <RegistrationBlock info={REGISTRATION[level]} />
        )}

        <div className="text-center">
          <Link to="/contact" className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
            تواصل معنا للتسجيل
          </Link>
        </div>
      </div>
    </section>
  );
}

type SectionBlock = { title: string; items: string[] };

function RegSection({ icon: Icon, title, items, ordered = false }: { icon: React.ElementType; title: string; items: string[]; ordered?: boolean }) {
  return (
    <div className="mb-6 last:mb-0">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="text-primary shrink-0" size={20} />
        <h3 className="text-lg font-bold text-foreground">{title}</h3>
      </div>
      {ordered ? (
        <ol className="list-decimal pr-6 space-y-2 text-foreground/80 leading-[1.9] text-sm">
          {items.map((it, i) => (<li key={i}>{it}</li>))}
        </ol>
      ) : (
        <ul className="space-y-2">
          {items.map((it, i) => (
            <li key={i} className="flex items-start gap-2 text-foreground/80 text-sm leading-[1.9]">
              <CheckCircle2 className="text-accent shrink-0 mt-1" size={16} />
              <span>{it}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function RegistrationBlock({ info }: { info: RegistrationInfo }) {
  return (
    <div className="bg-card rounded-xl shadow-lg p-6 md:p-8 border border-border/50 mb-8">
      <h2 className="text-2xl font-bold text-foreground mb-2">إجراءات القيد والتسجيل</h2>
      <p className="text-sm text-muted-foreground mb-6">
        فرع سورية – جامعة أفريقيا الفرنسية العربية. الشروط والوثائق وخطوات القيد المعتمدة.
      </p>

      {info.conditions && <RegSection icon={ListChecks} title={info.conditions.title} items={info.conditions.items} />}
      {info.documents && <RegSection icon={FileText} title={info.documents.title} items={info.documents.items} />}
      {info.steps && <RegSection icon={ClipboardList} title={info.steps.title} items={info.steps.items} ordered />}
      {info.applyMethods && <RegSection icon={Globe} title={info.applyMethods.title} items={info.applyMethods.items} />}
      {info.upgrade && <RegSection icon={GraduationCap} title={info.upgrade.title} items={info.upgrade.items} ordered />}
      {info.completion && <RegSection icon={CheckCircle2} title={info.completion.title} items={info.completion.items} />}

      {info.notes && info.notes.length > 0 && (
        <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg text-sm text-foreground/80 leading-[1.9]">
          <strong className="text-primary block mb-2">ملاحظات:</strong>
          <ul className="list-disc pr-5 space-y-1">
            {info.notes.map((n, i) => (<li key={i}>{n}</li>))}
          </ul>
          <p className="mt-3">
            للاستفسار عن الرسوم تفضل بزيارة <Link to="/tuition-fees" className="text-primary font-semibold hover:underline">صفحة الرسوم والتسجيل</Link> أو <Link to="/contact" className="text-primary font-semibold hover:underline">تواصل معنا</Link>.
          </p>
        </div>
      )}
    </div>
  );
}
