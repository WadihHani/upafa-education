import PortalLoginCard from "@/components/PortalLoginCard";

const Portal = () => (
  <section className="section-padding section-alt-bg min-h-[60vh]">
    <div className="container mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">البوابة</h1>
        <div className="w-16 h-1 bg-accent mx-auto rounded-full" />
      </div>
      <div className="max-w-md mx-auto">
        <PortalLoginCard />
      </div>
    </div>
  </section>
);

export default Portal;
