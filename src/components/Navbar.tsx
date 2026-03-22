import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "الرئيسية", href: "#home" },
  { label: "عن الجامعة", href: "#about" },
  { label: "البرامج", href: "#programs" },
  { label: "البوابة", href: "#portal" },
  { label: "المنشورات", href: "#publications" },
  { label: "اتصل بنا", href: "#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-primary shadow-lg"
          : "bg-primary/90"
      }`}
    >
      {/* Top bar with university name */}
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
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-primary-foreground/85 hover:text-primary-foreground px-4 py-2 text-sm font-medium rounded-md hover:bg-primary-foreground/10 transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-primary-foreground p-2 rounded-md hover:bg-primary-foreground/10 transition-colors active:scale-95"
            aria-label="القائمة"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-primary border-t border-primary-foreground/10 animate-fade-in">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block text-primary-foreground/85 hover:text-primary-foreground px-3 py-2.5 text-sm font-medium rounded-md hover:bg-primary-foreground/10 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
