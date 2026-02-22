-- Create visitors table
CREATE TABLE IF NOT EXISTS public.visitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  reason TEXT NOT NULL,
  company TEXT,
  photo_url TEXT,
  qr_code TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'checked_in', 'checked_out')),
  is_blacklisted BOOLEAN NOT NULL DEFAULT false,
  blacklist_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  checked_in_at TIMESTAMPTZ,
  checked_out_at TIMESTAMPTZ
);

-- Create indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_visitors_qr_code ON public.visitors(qr_code);
CREATE INDEX IF NOT EXISTS idx_visitors_phone ON public.visitors(phone);
CREATE INDEX IF NOT EXISTS idx_visitors_email ON public.visitors(email);
CREATE INDEX IF NOT EXISTS idx_visitors_status ON public.visitors(status);
CREATE INDEX IF NOT EXISTS idx_visitors_is_blacklisted ON public.visitors(is_blacklisted);
CREATE INDEX IF NOT EXISTS idx_visitors_created_at ON public.visitors(created_at DESC);

-- Disable RLS for visitors table since this is a public form + admin system
-- without Supabase Auth for visitors. API routes use service_role key.
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;

-- Allow all operations via service_role (API routes)
CREATE POLICY "Allow all operations for service role" ON public.visitors
  FOR ALL
  USING (true)
  WITH CHECK (true);
