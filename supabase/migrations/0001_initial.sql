-- ============================================================
-- EXTENSIONS
-- ============================================================
create extension if not exists "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================
create type public.rank_type as enum (
  'Beginner', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Legend'
);

create type public.attribute_type as enum (
  'strength', 'intelligence', 'economy', 'discipline', 'social', 'health'
);

create type public.habit_frequency as enum (
  'daily', 'weekly'
);

create type public.activity_type as enum (
  'habit_complete', 'quest_complete', 'level_up', 'achievement', 'streak'
);

create type public.achievement_condition as enum (
  'streak', 'level', 'completions', 'xp'
);

-- ============================================================
-- USERS / CHARACTER TABLE
-- ============================================================
create table public.users (
  id                  uuid primary key default uuid_generate_v4(),
  username            text not null unique,
  email               text not null unique,
  avatar_url          text,
  level               integer not null default 1 check (level between 1 and 100),
  total_xp            bigint not null default 0,
  rank                public.rank_type not null default 'Beginner',
  title               text not null default 'Newcomer',
  coins               integer not null default 0,
  current_streak      integer not null default 0,
  longest_streak      integer not null default 0,
  last_activity_date  date,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ============================================================
-- ATTRIBUTES TABLE
-- ============================================================
create table public.attributes (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.users(id) on delete cascade,
  type        public.attribute_type not null,
  level       integer not null default 1,
  xp          integer not null default 0,
  total_xp    bigint not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique(user_id, type)
);

-- ============================================================
-- HABITS TABLE
-- ============================================================
create table public.habits (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.users(id) on delete cascade,
  name            text not null,
  description     text,
  attribute_type  public.attribute_type not null,
  xp_reward       integer not null default 50 check (xp_reward >= 0),
  coin_reward     integer not null default 10 check (coin_reward >= 0),
  frequency       public.habit_frequency not null default 'daily',
  icon            text not null default 'star',
  color           text not null default '#6366F1',
  is_archived     boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ============================================================
-- HABIT COMPLETIONS TABLE
-- ============================================================
create table public.habit_completions (
  id            uuid primary key default uuid_generate_v4(),
  habit_id      uuid not null references public.habits(id) on delete cascade,
  user_id       uuid not null references public.users(id) on delete cascade,
  completed_at  date not null default current_date,
  xp_earned     integer not null,
  coins_earned  integer not null,
  created_at    timestamptz not null default now(),
  unique(habit_id, completed_at)
);

-- ============================================================
-- DAILY QUESTS TABLE
-- ============================================================
create table public.daily_quests (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.users(id) on delete cascade,
  title           text not null,
  description     text,
  attribute_type  public.attribute_type not null,
  xp_reward       integer not null default 100,
  coin_reward     integer not null default 20,
  target_value    integer not null default 1,
  current_value   integer not null default 0,
  is_completed    boolean not null default false,
  quest_date      date not null default current_date,
  created_at      timestamptz not null default now(),
  unique(user_id, quest_date, title)
);

-- ============================================================
-- ACHIEVEMENTS TABLE (global definitions)
-- ============================================================
create table public.achievements (
  id              text primary key,
  name            text not null,
  description     text not null,
  icon            text not null default 'trophy',
  xp_reward       integer not null default 200,
  coin_reward     integer not null default 50,
  condition_type  public.achievement_condition not null,
  condition_value integer not null,
  created_at      timestamptz not null default now()
);

-- ============================================================
-- USER ACHIEVEMENTS TABLE
-- ============================================================
create table public.user_achievements (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.users(id) on delete cascade,
  achievement_id  text not null references public.achievements(id) on delete cascade,
  unlocked_at     timestamptz not null default now(),
  unique(user_id, achievement_id)
);

-- ============================================================
-- ACTIVITY LOG TABLE
-- ============================================================
create table public.activity_log (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.users(id) on delete cascade,
  type            public.activity_type not null,
  description     text not null,
  xp_earned       integer not null default 0,
  attribute_type  public.attribute_type,
  reference_id    text,
  created_at      timestamptz not null default now()
);

-- ============================================================
-- INDEXES
-- ============================================================
create index idx_attributes_user_id on public.attributes(user_id);
create index idx_habits_user_id on public.habits(user_id);
create index idx_habits_user_active on public.habits(user_id) where is_archived = false;
create index idx_habit_completions_user_id on public.habit_completions(user_id);
create index idx_habit_completions_habit_date on public.habit_completions(habit_id, completed_at);
create index idx_habit_completions_user_date on public.habit_completions(user_id, completed_at);
create index idx_daily_quests_user_date on public.daily_quests(user_id, quest_date);
create index idx_user_achievements_user_id on public.user_achievements(user_id);
create index idx_activity_log_user_id on public.activity_log(user_id);
create index idx_activity_log_user_created on public.activity_log(user_id, created_at desc);

-- ============================================================
-- TRIGGER: Auto-create 6 attribute rows on user insert
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.attributes (user_id, type)
  values
    (new.id, 'strength'),
    (new.id, 'intelligence'),
    (new.id, 'economy'),
    (new.id, 'discipline'),
    (new.id, 'social'),
    (new.id, 'health');
  return new;
end;
$$;

create trigger on_user_created
  after insert on public.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- TRIGGER: updated_at auto-update
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_updated_at
  before update on public.users
  for each row execute function public.handle_updated_at();

create trigger habits_updated_at
  before update on public.habits
  for each row execute function public.handle_updated_at();

create trigger attributes_updated_at
  before update on public.attributes
  for each row execute function public.handle_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.users enable row level security;
alter table public.attributes enable row level security;
alter table public.habits enable row level security;
alter table public.habit_completions enable row level security;
alter table public.daily_quests enable row level security;
alter table public.user_achievements enable row level security;
alter table public.activity_log enable row level security;
alter table public.achievements enable row level security;

create policy "users_select_own" on public.users
  for select using (id::text = current_setting('app.user_id', true));

create policy "attributes_select_own" on public.attributes
  for select using (user_id::text = current_setting('app.user_id', true));

create policy "habits_select_own" on public.habits
  for select using (user_id::text = current_setting('app.user_id', true));

create policy "habits_insert_own" on public.habits
  for insert with check (user_id::text = current_setting('app.user_id', true));

create policy "habits_update_own" on public.habits
  for update using (user_id::text = current_setting('app.user_id', true));

create policy "habits_delete_own" on public.habits
  for delete using (user_id::text = current_setting('app.user_id', true));

create policy "completions_select_own" on public.habit_completions
  for select using (user_id::text = current_setting('app.user_id', true));

create policy "quests_select_own" on public.daily_quests
  for select using (user_id::text = current_setting('app.user_id', true));

create policy "achievements_select_all" on public.achievements
  for select using (true);

create policy "user_achievements_select_own" on public.user_achievements
  for select using (user_id::text = current_setting('app.user_id', true));

create policy "activity_log_select_own" on public.activity_log
  for select using (user_id::text = current_setting('app.user_id', true));

-- ============================================================
-- SEED: Achievement definitions
-- ============================================================
insert into public.achievements (id, name, description, icon, xp_reward, coin_reward, condition_type, condition_value) values
  ('first-habit',     'First Step',          'Complete your first habit',         'footprints',  100,  25,  'completions', 1),
  ('streak-7',        'Week Warrior',        'Maintain a 7-day streak',           'flame',        300,  75,  'streak',      7),
  ('streak-30',       'Monthly Legend',      'Maintain a 30-day streak',          'crown',       1000, 250,  'streak',     30),
  ('streak-100',      'Centurion',           'Maintain a 100-day streak',         'shield',      5000, 1000, 'streak',    100),
  ('level-5',         'Rising Star',         'Reach level 5',                     'star',         200,  50,  'level',       5),
  ('level-10',        'Veteran',             'Reach level 10',                    'award',        500, 100,  'level',      10),
  ('level-25',        'Elite',               'Reach level 25',                    'zap',         1500, 300,  'level',      25),
  ('level-50',        'Master',              'Reach level 50',                    'gem',         5000, 1000, 'level',      50),
  ('completions-10',  'Getting Consistent',  'Complete 10 habits total',          'check-circle', 150,  40,  'completions',10),
  ('completions-50',  'Habit Machine',       'Complete 50 habits total',          'cpu',          500, 100,  'completions',50),
  ('completions-100', 'Century Club',        'Complete 100 habits total',         'trophy',      1000, 200,  'completions',100),
  ('xp-1000',         'XP Hunter',           'Earn 1,000 total XP',               'sparkles',    200,  50,  'xp',       1000),
  ('xp-10000',        'XP Addict',           'Earn 10,000 total XP',              'bolt',        500, 100,  'xp',      10000);
