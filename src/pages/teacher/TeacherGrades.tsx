import TeacherLayout from "./TeacherLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Award } from "lucide-react";

export default function TeacherGrades() {
  return (
    <TeacherLayout title="الدرجات">
      <h2 className="text-2xl font-bold text-primary mb-1">الدرجات</h2>
      <p className="text-sm text-muted-foreground mb-6">إدخال درجات الطلاب ونشر النتائج.</p>
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <Award className="mx-auto mb-3 opacity-40" size={40} />
          لم يتم إدخال درجات بعد.
        </CardContent>
      </Card>
    </TeacherLayout>
  );
}
