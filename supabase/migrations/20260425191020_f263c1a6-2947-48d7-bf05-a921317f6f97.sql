-- Grant required privileges so public/anon visitors can submit Mofadla applications.
-- RLS policies were already in place but underlying table grants were missing,
-- which caused "row-level security policy" errors on insert.

GRANT SELECT, INSERT ON public.mofadla_applications TO anon, authenticated;
GRANT SELECT, INSERT ON public.mofadla_application_grades TO anon, authenticated;
GRANT SELECT, INSERT ON public.mofadla_application_preferences TO anon, authenticated;
GRANT SELECT ON public.mofadla_programs TO anon, authenticated;

-- Allow admins to update/delete via authenticated role (RLS still restricts to admin)
GRANT UPDATE, DELETE ON public.mofadla_applications TO authenticated;
GRANT UPDATE, DELETE ON public.mofadla_application_grades TO authenticated;
GRANT UPDATE, DELETE ON public.mofadla_application_preferences TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.mofadla_programs TO authenticated;