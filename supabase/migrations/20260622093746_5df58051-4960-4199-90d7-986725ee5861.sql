ALTER TABLE public.lecture_materials 
  ADD COLUMN IF NOT EXISTS material_type text NOT NULL DEFAULT 'link',
  ADD COLUMN IF NOT EXISTS file_size_bytes bigint,
  ADD COLUMN IF NOT EXISTS file_mime text;

ALTER TABLE public.lecture_materials
  DROP CONSTRAINT IF EXISTS lecture_materials_type_check;
ALTER TABLE public.lecture_materials
  ADD CONSTRAINT lecture_materials_type_check
  CHECK (material_type IN ('book','pdf','video','youtube','link'));