import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import logo from "@/assets/logo.png";

type NavItem = {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
};

const navLinks: NavItem[] = [
  { label: "الرئيسية", href: "/" },
  { label: "عن الجامعة", href: "/about" },
  },
  { label: "المؤتمرات والندوات", href: "/conferences" },
  { label: "البرامج", href: "/programs" },
  { label: "البوابة", href: "/portal" },
  {
    label: "المنشورات",
    href: "/publications",
    children: [
      { label: "المكتبة", href: "/publications" },
      { label: "المجلات", href: "/publications" },
      { label: "المنشورات", href: "/publications" },
      { label: "المدونات", href: "/publications" },
      { label: "الأخبار", href: "/publications" },
    ],
  },
  { label: "أعضاء الهيئة الإدارية والتدريسية", href: "/team" },
  { label: "اتصل بنا", href: "/contact" },
  
];

function DesktopDropdown({ item, onClose }: { item: NavItem; onClose: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleNav = (href: string) => {
    navigate(href);
    onClose();
    window.scrollTo(0, 0);
  };

  if (!item.children) {
    return (
      <Link
        to={item.href}
        onClick={() => { onClose(); window.scrollTo(0, 0); }}
        className="px-4 py-3 text-sm font-medium text-primary-foreground/90 hover:text-accent hover:bg-primary-foreground/10 transition-colors duration-200 border-l border-primary-foreground/15 first:border-l-0"
      >
        {item.label}
      </Link>
    );
  }

  return (
    <div ref={ref} className="relative border-l border-primary-foreground/15">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-4 py-3 text-sm font-medium text-primary-foreground/90 hover:text-accent hover:bg-primary-foreground/10 transition-colors duration-200"
      >
        {item.label}
        <ChevronDown size={12} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-0 w-44 bg-card border rounded-b-md shadow-lg py-1 z-50 animate-fade-in">
          {item.children.map((child, i) => (
            <button
              key={i}
              onClick={() => { setOpen(false); handleNav(child.href); }}
              className="block w-full text-right px-4 py-2.5 text-sm text-foreground hover:bg-muted hover:text-primary transition-colors"
            >
              {child.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleMobileNav = (href: string) => {
    navigate(href);
    setMenuOpen(false);
    window.scrollTo(0, 0);
  };

  return (
    <header className="fixed top-0 right-0 left-0 z-50">
      {/* Top bar with logo and name */}
      <div
        className={`bg-primary transition-all duration-300 ${
          scrolled ? "py-2" : "py-4"
        }`}
      >
        <div className="container mx-auto px-4 flex items-center justify-center gap-4">
          <Link to="/" onClick={() => window.scrollTo(0, 0)}>
            <img
              src={logo}
              alt="شعار جامعة أفريقيا الفرنسية العربية"
              className={`transition-all duration-300 ${scrolled ? "h-10" : "h-16"}`}
            />
          </Link>
          <Link to="/" onClick={() => window.scrollTo(0, 0)}>
            <h1
              className={`text-primary-foreground font-bold transition-all duration-300 ${
                scrolled ? "text-lg" : "text-xl md:text-2xl"
              }`}
            >
              جامعة أفريقيا الفرنسية العربية – فرع سوريا
            </h1>
          </Link>
        </div>
      </div>

      {/* Navigation bar - blue darker shade */}
      <div className="bg-[hsl(215,65%,22%)] border-b border-primary-foreground/10 shadow-md">
        <div className="container mx-auto px-4">
          {/* Desktop nav */}
          <div className="hidden lg:flex items-center justify-center">
            {navLinks.map((link) => (
              <DesktopDropdown key={link.label} item={link} onClose={() => {}} />
            ))}

            {/* Register CTA */}
            <Link
              to="/programs"
              onClick={() => window.scrollTo(0, 0)}
              className="mr-2 px-5 py-2 bg-accent text-accent-foreground text-sm font-bold rounded-md hover:brightness-110 transition-all duration-200"
            >
              سجل الآن
            </Link>
          </div>

          {/* Mobile hamburger */}
          <div className="lg:hidden flex items-center justify-between h-12">
            <span className="text-sm font-medium text-primary-foreground/70">القائمة</span>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-primary-foreground p-1.5 rounded-md hover:bg-primary-foreground/10 transition-colors active:scale-95"
              aria-label="القائمة"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden bg-card border-b border-border shadow-md animate-fade-in">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) =>
              link.children ? (
                <div key={link.label}>
                  <button
                    onClick={() =>
                      setMobileExpanded(mobileExpanded === link.label ? null : link.label)
                    }
                    className="w-full flex items-center justify-between text-foreground/80 hover:text-primary px-3 py-2.5 text-sm font-medium rounded-md hover:bg-muted transition-colors"
                  >
                    {link.label}
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-200 ${
                        mobileExpanded === link.label ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {mobileExpanded === link.label && (
                    <div className="pr-4 space-y-1 mt-1">
                      {link.children.map((child, i) => (
                        <button
                          key={i}
                          onClick={() => handleMobileNav(child.href)}
                          className="block w-full text-right text-foreground/60 hover:text-primary px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors"
                        >
                          {child.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <button
                  key={link.label}
                  onClick={() => handleMobileNav(link.href)}
                  className="block w-full text-right text-foreground/80 hover:text-primary px-3 py-2.5 text-sm font-medium rounded-md hover:bg-muted transition-colors"
                >
                  {link.label}
                </button>
              )
            )}
            <Link
              to="/programs"
              onClick={() => { setMenuOpen(false); window.scrollTo(0, 0); }}
              className="block text-center bg-accent text-accent-foreground py-2.5 rounded-md font-bold text-sm mt-3"
            >
              سجل الآن
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
