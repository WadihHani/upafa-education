import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import HomeIntro from "@/components/HomeIntro";
import AnnouncementsBoard from "@/components/AnnouncementsBoard";
import SystemsCards from "@/components/SystemsCards";
import VisionSection from "@/components/VisionSection";
import SocialFloat from "@/components/SocialFloat";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Seo
        title="جامعة أفريقيا الفرنسية العربية – فرع سوريا | UPAFA Syria – الموقع الرسمي"
        description="الموقع الرسمي لجامعة أفريقيا الفرنسية العربية – فرع سوريا (UPAFA Syria) في دمشق. تقدّم جامعة أفريقيا الفرنسية العربية – فرع سوريا برامج بكالوريوس وماجستير ودكتوراه معتمدة بنظام التعليم عن بعد."
        path="/"
      />
      <Navbar />
      <SocialFloat />
      <main className="flex-1">
        <HeroSection />
        <HomeIntro />
        <AnnouncementsBoard />
        <SystemsCards />
        <VisionSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
