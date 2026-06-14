import { useRef, useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { useEditMode } from "@/contexts/EditModeContext";
import { useSiteContent } from "@/hooks/use-site-content";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Props {
  contentKey: string;
  fallback?: string;
  alt?: string;
  className?: string;
}

export default function EditableImage({ contentKey, fallback = "", alt = "", className = "" }: Props) {
  const { editMode, setField, getEffective, pending } = useEditMode();
  const { data } = useSiteContent();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const src = getEffective(contentKey, "image_url", (data[contentKey] as any)?.image_url || fallback);
  const isDirty = pending[contentKey]?.image_url !== undefined;

  const onPick = async (file: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `site-content/${contentKey}-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("site-images").upload(path, file, { upsert: true });
      if (error) throw error;
      const { data: pub } = supabase.storage.from("site-images").getPublicUrl(path);
      setField(contentKey, "image_url", pub.publicUrl);
      toast({ title: "تم رفع الصورة", description: "اضغط حفظ لنشر التغيير" });
    } catch (e: any) {
      toast({ title: "فشل رفع الصورة", description: e.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  if (!editMode) {
    return src ? <img src={src} alt={alt} className={className} /> : null;
  }

  return (
    <div className={`relative group inline-block ${isDirty ? "ring-2 ring-amber-500" : "ring-2 ring-blue-400/60"} rounded-sm`}>
      {src ? <img src={src} alt={alt} className={className} /> : (
        <div className={`${className} bg-muted flex items-center justify-center min-h-[120px]`}>
          <ImagePlus className="text-muted-foreground" />
        </div>
      )}
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold gap-2"
      >
        {uploading ? <Loader2 className="animate-spin" /> : <><ImagePlus size={20} /> تغيير الصورة</>}
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && onPick(e.target.files[0])}
      />
    </div>
  );
}
