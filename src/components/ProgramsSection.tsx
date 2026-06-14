import { GraduationCap, BookOpen, Award, FlaskConical, FileText, Microscope, type LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSiteContent } from "@/hooks/use-site-content";

const iconMap: Record<string, LucideIcon> = {
  GraduationCap, BookOpen, Award, FlaskConical, FileText, Microscope,
};

type Program = { id: string; title: string; description: string; icon_name: string };

export default function ProgramsSection() {
  const { ref, isVisible } = useScrollReveal();
  const [programs, setPrograms] = useState<Program[]>([]);
  const { get } = useSiteContent();
  const title = get("programs_section_title", "البرامج");
  const subtitle = get("programs_section_subtitle", "");
  const moreLabel = get("programs_section_more_label", "للمزيد ←");

  useEffect(() => {
    supabase.from("programs").select("id, title, description, icon_name").order("sort_order").then(({ data }) => {
      if (data) setPrograms(data);
    });
  }, []);

  return (
    <section id="programs" className="section-padding" ref={ref}>
      <div className="container mx-auto">
        <div className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`} style={{ transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)" }}>
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-2 text-center">{title}</h2>
          <div className="w-16 h-1 bg-accent mx-auto mb-3 rounded-full" />
          {subtitle && <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-10">{subtitle}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((prog, i) => {
            const Icon = iconMap[prog.icon_name] || GraduationCap;
            return (
              <div
                key={prog.id}
                className={`group bg-card rounded-lg p-6 border shadow-sm hover:shadow-md transition-all duration-500 hover:-translate-y-1 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
                style={{ transitionDelay: isVisible ? `${150 + i * 80}ms` : "0ms", transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)" }}
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Icon className="text-primary" size={24} />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{prog.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{prog.description}</p>
                <Link to="/contact" className="inline-block mt-4 text-sm font-medium text-accent hover:underline">{moreLabel}</Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
