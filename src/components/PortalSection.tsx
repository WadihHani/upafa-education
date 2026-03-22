import { Users, BookOpenCheck, Shield } from "lucide-react";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

const portals = [
  {
    icon: Users,
    title: "بوابة الطلاب",
    desc: "تسجيل الدخول إلى حسابك الطلابي للوصول إلى المواد الدراسية والنتائج والموارد التعليمية.",
    href: "#",
  },
  {
    icon: BookOpenCheck,
    title: "بوابة المعلمين",
    desc: "منصة المعلمين لإدارة الدروس وتحميل المواد وعرض نتائج الطلاب.",
    href: "#",
  },
  {
    icon: Shield,
    title: "بوابة الإدارة",
    desc: "نظام الإدارة للتحكم في العمليات الأكاديمية والإدارية للجامعة.",
    href: "#",
  },
];

export default function PortalSection() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section id="portal" className="section-padding section-alt-bg" ref={ref}>
      <div className="container mx-auto">
        <div
          className={`transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
          }`}
          style={{ transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)" }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-2 text-center">البوابة</h2>
          <div className="w-16 h-1 bg-accent mx-auto mb-12 rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {portals.map((p, i) => {
            const Icon = p.icon;
            return (
              <div
                key={i}
                className={`bg-card rounded-lg p-8 border text-center shadow-sm hover:shadow-md transition-all duration-500 hover:-translate-y-1 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
                }`}
                style={{
                  transitionDelay: isVisible ? `${200 + i * 100}ms` : "0ms",
                  transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)",
                }}
              >
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Icon className="text-primary" size={26} />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{p.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">{p.desc}</p>
                <a
                  href={p.href}
                  className="inline-block bg-primary text-primary-foreground px-5 py-2.5 rounded-md text-sm font-medium hover:brightness-110 active:scale-[0.97] transition-all duration-200"
                >
                  تسجيل الدخول
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
