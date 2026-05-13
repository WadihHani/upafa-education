import ProgramsSection from "@/components/ProgramsSection";
import Seo from "@/components/Seo";

const Programs = () => (
  <div>
    <Seo
      title="البرامج الأكاديمية | UPAFA سوريا"
      description="استعرض برامج البكالوريوس والماجستير والدكتوراه المعتمدة في جامعة UPAFA – فرع سوريا، بنظامي الحضور والتعليم عن بعد."
      path="/programs"
    />
    <ProgramsSection />
  </div>
);

export default Programs;
