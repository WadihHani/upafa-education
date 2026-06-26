import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { EditModeProvider } from "@/contexts/EditModeContext";
import ThemeColorsApplier from "@/components/ThemeColorsApplier";
import Layout from "./components/Layout";
import AdminLayout from "./components/AdminLayout";
import Index from "./pages/Index";
import About from "./pages/About";
import Programs from "./pages/Programs";
import Portal from "./pages/Portal";
import StudentPortal from "./pages/StudentPortal";
import TeacherPortal from "./pages/TeacherPortal";
import TeacherCourses from "./pages/teacher/TeacherCourses";
import TeacherStudents from "./pages/teacher/TeacherStudents";
import TeacherMaterials from "./pages/teacher/TeacherMaterials";
import TeacherAssessments from "./pages/teacher/TeacherAssessments";
import TeacherGrades from "./pages/teacher/TeacherGrades";
import TeacherAttendance from "./pages/teacher/TeacherAttendance";
import TeacherMeetings from "./pages/teacher/TeacherMeetings";
import StudentCourses from "./pages/student/StudentCourses";
import Publications from "./pages/Publications";

import Conferences from "./pages/Conferences";
import Contact from "./pages/Contact";
import Faculties from "./pages/Faculties";
import FacultyDetail from "./pages/FacultyDetail";
import AdminKuliyat from "./pages/admin/AdminKuliyat";
import Tuition from "./pages/Tuition";
import TuitionFees from "./pages/TuitionFees";
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
import AdminEnrollments from "./pages/admin/AdminEnrollments";
import AdminCourses from "./pages/admin/AdminCourses";
import AdminMofadlaPrograms from "./pages/admin/AdminMofadlaPrograms";
import AdminMofadlaApplications from "./pages/admin/AdminMofadlaApplications";
import AdminMofadlaQuickRegistrations from "./pages/admin/AdminMofadlaQuickRegistrations";
import AdminMofadlaContent from "./pages/admin/AdminMofadlaContent";
import StudentCatalog from "./pages/student/StudentCatalog";
import MofadlaApply from "./pages/MofadlaApply";
import Mofadla from "./pages/Mofadla";
import NewsCategory from "./pages/NewsCategory";
import NewsPost from "./pages/NewsPost";
import AdminNewsCategories from "./pages/admin/AdminNewsCategories";
import AdminNewsPosts from "./pages/admin/AdminNewsPosts";
import AdminDnsStatus from "./pages/admin/AdminDnsStatus";
import AdminStudentNotes from "./pages/admin/AdminStudentNotes";
import AdminNavigation from "./pages/admin/AdminNavigation";
import AdminPageSeo from "./pages/admin/AdminPageSeo";
import AdminThemeEditor from "./pages/admin/AdminThemeEditor";
import AdminTeacherMeeting from "./pages/admin/AdminTeacherMeeting";
import AdminSearch from "./pages/admin/AdminSearch";
import AdminContactSubmissions from "./pages/admin/AdminContactSubmissions";
import NotFound from "./pages/NotFound";
import Unsubscribe from "./pages/Unsubscribe";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <EditModeProvider>
          <ThemeColorsApplier />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route element={<Layout />}>
              <Route path="/about" element={<About />} />
              <Route path="/programs" element={<Programs />} />
              <Route path="/programs/:level" element={<ProgramLevel />} />
              <Route path="/faculties" element={<Faculties />} />
              <Route path="/faculties/:slug" element={<FacultyDetail />} />
              <Route path="/tuition" element={<Tuition />} />
              <Route path="/tuition-fees" element={<TuitionFees />} />
              <Route path="/faq" element={<Faq />} />
              <Route path="/portal" element={<Portal />} />
              <Route path="/publications" element={<Publications />} />
              
              <Route path="/conferences" element={<Conferences />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/mofadla" element={<Mofadla />} />
              <Route path="/news/:categoryKey" element={<NewsCategory />} />
              <Route path="/news/:categoryKey/:postId" element={<NewsPost />} />
            </Route>
            <Route path="/mofadla/apply" element={<MofadlaApply />} />
            <Route path="/unsubscribe" element={<Unsubscribe />} />
            <Route path="/portal/student" element={<StudentPortal />} />
            <Route path="/portal/student/catalog" element={<StudentCatalog />} />
            <Route path="/portal/student/courses" element={<StudentCourses />} />
            <Route path="/portal/teacher" element={<TeacherPortal />} />
            <Route path="/portal/teacher/courses" element={<TeacherCourses />} />
            <Route path="/portal/teacher/students" element={<TeacherStudents />} />
            <Route path="/portal/teacher/materials" element={<TeacherMaterials />} />
            <Route path="/portal/teacher/meetings" element={<TeacherMeetings />} />
            <Route path="/portal/teacher/assessments" element={<TeacherAssessments />} />
            <Route path="/portal/teacher/grades" element={<TeacherGrades />} />
            <Route path="/portal/teacher/attendance" element={<TeacherAttendance />} />
            <Route path="/login" element={<AdminLogin />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="conferences" element={<AdminConferences />} />
              <Route path="programs" element={<AdminPrograms />} />
              <Route path="kuliyat" element={<AdminKuliyat />} />
              <Route path="content" element={<AdminContent />} />
              <Route path="hero" element={<AdminHero />} />
              <Route path="portal" element={<AdminPortal />} />
              <Route path="enrollments" element={<AdminEnrollments />} />
              <Route path="courses" element={<AdminCourses />} />
              <Route path="mofadla" element={<AdminMofadlaContent />} />
              <Route path="mofadla/programs" element={<AdminMofadlaPrograms />} />
              <Route path="mofadla/applications" element={<AdminMofadlaApplications />} />
              <Route path="mofadla/registrations" element={<AdminMofadlaQuickRegistrations />} />
              <Route path="news" element={<AdminNewsCategories />} />
              <Route path="news/:categoryId/posts" element={<AdminNewsPosts />} />
              <Route path="site-content" element={<AdminSiteContent />} />
              <Route path="dns-status" element={<AdminDnsStatus />} />
              <Route path="student-notes" element={<AdminStudentNotes />} />
              <Route path="navigation" element={<AdminNavigation />} />
              <Route path="page-seo" element={<AdminPageSeo />} />
              <Route path="theme-editor" element={<AdminThemeEditor />} />
              <Route path="teacher-meeting" element={<AdminTeacherMeeting />} />
              <Route path="search" element={<AdminSearch />} />
              <Route path="contact-submissions" element={<AdminContactSubmissions />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
          </EditModeProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
