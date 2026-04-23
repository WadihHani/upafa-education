import TeacherLayout from "./TeacherLayout";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

export default function TeacherCourses() {
  return (
    <TeacherLayout title="مقرراتي">
      <h2 className="text-2xl font-bold text-primary mb-1">مقرراتي</h2>
      <p className="text-sm text-muted-foreground mb-6">المقررات التي تُدرّسها هذا الفصل.</p>
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <BookOpen className="mx-auto mb-3 opacity-40" size={40} />
          لم يتم تعيين مقررات لك بعد.
        </CardContent>
      </Card>
    </TeacherLayout>
  );
}
