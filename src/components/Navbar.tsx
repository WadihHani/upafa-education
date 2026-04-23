import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, ChevronDown, Search } from "lucide-react";
import { useSiteContent } from "@/hooks/use-site-content";
import logo from "@/assets/logo.png";

type NavItem = {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
};

const navLinks: NavItem[] = [
  { label: "الرئيسية", href: "/" },
  {
    label: "عن الجامعة",
    href: "/about",
    children: [
      { label: "نبذة عن الجامعة", href: "/about" },
      { label: "الكليات والتخصصات", href: "/faculties" },
      { label: "نظام الدراسة والرسوم", href: "/tuition" },
      { label: "أسئلة شائعة", href: "/faq" },
    ],
  },
  { label: "المؤتمرات والندوات", href: "/conferences" },
  { label: "المفاضلة", href: "/mofadla" },
  {
    label: "البرامج",
    href: "/programs",
    children: [
      { label: "البكالوريوس", href: "/programs/bachelor" },
      { label: "الماجستير", href: "/programs/master" },
      { label: "الدكتوراه", href: "/programs/phd" },
      { label: "جميع البرامج", href: "/programs" },
    ],
  },
  { label: "البوابة", href: "/portal" },
  { label: "المنشورات", href: "/publications" },
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
        className="px-3 xl:px-4 py-3 text-[13px] xl:text-sm font-semibold text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-colors duration-200 border-l border-primary-foreground/20 first:border-l-0 whitespace-nowrap"
      >
        {item.label}
      </Link>
    );
  }

  return (
    <div ref={ref} className="relative border-l border-primary-foreground/20">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-3 xl:px-4 py-3 text-[13px] xl:text-sm font-semibold text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-colors duration-200 whitespace-nowrap"
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { get } = useSiteContent();

  const uniName = get("university_name", "جامعة أفريقيا الفرنسية العربية – فرع سوريا");
  const tagline = get("hero_subtitle", "اعبر حدود الزمان والمكان");

  const handleMobileNav = (href: string) => {
    navigate(href);
    setMenuOpen(false);
    window.scrollTo(0, 0);
  };

  return (
    <header className="sticky top-0 right-0 left-0 z-50 shadow-md">
      {/* Top white bar with logo + tagline + search */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* Tagline (right in RTL) */}
          <div className="hidden md:flex flex-col items-start">
            <div className="text-primary text-xl lg:text-2xl font-extrabold leading-tight" style={{ fontFamily: "'Cairo', serif" }}>
              {tagline}
            </div>
            <div className="text-muted-foreground text-[11px] lg:text-xs tracking-wider mt-1">
              Beyond The Boundaries Of Time & Place
            </div>
          </div>

          {/* Search bar (center) */}
          <div className="hidden md:flex flex-1 max-w-md items-center gap-2 mx-4">
            <div className="relative flex-1">
              <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث..."
                className="w-full h-9 pr-9 pl-3 rounded-md border border-input bg-muted/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>

          {/* Logo (left in RTL) */}
          <Link to="/" onClick={() => window.scrollTo(0, 0)} className="flex items-center gap-3 shrink-0">
            <img src={logo} alt={uniName} className="h-14 md:h-16 lg:h-20 w-auto" />
          </Link>
        </div>
      </div>

      {/* Navigation strip */}
      <div className="bg-primary border-b-4 border-accent">
        <div className="container mx-auto px-2">
          <div className="hidden lg:flex items-center justify-end">
            {navLinks.map((link) => (
              <DesktopDropdown key={link.label} item={link} onClose={() => {}} />
            ))}
          </div>

          <div className="lg:hidden flex items-center justify-between h-12">
            <span className="text-sm font-semibold text-primary-foreground">القائمة</span>
            <button onClick={() => setMenuOpen(!menuOpen)} className="text-primary-foreground p-1.5 rounded-md hover:bg-primary-foreground/10 transition-colors active:scale-95" aria-label="القائمة">
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="lg:hidden bg-card border-b border-border shadow-md animate-fade-in">
          <div className="px-4 py-3 space-y-1">
            <div className="relative mb-3">
              <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="text" placeholder="بحث..." className="w-full h-10 pr-9 pl-3 rounded-md border border-input bg-muted/40 text-sm" />
            </div>
            {navLinks.map((link) =>
              link.children ? (
                <div key={link.label}>
                  <button onClick={() => setMobileExpanded(mobileExpanded === link.label ? null : link.label)} className="w-full flex items-center justify-between text-foreground/80 hover:text-primary px-3 py-2.5 text-sm font-medium rounded-md hover:bg-muted transition-colors">
                    {link.label}
                    <ChevronDown size={14} className={`transition-transform duration-200 ${mobileExpanded === link.label ? "rotate-180" : ""}`} />
                  </button>
                  {mobileExpanded === link.label && (
                    <div className="pr-4 space-y-1 mt-1">
                      {link.children.map((child, i) => (
                        <button key={i} onClick={() => handleMobileNav(child.href)} className="block w-full text-right text-foreground/60 hover:text-primary px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors">
                          {child.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <button key={link.label} onClick={() => handleMobileNav(link.href)} className="block w-full text-right text-foreground/80 hover:text-primary px-3 py-2.5 text-sm font-medium rounded-md hover:bg-muted transition-colors">
                  {link.label}
                </button>
              )
            )}
          </div>
        </div>
      )}
    </header>
  );
}
