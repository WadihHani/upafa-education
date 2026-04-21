import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import SystemsCards from "@/components/SystemsCards";
import VisionSection from "@/components/VisionSection";
import SocialFloat from "@/components/SocialFloat";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <SocialFloat />
      <main className="flex-1">
        <HeroSection />
        <SystemsCards />
        <VisionSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
