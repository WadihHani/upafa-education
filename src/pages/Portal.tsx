import PortalLoginCard from "@/components/PortalLoginCard";
import { useSiteContent } from "@/hooks/use-site-content";

const Portal = () => {
  const { get } = useSiteContent();
  const title = get("portal_page_title", "البوابة");
  const subtitle = get("portal_page_subtitle", "");
  return (
    <section className="section-padding section-alt-bg min-h-[60vh]">
      <div className="container mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">{title}</h1>
          <div className="w-16 h-1 bg-accent mx-auto rounded-full" />
          {subtitle && <p className="text-muted-foreground mt-4 max-w-xl mx-auto">{subtitle}</p>}
        </div>
        <div className="max-w-md mx-auto">
          <PortalLoginCard />
        </div>
      </div>
    </section>
  );
};

export default Portal;
