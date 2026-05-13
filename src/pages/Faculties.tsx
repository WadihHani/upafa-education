import { GraduationCap, Scale, Briefcase, BookOpen, Cpu, Baby } from "lucide-react";
import Seo from "@/components/Seo";

const faculties = [
  {
    icon: BookOpen,
    name: "كلية الآداب",
    color: "from-amber-500 to-orange-600",
    departments: ["اللغة العربية وآدابها", "اللغة الإنكليزية وآدابها", "الترجمة", "الإعلام والاتصال"],
  },
  {
    icon: Scale,
    name: "كلية الشريعة والقانون",
    color: "from-emerald-500 to-teal-600",
    departments: ["الشريعة الإسلامية", "القانون", "العلوم الشرعية", "الفقه المقارن"],
  },
  {
    icon: Briefcase,
    name: "كلية العلوم الإدارية",
    color: "from-sky-500 to-blue-600",
    departments: ["إدارة الأعمال", "المحاسبة", "التسويق", "الاقتصاد"],
  },
  {
    icon: GraduationCap,
    name: "كلية العلوم التربوية",
    color: "from-violet-500 to-purple-600",
    departments: ["تربية الطفل", "علم النفس التربوي", "المناهج وطرائق التدريس", "الإرشاد النفسي"],
  },
  {
    icon: Cpu,
    name: "كلية العلوم التقنية",
    color: "from-rose-500 to-pink-600",
    departments: ["علوم الحاسوب", "هندسة المعلوماتية", "الذكاء الاصطناعي", "الأمن السيبراني"],
  },
  {
    icon: Baby,
    name: "كلية تربية الأطفال",
    color: "from-cyan-500 to-sky-600",
    departments: ["رياض الأطفال", "تعليم مبكر", "تنمية الطفل", "التربية الخاصة"],
  },
];

export default function Faculties() {
  return (
    <section className="py-16 bg-[hsl(var(--section-alt))]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-accent tracking-wider mb-2">جامعة أفريقيا – فرع سوريا</p>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">الكليات والتخصصات</h1>
          <div className="w-16 h-1 bg-accent mx-auto mt-4 rounded-full" />
          <p className="text-foreground/70 max-w-2xl mx-auto mt-6 leading-[2]">
            تضم الجامعة مجموعة من الكليات الأكاديمية المتنوعة التي تغطي مختلف ميادين المعرفة وتلبي احتياجات سوق العمل المعاصر.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {faculties.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.name} className="bg-card rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow border border-border/50">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4`}>
                  <Icon className="text-white" size={28} />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{f.name}</h3>
                <ul className="space-y-2">
                  {f.departments.map((d) => (
                    <li key={d} className="text-sm text-foreground/70 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
