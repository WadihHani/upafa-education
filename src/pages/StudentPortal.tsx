import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  GraduationCap,
  LogOut,
  PlayCircle,
  CalendarCheck,
  ClipboardList,
  FileText,
  Layers,
  FolderKanban,
  Award,
  BookOpen,
  Bell,
  User,
} from "lucide-react";

type SectionKey =
  | "lectures"
  | "attendance"
  | "quizzes"
  | "midterms"
  | "activities"
  | "projects"
  | "grades"
  | "overview";

type Section = {
  key: SectionKey;
  label: string;
  icon: typeof PlayCircle;
  description: string;
};

const sections: Section[] = [
  { key: "overview", label: "نظرة عامة", icon: BookOpen, description: "ملخص حالتك الدراسية الحالية." },
  { key: "lectures", label: "المحاضرات المسجلة", icon: PlayCircle, description: "المحاضرات الإلكترونية المسجلة المتاحة لك أسبوعياً حسب جدول الكلية." },
  { key: "attendance", label: "الحضور", icon: CalendarCheck, description: "سجل الحضور والغياب الخاص بك." },
  { key: "quizzes", label: "الفحص والبدء الأول", icon: ClipboardList, description: "الفحص التشخيصي وبدء المقررات." },
  { key: "midterms", label: "الاختبارات النصفية", icon: FileText, description: "الاختبارات النصفية المجدولة ودرجاتها." },
  { key: "activities", label: "الأنشطة الصفية والمشاركات", icon: Layers, description: "الأنشطة الصفية والمشاركات التكاملية." },
  { key: "projects", label: "المشاريع والاختبارات النهائية", icon: FolderKanban, description: "تسليم المشاريع والاختبارات النهائية." },
  { key: "grades", label: "الدرجات والنتائج", icon: Award, description: "كشف الدرجات والنتائج النهائية لكل مقرر." },
];

// Mock student info (will be replaced by real auth later)
const mockStudent = {
  name: "الطالب",
  studentId: "—",
  program: "—",
  semester: "—",
};

export default function StudentPortal() {
  const navigate = useNavigate();
  const [active, setActive] = useState<SectionKey>("overview");

  const ActiveIcon = sections.find((s) => s.key === active)?.icon ?? BookOpen;
  const activeMeta = sections.find((s) => s.key === active)!;

  return (
    <div dir="rtl" className="min-h-screen bg-muted/30">
      {/* Top bar */}
      <header className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap size={20} className="text-accent" />
            <h1 className="text-base font-bold">بوابة الطالب</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="relative p-1.5 rounded-md hover:bg-primary-foreground/10 transition-colors"
              aria-label="الإشعارات"
            >
              <Bell size={16} />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs">
              <div className="w-7 h-7 rounded-full bg-primary-foreground/15 flex items-center justify-center">
                <User size={14} />
              </div>
              <span className="font-medium">{mockStudent.name}</span>
            </div>
            <button
              type="button"
              onClick={() => navigate("/portal")}
              className="flex items-center gap-1.5 text-xs font-bold bg-accent text-accent-foreground px-3 py-1.5 rounded-md hover:brightness-110 transition-all"
            >
              <LogOut size={14} />
              خروج
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="mb-5 bg-card border border-border rounded-md p-4 flex items-center justify-between gap-4 flex-wrap shadow-sm">
          <div>
            <h2 className="text-sm font-bold text-primary mb-0.5">المقررات المتاحة للتسجيل</h2>
            <p className="text-xs text-muted-foreground">
              تصفّح المقررات المفتوحة وأرسل طلب الانضمام إلى المحاضر.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/portal/student/catalog")}
            className="text-xs font-bold bg-accent text-accent-foreground px-3 py-2 rounded-md hover:brightness-110 transition-all"
          >
            تصفح المقررات
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-5">
          {/* Sidebar */}
          <aside className="bg-card border border-border rounded-md overflow-hidden h-fit shadow-sm">
            <div className="bg-muted/40 px-4 py-3 border-b border-border">
              <p className="text-xs text-muted-foreground">معلومات الطالب</p>
              <p className="text-sm font-bold mt-0.5">{mockStudent.name}</p>
              <p className="text-[11px] text-muted-foreground mt-1">
                الرقم الجامعي: <span className="font-medium text-foreground">{mockStudent.studentId}</span>
              </p>
            </div>
            <nav className="p-2">
              {sections.map((s) => {
                const Icon = s.icon;
                const isActive = active === s.key;
                return (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setActive(s.key)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors text-right ${
                      isActive
                        ? "bg-accent/15 text-primary border-r-2 border-accent"
                        : "text-foreground/70 hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon size={15} className={isActive ? "text-accent" : ""} />
                    <span className="flex-1">{s.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Main content */}
          <main className="bg-card border border-border rounded-md shadow-sm">
            <div className="border-b border-border px-5 py-3 flex items-center gap-2">
              <ActiveIcon size={18} className="text-accent" />
              <h2 className="text-sm font-bold">{activeMeta.label}</h2>
            </div>

            <div className="p-5">
              {active === "overview" ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <InfoTile label="البرنامج" value={mockStudent.program} />
                    <InfoTile label="الفصل الدراسي" value={mockStudent.semester} />
                    <InfoTile label="الرقم الجامعي" value={mockStudent.studentId} />
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-muted-foreground mb-2">
                      أقسام لوحة الطالب
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {sections
                        .filter((s) => s.key !== "overview")
                        .map((s) => {
                          const Icon = s.icon;
                          return (
                            <button
                              key={s.key}
                              type="button"
                              onClick={() => setActive(s.key)}
                              className="text-right border border-border rounded-md p-3 hover:border-accent/50 hover:bg-accent/5 transition-colors"
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <Icon size={14} className="text-accent" />
                                <span className="text-xs font-bold">{s.label}</span>
                              </div>
                              <p className="text-[11px] text-muted-foreground leading-relaxed">
                                {s.description}
                              </p>
                            </button>
                          );
                        })}
                    </div>
                  </div>
                </div>
              ) : (
                <SectionPlaceholder description={activeMeta.description} />
              )}
            </div>
          </main>
        </div>

        <p className="text-center text-[11px] text-muted-foreground mt-6">
          البوابة قيد الإعداد — سيتم تفعيل البيانات الحقيقية بعد إنشاء حسابك من قِبل الإدارة.
        </p>
      </div>
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border rounded-md p-3 bg-muted/20">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="text-sm font-bold mt-1">{value}</p>
    </div>
  );
}

function SectionPlaceholder({ description }: { description: string }) {
  return (
    <div className="text-center py-12">
      <p className="text-sm text-foreground mb-1.5">{description}</p>
      <p className="text-xs text-muted-foreground">لا توجد بيانات بعد.</p>
    </div>
  );
}
