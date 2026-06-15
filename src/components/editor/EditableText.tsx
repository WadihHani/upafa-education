import { createElement, useEffect, useRef } from "react";
import { useEditMode, EditableField } from "@/contexts/EditModeContext";
import { useSiteContent } from "@/hooks/use-site-content";

interface Props {
  contentKey: string;
  field?: Extract<EditableField, "title" | "content">;
  fallback?: string;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  multiline?: boolean;
}

export default function EditableText({
  contentKey,
  field = "content",
  fallback = "",
  as = "span",
  className = "",
  multiline = true,
}: Props) {
  const { editMode, setField, getEffective, pending } = useEditMode();
  const { data } = useSiteContent();
  const ref = useRef<HTMLElement>(null);
  const value = getEffective(contentKey, field, (data[contentKey] as any)?.[field] || fallback);
  const isDirty = pending[contentKey]?.[field] !== undefined;

  // Keep DOM in sync when value changes from outside (e.g. data load)
  useEffect(() => {
    if (!editMode && ref.current) ref.current.textContent = value || "";
  }, [value, editMode]);

  if (!editMode) {
    return createElement(as, { className }, value);
  }

  return createElement(as as any, {
    ref,
    className: `${className} outline-dashed outline-2 outline-offset-2 outline-blue-400/60 hover:outline-blue-500 focus:outline-blue-600 focus:outline-solid rounded-sm transition-all cursor-text relative ${
      isDirty ? "outline-amber-500 bg-amber-50/30" : ""
    }`,
    contentEditable: true,
    suppressContentEditableWarning: true,
    onClick: (e: any) => { e.stopPropagation(); e.preventDefault?.(); },
    onMouseDown: (e: any) => { e.stopPropagation(); },
    onBlur: (e: any) => setField(contentKey, field, e.currentTarget.textContent || ""),
    onKeyDown: (e: any) => {
      if (!multiline && e.key === "Enter") {
        e.preventDefault();
        (e.currentTarget as HTMLElement).blur();
      }
    },
    title: `${contentKey}.${field}`,
    children: value,
  });
}
