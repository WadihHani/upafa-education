import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import HomeIntro from "@/components/HomeIntro";
import AnnouncementsBoard from "@/components/AnnouncementsBoard";
import SystemsCards from "@/components/SystemsCards";
import VisionSection from "@/components/VisionSection";
import SocialFloat from "@/components/SocialFloat";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import EditModeBar from "@/components/editor/EditModeBar";
import SectionGate from "@/components/SectionGate";
import AnnouncementBar from "@/components/AnnouncementBar";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Seo
        title="جامعة أفريقيا الفرنسية العربية | UPAFA Syria – الموقع الرسمي"
        description="الموقع الرسمي لجامعة أفريقيا الفرنسية العربية (UPAFA Syria) في دمشق. تقدّم جامعة أفريقيا الفرنسية العربية برامج بكالوريوس وماجستير ودكتوراه معتمدة بنظام التعليم عن بعد."
        path="/"
      />
      <EditModeBar />
      <AnnouncementBar />
      <Navbar />
      <SocialFloat />
      <main className="flex-1">
        <SectionGate sectionKey="section_hero"><HeroSection /></SectionGate>
        <SectionGate sectionKey="section_home_intro"><HomeIntro /></SectionGate>
        <SectionGate sectionKey="section_announcements"><AnnouncementsBoard /></SectionGate>
        <SectionGate sectionKey="section_systems"><SystemsCards /></SectionGate>
        <SectionGate sectionKey="section_vision"><VisionSection /></SectionGate>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
