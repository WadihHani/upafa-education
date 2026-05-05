-- Enum for status (reuse application_status if it exists, otherwise create new one)
DO $$ BEGIN
  CREATE TYPE quick_registration_status AS ENUM ('pending','approved','rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE public.mofadla_quick_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  father_name text NOT NULL DEFAULT '',
  mother_name text NOT NULL DEFAULT '',
  national_id text NOT NULL,
  birth_date date,
  phone text NOT NULL,
  email text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  last_certificate text NOT NULL DEFAULT '',
  average numeric NOT NULL DEFAULT 0,
  graduation_year integer,
  personal_photo_url text NOT NULL DEFAULT '',
  national_id_url text NOT NULL DEFAULT '',
  certificate_url text NOT NULL DEFAULT '',
  payment_receipt_url text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  status quick_registration_status NOT NULL DEFAULT 'pending',
  admin_notes text NOT NULL DEFAULT '',
  decided_at timestamptz,
  decided_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.mofadla_quick_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit quick registration"
ON public.mofadla_quick_registrations
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(trim(full_name)) > 0
  AND length(trim(national_id)) > 0
  AND length(trim(phone)) > 0
);

CREATE POLICY "Admins view quick registrations"
ON public.mofadla_quick_registrations
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins update quick registrations"
ON public.mofadla_quick_registrations
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins delete quick registrations"
ON public.mofadla_quick_registrations
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_mofadla_quick_registrations_updated_at
BEFORE UPDATE ON public.mofadla_quick_registrations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Allow public uploads to mofadla-receipts bucket (for personal photo, ID, certificate, receipt)
DO $$ BEGIN
  CREATE POLICY "Public can upload mofadla quick-register documents"
  ON storage.objects
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'mofadla-receipts');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Public can read mofadla-receipts"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'mofadla-receipts');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;