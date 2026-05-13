import PublicationsSection from "@/components/PublicationsSection";
import Seo from "@/components/Seo";

const Publications = () => (
  <div>
    <Seo
      title="المنشورات والأبحاث | UPAFA سوريا"
      description="اطلع على المنشورات الأكاديمية والأبحاث العلمية الصادرة عن جامعة أفريقيا الفرنسية العربية – فرع سوريا."
      path="/publications"
    />
    <PublicationsSection />
  </div>
);

export default Publications;
