-- Create storage bucket for visitor photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('visitor-photos', 'visitor-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to visitor photos
CREATE POLICY "Public read access for visitor photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'visitor-photos');

-- Allow insert access for visitor photos (service role handles uploads)
CREATE POLICY "Allow upload of visitor photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'visitor-photos');

-- Allow delete access for visitor photos
CREATE POLICY "Allow delete of visitor photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'visitor-photos');
