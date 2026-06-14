import PortalLoginCard from "@/components/PortalLoginCard";
import EditableText from "@/components/editor/EditableText";

const Portal = () => {
  return (
    <section className="section-padding section-alt-bg min-h-[60vh]">
      <div className="container mx-auto">
        <div className="text-center mb-10">
          <EditableText contentKey="portal_page_title" fallback="البوابة" as="h1" className="text-3xl md:text-4xl font-bold text-primary mb-2" />
          <div className="w-16 h-1 bg-accent mx-auto rounded-full" />
          <EditableText contentKey="portal_page_subtitle" fallback="" as="p" className="text-muted-foreground mt-4 max-w-xl mx-auto" />
        </div>
        <div className="max-w-md mx-auto">
          <PortalLoginCard />
        </div>
      </div>
    </section>
  );
};

export default Portal;
