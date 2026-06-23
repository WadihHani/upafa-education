import { GraduationCap, BookOpen, Mail, FileSearch, Library, Users } from "lucide-react";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import EditableText from "@/components/editor/EditableText";

const systems = [
  { label: "تسجيل الطالب", sub: "Student Portal", icon: GraduationCap, color: "hsl(215, 65%, 35%)", href: "/portal" },
  { label: "نظام التعلم", sub: "", icon: BookOpen, color: "hsl(43, 90%, 52%)", href: "/portal" },
  { label: "البريد الجامعي", sub: "University Email", icon: Mail, color: "hsl(0, 65%, 50%)", href: "/portal" },
  { label: "المكتبة الرقمية", sub: "E-Library", icon: Library, color: "hsl(160, 55%, 40%)", href: "/publications" },
  { label: "الموسوعة", sub: "Pedia", icon: FileSearch, color: "hsl(280, 50%, 45%)", href: "/publications" },
  { label: "بوابة أعضاء الهيئة التدريسية", sub: "Faculty", icon: Users, color: "hsl(25, 80%, 50%)", href: "/team" },
];

export default function SystemsCards() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section ref={ref} className="py-16 md:py-24 bg-section-alt">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <EditableText
            contentKey="systems_title"
            fallback="أنظمة وخدمات الجامعة"
            as="h2"
            className="text-3xl md:text-5xl font-extrabold text-primary mb-3"
          />
          <p className="text-muted-foreground text-base md:text-lg mb-4">
            بوابات الدخول والخدمات الإلكترونية المتاحة لطلاب وأعضاء الهيئة التدريسية
          </p>
          <div className="w-24 h-1.5 bg-accent mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
          {systems.map((sys, i) => {
            const Icon = sys.icon;
            return (
              <a
                key={i}
                href={sys.href}
                onClick={() => window.scrollTo(0, 0)}
                className={`group relative bg-card rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 border border-border hover:-translate-y-1 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                }`}
                style={{ transitionDelay: isVisible ? `${i * 80}ms` : "0ms" }}
              >
                {/* Top color bar */}
                <div className="h-2 w-full" style={{ backgroundColor: sys.color }} />
                <div className="p-6 flex flex-col items-center text-center">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: `${sys.color}18`, color: sys.color }}
                  >
                    <Icon size={38} />
                  </div>
                  <h3 className="text-base font-bold text-foreground mb-1">{sys.label}</h3>
                  <p className="text-[11px] text-muted-foreground tracking-wide">{sys.sub}</p>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
