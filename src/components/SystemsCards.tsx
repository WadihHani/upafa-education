import { GraduationCap, BookOpen, Mail, FileSearch, Library, Users } from "lucide-react";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

const systems = [
  { label: "بوابة الطلاب", sub: "Student Portal", icon: GraduationCap, color: "hsl(215, 65%, 35%)", href: "/portal" },
  { label: "نظام التعلم", sub: "", icon: BookOpen, color: "hsl(43, 90%, 52%)", href: "/portal" },
  { label: "البريد الجامعي", sub: "University Email", icon: Mail, color: "hsl(0, 65%, 50%)", href: "/portal" },
  { label: "المكتبة الرقمية", sub: "E-Library", icon: Library, color: "hsl(160, 55%, 40%)", href: "/publications" },
  { label: "الموسوعة", sub: "Pedia", icon: FileSearch, color: "hsl(280, 50%, 45%)", href: "/publications" },
  { label: "بوابة أعضاء الهيئة التدريسية", sub: "Faculty", icon: Users, color: "hsl(25, 80%, 50%)", href: "/team" },
];

export default function SystemsCards() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section ref={ref} className="py-12 md:py-16 bg-section-alt">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-extrabold text-primary mb-2">أنظمة وخدمات الجامعة</h2>
          <div className="w-16 h-1 bg-accent mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {systems.map((sys, i) => {
            const Icon = sys.icon;
            return (
              <a
                key={i}
                href={sys.href}
                onClick={() => window.scrollTo(0, 0)}
                className={`group relative bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-border ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                }`}
                style={{ transitionDelay: isVisible ? `${i * 80}ms` : "0ms" }}
              >
                {/* Top color bar */}
                <div className="h-1.5 w-full" style={{ backgroundColor: sys.color }} />
                <div className="p-5 flex flex-col items-center text-center">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: `${sys.color}15`, color: sys.color }}
                  >
                    <Icon size={28} />
                  </div>
                  <h3 className="text-sm font-bold text-foreground mb-0.5">{sys.label}</h3>
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
