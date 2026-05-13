import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
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
        title="جامعة أفريقيا الفرنسية العربية – فرع سوريا | UPAFA Syria"
        description="جامعة أفريقيا الفرنسية العربية – فرع سوريا (UPAFA Syria): تعليم عالٍ نوعي يجمع بين الأصالة والمعاصرة عبر التعليم عن بعد."
        path="/"
      />
      <Navbar />
      <SocialFloat />
      <main className="flex-1">
        <HeroSection />
        <AnnouncementsBoard />
        <SystemsCards />
        <VisionSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
