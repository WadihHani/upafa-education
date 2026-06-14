import { Save, X, Pencil, Loader2, RotateCcw } from "lucide-react";
import { useEditMode } from "@/contexts/EditModeContext";
import { Button } from "@/components/ui/button";

export default function EditModeBar() {
  const { canEdit, editMode, setEditMode, hasChanges, save, discard, saving } = useEditMode();

  if (!canEdit) return null;

  if (!editMode) {
    return (
      <button
        type="button"
        onClick={() => setEditMode(true)}
        className="fixed bottom-6 left-6 z-[100] bg-primary text-primary-foreground rounded-full shadow-2xl px-5 py-3 flex items-center gap-2 font-bold text-sm hover:scale-105 transition-transform"
        title="تفعيل وضع التعديل"
      >
        <Pencil size={16} />
        وضع التعديل
      </button>
    );
  }

  return (
    <div className="fixed top-0 inset-x-0 z-[100] bg-amber-500 text-amber-950 shadow-lg" dir="rtl">
      <div className="container mx-auto px-4 py-2 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 font-bold text-sm">
          <Pencil size={16} />
          <span>وضع التعديل المباشر</span>
          {hasChanges && (
            <span className="bg-amber-950 text-amber-100 px-2 py-0.5 rounded-full text-[11px]">
              تغييرات غير محفوظة
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="bg-white border-amber-700 text-amber-950 hover:bg-amber-50"
            onClick={discard}
            disabled={!hasChanges || saving}
          >
            <RotateCcw size={14} /> تراجع
          </Button>
          <Button
            size="sm"
            className="bg-amber-950 text-amber-50 hover:bg-amber-900"
            onClick={save}
            disabled={!hasChanges || saving}
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} حفظ ونشر
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-amber-950 hover:bg-amber-600"
            onClick={() => { if (hasChanges) discard(); setEditMode(false); }}
          >
            <X size={14} /> خروج
          </Button>
        </div>
      </div>
    </div>
  );
}
