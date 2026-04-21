import { useParams, Link } from "react-router-dom";
import { GraduationCap, Clock, BookOpen, CheckCircle2 } from "lucide-react";

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
    duration: "سنتان دراسيتان",
    description:
      "برنامج الماجستير يهدف إلى تعميق المعرفة التخصصية وتطوير مهارات البحث العلمي لدى الطلاب، ويتضمن مقررات متقدمة بالإضافة إلى رسالة بحثية تحت إشراف أكاديميين متخصصين.",
    highlights: [
      "مقررات متقدمة في التخصص",
      "إشراف أكاديمي مباشر",
      "رسالة ماجستير بحثية",
      "ندوات ومؤتمرات علمية",
      "إمكانية النشر في المجلات المحكمة",
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
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-10">
          <p className="text-sm font-semibold text-accent tracking-wider mb-2">{info.subtitle}</p>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">{info.title}</h1>
          <div className="w-16 h-1 bg-accent mx-auto mt-4 rounded-full" />
        </div>

        <div className="bg-card rounded-xl shadow-lg p-8 border border-border/50 mb-8">
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

        <div className="text-center">
          <Link to="/contact" className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
            تواصل معنا للتسجيل
          </Link>
        </div>
      </div>
    </section>
  );
}
