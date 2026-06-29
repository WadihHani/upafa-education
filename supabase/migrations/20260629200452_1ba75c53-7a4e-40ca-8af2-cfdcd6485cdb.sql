
CREATE TABLE public.course_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  sender_user_id UUID NOT NULL,
  recipient_user_id UUID NOT NULL,
  body TEXT NOT NULL CHECK (length(btrim(body)) > 0 AND length(body) <= 4000),
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_course_messages_course ON public.course_messages(course_id, created_at DESC);
CREATE INDEX idx_course_messages_recipient ON public.course_messages(recipient_user_id, is_read);
CREATE INDEX idx_course_messages_sender ON public.course_messages(sender_user_id);

GRANT SELECT, INSERT, UPDATE ON public.course_messages TO authenticated;
GRANT ALL ON public.course_messages TO service_role;

ALTER TABLE public.course_messages ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_course_teacher(_user_id uuid, _course_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.courses WHERE id = _course_id AND teacher_user_id = _user_id);
$$;

CREATE OR REPLACE FUNCTION public.is_course_enrolled_student(_user_id uuid, _course_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.enrollments
    WHERE course_id = _course_id
      AND student_user_id = _user_id
      AND status = 'approved'::enrollment_status
  );
$$;

CREATE POLICY "messages_select_participants" ON public.course_messages
FOR SELECT TO authenticated
USING (
  auth.uid() = sender_user_id
  OR auth.uid() = recipient_user_id
  OR public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "messages_insert_valid_pair" ON public.course_messages
FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = sender_user_id
  AND (
    (
      public.is_course_teacher(sender_user_id, course_id)
      AND public.is_course_enrolled_student(recipient_user_id, course_id)
    )
    OR (
      public.is_course_enrolled_student(sender_user_id, course_id)
      AND public.is_course_teacher(recipient_user_id, course_id)
    )
  )
);

CREATE POLICY "messages_update_recipient_read" ON public.course_messages
FOR UPDATE TO authenticated
USING (auth.uid() = recipient_user_id OR public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (auth.uid() = recipient_user_id OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE FUNCTION public.enforce_course_messages_update()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF public.has_role(auth.uid(), 'admin'::app_role) THEN RETURN NEW; END IF;
  IF NEW.body IS DISTINCT FROM OLD.body
     OR NEW.course_id IS DISTINCT FROM OLD.course_id
     OR NEW.sender_user_id IS DISTINCT FROM OLD.sender_user_id
     OR NEW.recipient_user_id IS DISTINCT FROM OLD.recipient_user_id
     OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'Only is_read may be updated on course_messages';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_enforce_course_messages_update
BEFORE UPDATE ON public.course_messages
FOR EACH ROW EXECUTE FUNCTION public.enforce_course_messages_update();

ALTER PUBLICATION supabase_realtime ADD TABLE public.course_messages;
ALTER TABLE public.course_messages REPLICA IDENTITY FULL;
