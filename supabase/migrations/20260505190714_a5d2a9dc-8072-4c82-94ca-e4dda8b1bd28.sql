
-- Add column for payment receipt URL
ALTER TABLE public.mofadla_applications
ADD COLUMN IF NOT EXISTS payment_receipt_url text NOT NULL DEFAULT '';

-- Create storage bucket for mofadla payment receipts
INSERT INTO storage.buckets (id, name, public)
VALUES ('mofadla-receipts', 'mofadla-receipts', true)
ON CONFLICT (id) DO NOTHING;

-- Public can view receipts
CREATE POLICY "Public can view mofadla receipts"
ON storage.objects FOR SELECT
USING (bucket_id = 'mofadla-receipts');

-- Anyone can upload receipts (applicants are anonymous at submission time)
CREATE POLICY "Anyone can upload mofadla receipts"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'mofadla-receipts');
