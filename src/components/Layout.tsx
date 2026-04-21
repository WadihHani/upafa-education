import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import SocialFloat from "./SocialFloat";

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <SocialFloat />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
