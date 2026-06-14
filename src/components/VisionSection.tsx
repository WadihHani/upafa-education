import { Eye, Target, Crosshair } from "lucide-react";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import EditableText from "@/components/editor/EditableText";

export default function VisionSection() {
  const { ref, isVisible } = useScrollReveal();

  const cards = [
    { icon: Eye, key: "about_vision", titleFallback: "رؤيتنا" },
    { icon: Target, key: "about_mission", titleFallback: "رسالتنا" },
    { icon: Crosshair, key: "about_values", titleFallback: "قيمنا" },
  ];

  return (
    <section ref={ref} className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary via-[hsl(215,65%,25%)] to-primary" />
      <div className="absolute top-0 left-0 right-0 h-1 bg-accent" />
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-accent" />

      <div className="relative z-10 container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cards.map((card, i) => {
            const Icon = card.icon;
            return (
              <div
                key={i}
                className={`bg-card/95 backdrop-blur-sm rounded-2xl p-8 text-center shadow-xl transition-all duration-700 hover:-translate-y-2 hover:shadow-2xl ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                style={{ transitionDelay: isVisible ? `${i * 150}ms` : "0ms", transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)" }}
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
                  <Icon className="text-primary" size={32} />
                </div>
                <EditableText
                  contentKey={card.key}
                  field="title"
                  fallback={card.titleFallback}
                  as="h3"
                  className="text-2xl font-extrabold text-primary mb-4"
                />
                <EditableText
                  contentKey={card.key}
                  field="content"
                  fallback=""
                  as="p"
                  className="text-foreground/75 leading-[2] text-sm"
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
