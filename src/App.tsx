import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import About from "./pages/About";
import Programs from "./pages/Programs";
import Portal from "./pages/Portal";
import Publications from "./pages/Publications";
import Team from "./pages/Team";
import Conferences from "./pages/Conferences";
import Contact from "./pages/Contact";
import Payment from "./pages/Payment";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route element={<Layout />}>
            <Route path="/about" element={<About />} />
            <Route path="/programs" element={<Programs />} />
            <Route path="/portal" element={<Portal />} />
            <Route path="/publications" element={<Publications />} />
            <Route path="/team" element={<Team />} />
            <Route path="/conferences" element={<Conferences />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/payment" element={<Payment />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
