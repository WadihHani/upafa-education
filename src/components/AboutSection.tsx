import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { CheckCircle } from "lucide-react";
import { useSiteContent } from "@/hooks/use-site-content";

export default function AboutSection() {
  const { ref, isVisible } = useScrollReveal();
  const { get, getTitle } = useSiteContent();

  const valuesStr = get("about_values", "الجودة والتميز,النزاهة والمسؤولية,الابتكار والتطوير,الانفتاح الثقافي,الشراكة والتعاون الدولي");
  const values = valuesStr.split(",").map((v) => v.trim()).filter(Boolean);

  return (
    <section id="about" className="section-padding section-alt-bg" ref={ref}>
      <div className="container mx-auto">
        <div
          className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
          style={{ transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)" }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-2 text-center" style={{ textWrap: "balance" }}>
            {getTitle("about_intro", "من نحن")}
          </h2>
          <div className="w-16 h-1 bg-accent mx-auto mb-10 rounded-full" />

          <div className="max-w-4xl mx-auto">
            <p className="text-foreground/80 leading-[2] text-base mb-10">
              {get("about_intro", "")}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              <div
                className={`bg-card rounded-lg p-6 shadow-sm border transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-5"}`}
                style={{ transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)" }}
              >
                <h4 className="text-lg font-bold text-primary mb-3">{getTitle("about_vision", "رؤيتنا")}</h4>
                <p className="text-foreground/75 text-sm leading-[2]">{get("about_vision", "")}</p>
              </div>

              <div
                className={`bg-card rounded-lg p-6 shadow-sm border transition-all duration-700 delay-300 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-5"}`}
                style={{ transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)" }}
              >
                <h4 className="text-lg font-bold text-primary mb-3">{getTitle("about_mission", "رسالتنا")}</h4>
                <p className="text-foreground/75 text-sm leading-[2]">{get("about_mission", "")}</p>
              </div>
            </div>

            <div
              className={`bg-card rounded-lg p-6 shadow-sm border transition-all duration-700 delay-400 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
              style={{ transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)" }}
            >
              <h4 className="text-lg font-bold text-primary mb-4">{getTitle("about_values", "قيمنا")}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {values.map((value, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle className="text-accent shrink-0" size={18} />
                    <span className="text-foreground/75 text-sm font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
