-- Add password hash for email/password auth
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS password_hash text;
