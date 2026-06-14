import { useState, ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Pencil } from "lucide-react";
import { useEditMode } from "@/contexts/EditModeContext";
import { useSiteContent } from "@/hooks/use-site-content";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface Props {
  contentKey: string;
  fallbackHref?: string;
  fallbackText?: string;
  className?: string;
  children?: ReactNode;
}

export default function EditableLink({
  contentKey,
  fallbackHref = "#",
  fallbackText = "",
  className = "",
  children,
}: Props) {
  const { editMode, setField, getEffective, pending } = useEditMode();
  const { data } = useSiteContent();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const href = getEffective(contentKey, "link_url", (data[contentKey] as any)?.link_url || fallbackHref);
  const text = getEffective(contentKey, "title", (data[contentKey] as any)?.title || fallbackText);
  const isDirty = pending[contentKey]?.link_url !== undefined || pending[contentKey]?.title !== undefined;

  if (!editMode) {
    const isExternal = /^https?:/.test(href);
    if (isExternal) {
      return <a href={href} className={className} target="_blank" rel="noopener noreferrer">{children || text}</a>;
    }
    return <Link to={href} className={className} onClick={() => window.scrollTo(0, 0)}>{children || text}</Link>;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={`${className} relative outline-dashed outline-2 outline-offset-2 ${
            isDirty ? "outline-amber-500" : "outline-blue-400/60 hover:outline-blue-600"
          } rounded-sm cursor-pointer`}
        >
          {children || text}
          <Pencil size={10} className="inline-block mr-1 opacity-60" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 space-y-3" dir="rtl">
        <div className="space-y-1.5">
          <Label className="text-xs">النص</Label>
          <Input
            defaultValue={text}
            onBlur={(e) => setField(contentKey, "title", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">الرابط</Label>
          <Input
            defaultValue={href}
            placeholder="/page أو https://..."
            onBlur={(e) => setField(contentKey, "link_url", e.target.value)}
          />
        </div>
        <Button size="sm" className="w-full" onClick={() => setOpen(false)}>تم</Button>
      </PopoverContent>
    </Popover>
  );
}
