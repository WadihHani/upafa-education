import TeacherLayout from "./TeacherLayout";
import { Card, CardContent } from "@/components/ui/card";
import { FolderKanban } from "lucide-react";

export default function TeacherMaterials() {
  return (
    <TeacherLayout title="المحاضرات والمواد">
      <h2 className="text-2xl font-bold text-primary mb-1">المحاضرات والمواد</h2>
      <p className="text-sm text-muted-foreground mb-6">رفع المحاضرات المسجلة والمواد التعليمية.</p>
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <FolderKanban className="mx-auto mb-3 opacity-40" size={40} />
          لا توجد مواد مرفوعة بعد.
        </CardContent>
      </Card>
    </TeacherLayout>
  );
}
