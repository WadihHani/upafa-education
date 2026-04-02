import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import ConferencesSection from "@/components/ConferencesSection";
import ProgramsSection from "@/components/ProgramsSection";
import PortalSection from "@/components/PortalSection";
import PublicationsSection from "@/components/PublicationsSection";
import ContactSection from "@/components/ContactSection";
import PaymentSection from "@/components/PaymentSection";
import TeamSection from "@/components/TeamSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <AboutSection />
      <ConferencesSection />
      <ProgramsSection />
      <PortalSection />
      <PublicationsSection />
      <TeamSection />
      <ContactSection />
      <PaymentSection />
      <Footer />
    </div>
  );
};

export default Index;
