import TeacherLayout from "./TeacherLayout";
import { Card, CardContent } from "@/components/ui/card";
import { ClipboardList } from "lucide-react";

export default function TeacherAssessments() {
  return (
    <TeacherLayout title="الاختبارات والواجبات">
      <h2 className="text-2xl font-bold text-primary mb-1">الاختبارات والواجبات</h2>
      <p className="text-sm text-muted-foreground mb-6">إنشاء الاختبارات وتسليم الواجبات.</p>
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <ClipboardList className="mx-auto mb-3 opacity-40" size={40} />
          لا توجد اختبارات أو واجبات بعد.
        </CardContent>
      </Card>
    </TeacherLayout>
  );
}
