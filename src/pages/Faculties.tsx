import { GraduationCap, Scale, Briefcase, BookOpen, Cpu, Baby, type LucideIcon } from "lucide-react";
import Seo from "@/components/Seo";
import EditableText from "@/components/editor/EditableText";
import { useSiteContent } from "@/hooks/use-site-content";

const ICONS: LucideIcon[] = [BookOpen, Scale, Briefcase, GraduationCap, Cpu, Baby];
const COLORS = [
  "from-amber-500 to-orange-600",
  "from-emerald-500 to-teal-600",
  "from-sky-500 to-blue-600",
  "from-violet-500 to-purple-600",
  "from-rose-500 to-pink-600",
  "from-cyan-500 to-sky-600",
];

const DEFAULT_LIST = [
  "كلية الآداب|اللغة العربية وآدابها,اللغة الإنكليزية وآدابها,الترجمة,الإعلام والاتصال",
  "كلية الشريعة والقانون|الشريعة الإسلامية,القانون,العلوم الشرعية,الفقه المقارن",
  "كلية العلوم الإدارية|إدارة الأعمال,المحاسبة,التسويق,الاقتصاد",
  "كلية العلوم التربوية|تربية الطفل,علم النفس التربوي,المناهج وطرائق التدريس,الإرشاد النفسي",
  "كلية العلوم التقنية|علوم الحاسوب,هندسة المعلوماتية,الذكاء الاصطناعي,الأمن السيبراني",
  "كلية تربية الأطفال|رياض الأطفال,تعليم مبكر,تنمية الطفل,التربية الخاصة",
].join("\n");

export default function Faculties() {
  const { get } = useSiteContent();
  const list = get("faculties_list", DEFAULT_LIST)
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const [name, deps = ""] = l.split("|");
      return { name: name.trim(), departments: deps.split(",").map((d) => d.trim()).filter(Boolean) };
    });

  return (
    <>
      <Seo
        title="الكليات والتخصصات | UPAFA سوريا"
        description="كليات جامعة أفريقيا الفرنسية العربية: الآداب، الشريعة، العلوم الإدارية والتربوية، العلوم التقنية، والطفولة المبكرة."
        path="/faculties"
      />
      <section className="py-16 bg-[hsl(var(--section-alt))]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <EditableText contentKey="faculties_eyebrow" fallback="جامعة أفريقيا" as="p" className="text-sm font-semibold text-accent tracking-wider mb-2" />
            <EditableText contentKey="faculties_title" fallback="الكليات والتخصصات" as="h1" className="text-3xl md:text-4xl font-bold text-foreground" />
            <div className="w-16 h-1 bg-accent mx-auto mt-4 rounded-full" />
            <EditableText
              contentKey="faculties_intro"
              fallback="تضم الجامعة مجموعة من الكليات الأكاديمية المتنوعة التي تغطي مختلف ميادين المعرفة وتلبي احتياجات سوق العمل المعاصر."
              as="p"
              className="text-foreground/70 max-w-2xl mx-auto mt-6 leading-[2]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {list.map((f, i) => {
              const Icon = ICONS[i % ICONS.length];
              const color = COLORS[i % COLORS.length];
              return (
                <div key={f.name + i} className="bg-card rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow border border-border/50">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4`}>
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
    </>
  );
}
