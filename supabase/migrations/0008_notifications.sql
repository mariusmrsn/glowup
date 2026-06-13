-- Privacy: opt-in visibility (default: visible in global leaderboard)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT TRUE;

-- Personal notifications (contact requests → admin, follows, system)
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS notifications_user_created_idx
  ON public.notifications(user_id, created_at DESC);

-- Admin announcements (broadcast to all users)
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT,
  emoji TEXT NOT NULL DEFAULT '📢',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Track which announcements each user has already read
CREATE TABLE IF NOT EXISTS public.announcement_reads (
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  announcement_id UUID NOT NULL REFERENCES public.announcements(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, announcement_id)
);
