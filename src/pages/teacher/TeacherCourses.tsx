import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import TeacherLayout from "./TeacherLayout";
import { useTeacherCourses } from "@/hooks/use-teacher-courses";

export default function TeacherCourses() {
  const { courses, loading, error } = useTeacherCourses();

  return (
    <TeacherLayout title="مقرراتي">
      <h2 className="text-2xl font-bold text-primary mb-1">مقرراتي</h2>
      <p className="text-sm text-muted-foreground mb-6">
        المقررات التي تُدرّسها هذا الفصل.
      </p>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-8 text-center text-destructive text-sm">
            {error}
          </CardContent>
        </Card>
      ) : courses.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <BookOpen className="mx-auto mb-3 opacity-40" size={40} />
            لم يتم تعيين مقررات لك بعد.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((c) => (
            <Card key={c.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-primary text-sm">{c.title}</h3>
                  {c.is_open_for_enrollment ? (
                    <Badge variant="secondary" className="text-[10px]">مفتوح للتسجيل</Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px]">مغلق</Badge>
                  )}
                </div>
                <div className="flex gap-2 text-[11px] text-muted-foreground mb-3">
                  {c.code && <span>{c.code}</span>}
                  {c.level && <span>• {c.level}</span>}
                </div>
                {c.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                    {c.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  <Link
                    to={`/portal/teacher/students?course=${c.id}`}
                    className="text-xs text-accent hover:underline flex items-center gap-1"
                  >
                    الطلاب <ChevronLeft size={12} />
                  </Link>
                  <Link
                    to={`/portal/teacher/materials?course=${c.id}`}
                    className="text-xs text-accent hover:underline flex items-center gap-1"
                  >
                    المواد <ChevronLeft size={12} />
                  </Link>
                  <Link
                    to={`/portal/teacher/grades?course=${c.id}`}
                    className="text-xs text-accent hover:underline flex items-center gap-1"
                  >
                    الدرجات <ChevronLeft size={12} />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </TeacherLayout>
  );
}
