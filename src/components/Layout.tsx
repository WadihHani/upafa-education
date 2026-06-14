import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import SocialFloat from "./SocialFloat";
import WhatsAppFloat from "./WhatsAppFloat";
import EditModeBar from "./editor/EditModeBar";

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <EditModeBar />
      <Navbar />
      <SocialFloat />
      <WhatsAppFloat />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
