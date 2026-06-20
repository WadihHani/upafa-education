import AboutSection from "@/components/AboutSection";
import Seo from "@/components/Seo";

const About = () => (
  <div>
    <Seo
      title="عن جامعة UPAFA سوريا | نبذة ورسالة الجامعة"
      description="تعرّف على جامعة أفريقيا الفرنسية العربية: التأسيس، الرسالة، الرؤية، والاعتماد الأكاديمي للجامعة الأم."
      path="/about"
    />
    <AboutSection />
  </div>
);

export default About;
