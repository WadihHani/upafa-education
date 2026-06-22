
-- ============ enrollments ============
DROP POLICY IF EXISTS "Teachers invite students to own courses" ON public.enrollments;

CREATE OR REPLACE FUNCTION public.enforce_enrollment_immutable_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF public.has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN NEW;
  END IF;
  IF NEW.student_user_id IS DISTINCT FROM OLD.student_user_id THEN
    RAISE EXCEPTION 'Changing student_user_id on an enrollment is not allowed';
  END IF;
  IF NEW.course_id IS DISTINCT FROM OLD.course_id THEN
    RAISE EXCEPTION 'Changing course_id on an enrollment is not allowed';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enrollments_immutable_fields ON public.enrollments;
CREATE TRIGGER enrollments_immutable_fields
  BEFORE UPDATE ON public.enrollments
  FOR EACH ROW EXECUTE FUNCTION public.enforce_enrollment_immutable_fields();

-- ============ student_notes ============
CREATE OR REPLACE FUNCTION public.enforce_student_notes_student_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  -- Admins are unrestricted
  IF public.has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN NEW;
  END IF;
  -- If the row owner (student) is the caller, only is_read may change
  IF auth.uid() = OLD.student_user_id THEN
    IF NEW.note IS DISTINCT FROM OLD.note
       OR NEW.created_by IS DISTINCT FROM OLD.created_by
       OR NEW.student_user_id IS DISTINCT FROM OLD.student_user_id
       OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
      RAISE EXCEPTION 'Students may only update the is_read field on their notes';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS student_notes_restrict_student_update ON public.student_notes;
CREATE TRIGGER student_notes_restrict_student_update
  BEFORE UPDATE ON public.student_notes
  FOR EACH ROW EXECUTE FUNCTION public.enforce_student_notes_student_update();
