CREATE TABLE public.student_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_user_id UUID NOT NULL,
  note TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_student_notes_student ON public.student_notes(student_user_id);

ALTER TABLE public.student_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage all student notes"
ON public.student_notes FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Students view own notes"
ON public.student_notes FOR SELECT TO authenticated
USING (auth.uid() = student_user_id);

CREATE POLICY "Students mark own notes read"
ON public.student_notes FOR UPDATE TO authenticated
USING (auth.uid() = student_user_id)
WITH CHECK (auth.uid() = student_user_id);

CREATE TRIGGER update_student_notes_updated_at
BEFORE UPDATE ON public.student_notes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();