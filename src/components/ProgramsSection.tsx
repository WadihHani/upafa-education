import { GraduationCap, BookOpen, Award, FlaskConical, FileText, Microscope } from "lucide-react";
import { Link } from "react-router-dom";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

const programs = [
  {
    icon: GraduationCap,
    title: "بكالوريوس (كامل)",
    desc: "برامج تجمع بين الأصالة المعرفية المستمدة من التراث الإسلامي وأحدث المنهجيات في العلوم الحديثة والتكنولوجيا الأكاديمية.",
  },
  {
    icon: BookOpen,
    title: "بكالوريوس (تكميلي)",
    desc: "برامج تكميلية تهدف إلى تعزيز وتوسيع المعرفة والمهارات في تخصصات معينة للخريجين أو العاملين في المجال.",
  },
  {
    icon: Award,
    title: "الدبلوم العالي",
    desc: "برامج دبلوم متخصصة في الدراسات العليا توفر معرفة متقدمة في مجالات محددة، وتؤهل للترقية الوظيفية.",
  },
  {
    icon: FileText,
    title: "الماجستير بالرسالة",
    desc: "برامج تركز على البحث العلمي الأصيل، حيث يطور الطالب مهارات البحث المتقدم ويكتسب خبرة عملية.",
  },
  {
    icon: FlaskConical,
    title: "الماجستير بالدراسة والبحث",
    desc: "برامج تعتمد على المقررات الدراسية مع مشروع بحثي، وتوفر تكويناً أكاديمياً ومهنياً متميزاً.",
  },
  {
    icon: Microscope,
    title: "الدكتوراه",
    desc: "برامج بحثية متقدّمة تجعل الدارس حاملاً للقب دكتوراه في المجال الذي يختاره، وتؤهله للإسهام في الابتكار.",
  },
];

export default function ProgramsSection() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section id="programs" className="section-padding" ref={ref}>
      <div className="container mx-auto">
        <div
          className={`transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
          }`}
          style={{ transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)" }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-2 text-center">البرامج</h2>
          <div className="w-16 h-1 bg-accent mx-auto mb-12 rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((prog, i) => {
            const Icon = prog.icon;
            return (
              <div
                key={i}
                className={`group bg-card rounded-lg p-6 border shadow-sm hover:shadow-md transition-all duration-500 hover:-translate-y-1 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
                }`}
                style={{
                  transitionDelay: isVisible ? `${150 + i * 80}ms` : "0ms",
                  transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)",
                }}
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Icon className="text-primary" size={24} />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{prog.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{prog.desc}</p>
                <Link
                  to="/contact"
                  className="inline-block mt-4 text-sm font-medium text-accent hover:underline"
                >
                  للمزيد ←
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
