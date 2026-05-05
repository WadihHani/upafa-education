import { useState } from "react";
import ConferencesSection from "@/components/ConferencesSection";
import ProgramCoursesSection from "@/components/ProgramCoursesSection";

const LEVELS = [
  { key: "bachelor", label: "البكالوريوس" },
  { key: "master", label: "الماجستير" },
] as const;

const Conferences = () => {
  const [level, setLevel] = useState<"bachelor" | "master">("bachelor");

  return (
    <div>
      <ConferencesSection />

      <section className="container mx-auto px-4 py-12" dir="rtl">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-3">
              مقررات البرامج الأكاديمية
            </h2>
            <p className="text-muted-foreground">
              تصفّح مقررات كل برنامج موزعة حسب السنة الدراسية.
            </p>
          </div>

          <div className="flex justify-center gap-2 mb-6">
            {LEVELS.map((l) => (
              <button
                key={l.key}
                onClick={() => setLevel(l.key)}
                className={`px-5 py-2 rounded-full text-sm font-bold transition-colors border ${
                  level === l.key
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-foreground border-border hover:bg-muted"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>

          <ProgramCoursesSection level={level} />
        </div>
      </section>
    </div>
  );
};

export default Conferences;
