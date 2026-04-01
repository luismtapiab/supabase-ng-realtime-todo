-- Migration: Create pixels table for PixelSync
-- Date: 2026-04-01

CREATE TABLE IF NOT EXISTS public.pixels (
  x integer NOT NULL,
  y integer NOT NULL,
  color text NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (x, y)
);

-- Enable Row Level Security
ALTER TABLE public.pixels ENABLE ROW LEVEL SECURITY;

-- Policies
-- 1. Anyone logged in can see the canvas
CREATE POLICY "Enable read access for authenticated users"
ON public.pixels
FOR SELECT
TO authenticated
USING (true);

-- 2. Anyone logged in can paint (Upsert)
CREATE POLICY "Enable insert/update for authenticated users"
ON public.pixels
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Enable Realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE public.pixels;
