import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { useSiteContent } from "@/hooks/use-site-content";

export default function PublicationsSection() {
  const { ref, isVisible } = useScrollReveal();
  const { get, getTitle } = useSiteContent();

  return (
    <section id="publications" className="section-padding" ref={ref}>
      <div className="container mx-auto text-center">
        <div
          className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
          style={{ transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)" }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-2">{getTitle("publications_text", "المنشورات")}</h2>
          <div className="w-16 h-1 bg-accent mx-auto mb-8 rounded-full" />
          <p className="max-w-2xl mx-auto text-foreground/75 leading-[2] text-base mb-8">{get("publications_text", "")}</p>
          <a href="#" className="inline-block bg-accent text-accent-foreground px-8 py-3 rounded-md font-bold text-base hover:brightness-110 active:scale-[0.97] transition-all duration-200">تصفح المنشورات</a>
        </div>
      </div>
    </section>
  );
}
