import ConferencesSection from "@/components/ConferencesSection";
import Seo from "@/components/Seo";

const Conferences = () => (
  <div>
    <Seo
      title="المؤتمرات والندوات العلمية | UPAFA سوريا"
      description="مؤتمرات وندوات وفعاليات علمية تنظمها جامعة أفريقيا الفرنسية العربية – فرع سوريا على مدار العام."
      path="/conferences"
    />
    <ConferencesSection />
  </div>
);

export default Conferences;
