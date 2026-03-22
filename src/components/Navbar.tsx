import { useState, useEffect, useRef } from "react";
import { Menu, X, ChevronDown } from "lucide-react";

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

function DropdownItem({ item, onClose }: { item: NavItem; onClose: () => void }) {
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
        className="text-primary-foreground/85 hover:text-primary-foreground px-3 py-2 text-sm font-medium rounded-md hover:bg-primary-foreground/10 transition-colors duration-200"
      >
        {item.label}
      </a>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-primary-foreground/85 hover:text-primary-foreground px-3 py-2 text-sm font-medium rounded-md hover:bg-primary-foreground/10 transition-colors duration-200"
      >
        {item.label}
        <ChevronDown size={14} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-1 w-44 bg-card border rounded-md shadow-lg py-1 z-50 animate-fade-in">
          {item.children.map((child, i) => (
            <a
              key={i}
              href={child.href}
              onClick={() => { setOpen(false); onClose(); }}
              className="block px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
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
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-primary shadow-lg" : "bg-primary/90"
      }`}
    >
      {/* Top bar */}
      <div className="bg-primary border-b border-primary-foreground/10">
        <div className="container mx-auto px-4 py-2 flex items-center justify-center gap-3">
          <span className="text-primary-foreground text-sm md:text-base font-semibold tracking-wide">
            جامعة أفريقيا الفرنسية العربية – فرع سوريا
          </span>
        </div>
      </div>

      {/* Main nav */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <div className="hidden lg:flex items-center gap-0.5">
            {navLinks.map((link) => (
              <DropdownItem key={link.label} item={link} onClose={() => {}} />
            ))}
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden text-primary-foreground p-2 rounded-md hover:bg-primary-foreground/10 transition-colors active:scale-95"
            aria-label="القائمة"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden bg-primary border-t border-primary-foreground/10 animate-fade-in">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) =>
              link.children ? (
                <div key={link.label}>
                  <button
                    onClick={() =>
                      setMobileExpanded(mobileExpanded === link.label ? null : link.label)
                    }
                    className="w-full flex items-center justify-between text-primary-foreground/85 hover:text-primary-foreground px-3 py-2.5 text-sm font-medium rounded-md hover:bg-primary-foreground/10 transition-colors"
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
                          className="block text-primary-foreground/70 hover:text-primary-foreground px-3 py-2 text-sm rounded-md hover:bg-primary-foreground/10 transition-colors"
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
                  className="block text-primary-foreground/85 hover:text-primary-foreground px-3 py-2.5 text-sm font-medium rounded-md hover:bg-primary-foreground/10 transition-colors"
                >
                  {link.label}
                </a>
              )
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
