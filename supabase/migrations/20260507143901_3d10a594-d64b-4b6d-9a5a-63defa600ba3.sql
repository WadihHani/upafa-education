
CREATE OR REPLACE FUNCTION public.submit_mofadla_quick_registration(
  p_full_name text,
  p_father_name text DEFAULT '',
  p_mother_name text DEFAULT '',
  p_national_id text DEFAULT '',
  p_phone text DEFAULT '',
  p_email text DEFAULT '',
  p_birth_date date DEFAULT NULL,
  p_address text DEFAULT '',
  p_last_certificate text DEFAULT '',
  p_average numeric DEFAULT 0,
  p_graduation_year integer DEFAULT NULL,
  p_personal_photo_url text DEFAULT '',
  p_national_id_url text DEFAULT '',
  p_certificate_url text DEFAULT '',
  p_payment_receipt_url text DEFAULT ''
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_full_name text := btrim(coalesce(p_full_name, ''));
  v_national_id text := btrim(coalesce(p_national_id, ''));
  v_phone text := btrim(coalesce(p_phone, ''));
  v_id uuid;
  v_created_at timestamptz;
BEGIN
  IF length(v_full_name) < 3 THEN
    RAISE EXCEPTION 'الاسم الكامل مطلوب' USING ERRCODE = '22023';
  END IF;
  IF length(v_national_id) < 3 THEN
    RAISE EXCEPTION 'الرقم الوطني مطلوب' USING ERRCODE = '22023';
  END IF;
  IF length(v_phone) < 6 THEN
    RAISE EXCEPTION 'رقم الهاتف مطلوب' USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.mofadla_quick_registrations (
    full_name, father_name, mother_name, national_id, phone, email,
    birth_date, address, last_certificate, average, graduation_year,
    personal_photo_url, national_id_url, certificate_url, payment_receipt_url
  ) VALUES (
    v_full_name,
    btrim(coalesce(p_father_name, '')),
    btrim(coalesce(p_mother_name, '')),
    v_national_id,
    v_phone,
    btrim(coalesce(p_email, '')),
    p_birth_date,
    btrim(coalesce(p_address, '')),
    btrim(coalesce(p_last_certificate, '')),
    GREATEST(0, LEAST(100, coalesce(p_average, 0))),
    p_graduation_year,
    btrim(coalesce(p_personal_photo_url, '')),
    btrim(coalesce(p_national_id_url, '')),
    btrim(coalesce(p_certificate_url, '')),
    btrim(coalesce(p_payment_receipt_url, ''))
  )
  RETURNING id, created_at INTO v_id, v_created_at;

  RETURN jsonb_build_object(
    'success', true,
    'id', v_id,
    'submitted_at', v_created_at
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_mofadla_quick_registration(
  text, text, text, text, text, text, date, text, text, numeric, integer,
  text, text, text, text
) TO anon, authenticated;
