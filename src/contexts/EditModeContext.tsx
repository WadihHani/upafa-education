import { createContext, useCallback, useContext, useMemo, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { clearSiteContentCache, useSiteContent } from "@/hooks/use-site-content";
import { toast } from "@/hooks/use-toast";

export type EditableField = "title" | "content" | "image_url" | "link_url";
type PendingMap = Record<string, Partial<Record<EditableField, string>>>;

interface EditModeContextType {
  canEdit: boolean;
  editMode: boolean;
  setEditMode: (v: boolean) => void;
  pending: PendingMap;
  setField: (key: string, field: EditableField, value: string) => void;
  getEffective: (key: string, field: EditableField, fallback?: string) => string;
  hasChanges: boolean;
  saving: boolean;
  save: () => Promise<void>;
  discard: () => void;
}

const EditModeContext = createContext<EditModeContextType | null>(null);

export function EditModeProvider({ children }: { children: ReactNode }) {
  const { isAdmin } = useAuth();
  const { data } = useSiteContent();
  const [editMode, setEditMode] = useState(false);
  const [pending, setPending] = useState<PendingMap>({});
  const [saving, setSaving] = useState(false);

  const setField = useCallback((key: string, field: EditableField, value: string) => {
    setPending((prev) => ({
      ...prev,
      [key]: { ...(prev[key] || {}), [field]: value },
    }));
  }, []);

  const getEffective = useCallback(
    (key: string, field: EditableField, fallback = "") => {
      const p = pending[key]?.[field];
      if (p !== undefined) return p;
      const v = (data[key] as any)?.[field];
      return v ?? fallback;
    },
    [pending, data]
  );

  const discard = useCallback(() => {
    setPending({});
  }, []);

  const save = useCallback(async () => {
    setSaving(true);
    try {
      const rows = Object.entries(pending).map(([section_key, fields]) => {
        const existing = data[section_key] || {};
        return {
          section_key,
          title: fields.title ?? (existing as any).title ?? null,
          content: fields.content ?? (existing as any).content ?? null,
          image_url: fields.image_url ?? (existing as any).image_url ?? null,
          link_url: fields.link_url ?? (existing as any).link_url ?? null,
        };
      });
      if (rows.length > 0) {
        const { error } = await (supabase as any)
          .from("site_content")
          .upsert(rows, { onConflict: "section_key" });
        if (error) throw error;
      }
      clearSiteContentCache();
      setPending({});
      toast({ title: "تم الحفظ", description: `تم حفظ ${rows.length} تعديل` });
    } catch (e: any) {
      toast({ title: "فشل الحفظ", description: e.message || String(e), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }, [pending, data]);

  const value = useMemo<EditModeContextType>(
    () => ({
      canEdit: isAdmin,
      editMode: isAdmin && editMode,
      setEditMode: (v) => setEditMode(isAdmin && v),
      pending,
      setField,
      getEffective,
      hasChanges: Object.keys(pending).length > 0,
      saving,
      save,
      discard,
    }),
    [isAdmin, editMode, pending, setField, getEffective, saving, save, discard]
  );

  return <EditModeContext.Provider value={value}>{children}</EditModeContext.Provider>;
}

export function useEditMode() {
  const ctx = useContext(EditModeContext);
  if (!ctx) {
    // Safe defaults when used outside provider
    return {
      canEdit: false,
      editMode: false,
      setEditMode: () => {},
      pending: {} as PendingMap,
      setField: () => {},
      getEffective: (_k: string, _f: EditableField, fallback = "") => fallback,
      hasChanges: false,
      saving: false,
      save: async () => {},
      discard: () => {},
    } as EditModeContextType;
  }
  return ctx;
}
