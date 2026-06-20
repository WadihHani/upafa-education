import { useSiteContent } from "@/hooks/use-site-content";

export default function WhatsAppFloat() {
  const { get } = useSiteContent();
  const phone = get("contact_phone", "+963 989 801 010").replace(/\D/g, "");
  const message = encodeURIComponent("مرحباً، أرغب بالاستفسار عن جامعة UPAFA.");

  return (
    <a
      href={`https://wa.me/${phone}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="تواصل عبر واتساب"
      className="fixed bottom-5 right-5 z-50 group flex items-center justify-center w-14 h-14 rounded-full text-white shadow-2xl transition-transform duration-200 hover:scale-110 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/40"
      style={{ backgroundColor: "#25D366" }}
    >
      <span
        aria-hidden
        className="absolute inset-0 rounded-full animate-ping opacity-40"
        style={{ backgroundColor: "#25D366" }}
      />
      <svg
        viewBox="0 0 32 32"
        className="relative w-7 h-7 fill-current"
        aria-hidden
      >
        <path d="M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.63.63 0 0 1-.315-.1c-.802-.402-1.504-.817-2.163-1.447-.545-.516-1.146-1.29-1.46-1.963a.426.426 0 0 1-.073-.215c0-.33.99-.945.99-1.49 0-.143-.73-2.09-.832-2.335-.143-.372-.214-.487-.6-.487-.187 0-.36-.043-.53-.043-.302 0-.53.115-.746.315-.688.645-1.032 1.318-1.06 2.264v.114c-.015.99.472 1.977 1.017 2.78 1.23 1.82 2.506 3.41 4.554 4.34.616.287 2.035.946 2.722.946.345 0 2.504-.43 2.504-1.748 0-.546-.158-1.092-.358-1.45-.214-.385-2.157-1.464-2.6-1.464-.187 0-.272.043-.43.214zM16.046 28.36c-2.535 0-4.985-.658-7.156-1.85L2.95 28.014l1.578-5.704A14.36 14.36 0 0 1 1.61 16.05C1.61 8.07 8.067 1.61 16.046 1.61c8.078 0 14.434 6.46 14.434 14.44 0 7.978-6.456 14.31-14.434 14.31z" />
      </svg>
    </a>
  );
}
