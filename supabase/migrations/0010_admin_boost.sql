-- Boost admin account: marius_muresan@aol.com
-- Run this in Supabase SQL Editor

DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Find the user by email
  SELECT id INTO v_user_id FROM public.users WHERE email = 'marius_muresan@aol.com' LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User marius_muresan@aol.com not found. Make sure you are logged in with that account first.';
  END IF;

  -- Max stats: Legend rank, 1M XP, level 100, 99999 coins, public
  UPDATE public.users
  SET
    total_xp       = 1000000,
    level          = 100,
    rank           = 'Legend',
    coins          = 99999,
    is_public      = true,
    current_streak = 365,
    longest_streak = 365
  WHERE id = v_user_id;

  -- Max out all 6 attributes
  UPDATE public.attributes
  SET
    total_xp = 1000000,
    xp       = 0,
    level    = 100
  WHERE user_id = v_user_id;

  -- Create legendary shop items if they don't exist
  INSERT INTO public.shop_items (id, name, description, type, icon, cost_coins, rarity)
  VALUES
    ('admin-title-founder',  'GlowUp Gründer',  'Der erste und einzige Gründer von GlowUp',  'title', '👑', 999999, 'legendary'),
    ('admin-badge-crown',    'Krone',            'Symbol der absoluten Macht',                 'badge', '👑', 999999, 'legendary'),
    ('admin-badge-lightning','Blitz',            'Schneller als das Licht',                   'badge', '⚡', 999999, 'legendary'),
    ('admin-badge-fire',     'Feuer',            'Nicht aufzuhalten',                          'badge', '🔥', 999999, 'legendary'),
    ('admin-badge-trophy',   'Trophäe',          'Ungeschlagen',                               'badge', '🏆', 999999, 'legendary'),
    ('admin-badge-diamond',  'Diamant',          'Seltenster Rang',                            'badge', '💎', 999999, 'legendary')
  ON CONFLICT (id) DO NOTHING;

  -- Give all items to the user (own everything)
  INSERT INTO public.user_items (user_id, item_id, equipped)
  SELECT v_user_id, id, false
  FROM public.shop_items
  WHERE id LIKE 'admin-%'
  ON CONFLICT (user_id, item_id) DO NOTHING;

  -- Equip the title (only one title at a time)
  UPDATE public.user_items
  SET equipped = false
  WHERE user_id = v_user_id
    AND item_id IN (SELECT id FROM public.shop_items WHERE type = 'title');

  UPDATE public.user_items
  SET equipped = true
  WHERE user_id = v_user_id AND item_id = 'admin-title-founder';

  -- Equip all badges
  UPDATE public.user_items
  SET equipped = true
  WHERE user_id = v_user_id
    AND item_id IN ('admin-badge-crown','admin-badge-lightning','admin-badge-fire','admin-badge-trophy','admin-badge-diamond');

  RAISE NOTICE 'Admin account boosted successfully for user: %', v_user_id;
END;
$$;
