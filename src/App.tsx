import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Layout from "./components/Layout";
import AdminLayout from "./components/AdminLayout";
import Index from "./pages/Index";
import About from "./pages/About";
import Programs from "./pages/Programs";
import Portal from "./pages/Portal";
import StudentPortal from "./pages/StudentPortal";
import TeacherPortal from "./pages/TeacherPortal";
import Publications from "./pages/Publications";

import Conferences from "./pages/Conferences";
import Contact from "./pages/Contact";
import Faculties from "./pages/Faculties";
import Tuition from "./pages/Tuition";
import Faq from "./pages/Faq";
import ProgramLevel from "./pages/ProgramLevel";
import AdminLogin from "./pages/AdminLogin";
import Dashboard from "./pages/admin/Dashboard";
import AdminConferences from "./pages/admin/AdminConferences";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminPrograms from "./pages/admin/AdminPrograms";
import AdminContent from "./pages/admin/AdminContent";
import AdminHero from "./pages/admin/AdminHero";
import AdminPortal from "./pages/admin/AdminPortal";
import AdminSiteContent from "./pages/admin/AdminSiteContent";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route element={<Layout />}>
              <Route path="/about" element={<About />} />
              <Route path="/programs" element={<Programs />} />
              <Route path="/programs/:level" element={<ProgramLevel />} />
              <Route path="/faculties" element={<Faculties />} />
              <Route path="/tuition" element={<Tuition />} />
              <Route path="/faq" element={<Faq />} />
              <Route path="/portal" element={<Portal />} />
              <Route path="/publications" element={<Publications />} />
              
              <Route path="/conferences" element={<Conferences />} />
              <Route path="/contact" element={<Contact />} />
            </Route>
            <Route path="/portal/student" element={<StudentPortal />} />
            <Route path="/portal/teacher" element={<TeacherPortal />} />
            <Route path="/login" element={<AdminLogin />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="conferences" element={<AdminConferences />} />
              <Route path="programs" element={<AdminPrograms />} />
              <Route path="content" element={<AdminContent />} />
              <Route path="hero" element={<AdminHero />} />
              <Route path="portal" element={<AdminPortal />} />
              <Route path="site-content" element={<AdminSiteContent />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
