import TeacherLayout from "./TeacherLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function TeacherStudents() {
  return (
    <TeacherLayout title="الطلاب المسجلون">
      <h2 className="text-2xl font-bold text-primary mb-1">الطلاب المسجلون</h2>
      <p className="text-sm text-muted-foreground mb-6">قائمة الطلاب في كل مقرر وإدارة طلبات التسجيل.</p>
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <Users className="mx-auto mb-3 opacity-40" size={40} />
          لا يوجد طلاب مسجلون حالياً.
        </CardContent>
      </Card>
    </TeacherLayout>
  );
}
