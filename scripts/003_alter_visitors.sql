-- Add missing columns
ALTER TABLE public.visitors ADD COLUMN IF NOT EXISTS host TEXT;
ALTER TABLE public.visitors ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.visitors ADD COLUMN IF NOT EXISTS blacklisted_at TIMESTAMPTZ;

-- Drop the old status check constraint and add the updated one
ALTER TABLE public.visitors DROP CONSTRAINT IF EXISTS visitors_status_check;
ALTER TABLE public.visitors ALTER COLUMN status SET DEFAULT 'registered';
ALTER TABLE public.visitors ADD CONSTRAINT visitors_status_check CHECK (status IN ('registered', 'checked_in', 'checked_out'));

-- Update any existing 'pending' rows to 'registered'
UPDATE public.visitors SET status = 'registered' WHERE status = 'pending';
