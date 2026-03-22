import { useState, useEffect, useRef } from "react";
import { Menu, X, ChevronDown, Search } from "lucide-react";
import logo from "@/assets/logo.png";

type NavItem = {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
};

const navLinks: NavItem[] = [
  { label: "الرئيسية", href: "#home" },
  {
    label: "عن الجامعة",
    href: "#about",
    children: [
      { label: "عن الجامعة", href: "#about" },
      { label: "اللوائح", href: "#regulations" },
    ],
  },
  { label: "المؤتمرات والندوات", href: "#conferences" },
  { label: "البرامج", href: "#programs" },
  { label: "البوابة", href: "#portal" },
  {
    label: "المنشورات",
    href: "#publications",
    children: [
      { label: "المكتبة", href: "#publications" },
      { label: "المجلات", href: "#publications" },
      { label: "المنشورات", href: "#publications" },
      { label: "المدونات", href: "#publications" },
      { label: "الأخبار", href: "#publications" },
    ],
  },
  { label: "اتصل بنا", href: "#contact" },
  { label: "الدفع الإلكتروني", href: "#payment" },
];

function DesktopDropdown({ item, onClose }: { item: NavItem; onClose: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!item.children) {
    return (
      <a
        href={item.href}
        onClick={onClose}
        className="px-4 py-2.5 text-sm font-medium text-foreground/80 hover:text-primary hover:bg-muted transition-colors duration-200 border-l border-border first:border-l-0 last:border-r-0"
      >
        {item.label}
      </a>
    );
  }

  return (
    <div ref={ref} className="relative border-l border-border">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-4 py-2.5 text-sm font-medium text-foreground/80 hover:text-primary hover:bg-muted transition-colors duration-200"
      >
        {item.label}
        <ChevronDown size={12} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-0 w-44 bg-card border rounded-b-md shadow-lg py-1 z-50 animate-fade-in">
          {item.children.map((child, i) => (
            <a
              key={i}
              href={child.href}
              onClick={() => { setOpen(false); onClose(); }}
              className="block px-4 py-2.5 text-sm text-foreground hover:bg-muted hover:text-primary transition-colors"
            >
              {child.label}
            </a>
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed top-0 right-0 left-0 z-50">
      {/* Top green bar with logo and university name */}
      <div
        className={`bg-primary transition-all duration-300 ${
          scrolled ? "py-2" : "py-4"
        }`}
      >
        <div className="container mx-auto px-4 flex items-center justify-center gap-4">
          <img
            src={logo}
            alt="شعار جامعة أفريقيا الفرنسية العربية"
            className={`transition-all duration-300 ${scrolled ? "h-10" : "h-16"}`}
          />
          <h1
            className={`text-primary-foreground font-bold transition-all duration-300 ${
              scrolled ? "text-lg" : "text-xl md:text-2xl"
            }`}
          >
            جامعة أفريقيا الفرنسية العربية – فرع سوريا
          </h1>
        </div>
      </div>

      {/* Navigation bar - grey background like original */}
      <div className="bg-muted border-b border-border shadow-sm">
        <div className="container mx-auto px-4">
          {/* Desktop nav */}
          <div className="hidden lg:flex items-center justify-center">
            {navLinks.map((link) => (
              <DesktopDropdown key={link.label} item={link} onClose={() => {}} />
            ))}

            {/* Search */}
            <button className="flex items-center gap-1.5 px-4 py-2.5 text-sm text-foreground/60 hover:text-primary hover:bg-muted transition-colors border-l border-border">
              <Search size={14} />
              <span>بحث</span>
            </button>
          </div>

          {/* Mobile hamburger */}
          <div className="lg:hidden flex items-center justify-between h-11">
            <span className="text-sm font-medium text-foreground/70">القائمة</span>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-foreground p-1.5 rounded-md hover:bg-border transition-colors active:scale-95"
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
                        <a
                          key={i}
                          href={child.href}
                          onClick={() => setMenuOpen(false)}
                          className="block text-foreground/60 hover:text-primary px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors"
                        >
                          {child.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block text-foreground/80 hover:text-primary px-3 py-2.5 text-sm font-medium rounded-md hover:bg-muted transition-colors"
                >
                  {link.label}
                </a>
              )
            )}
          </div>
        </div>
      )}
    </header>
  );
}
