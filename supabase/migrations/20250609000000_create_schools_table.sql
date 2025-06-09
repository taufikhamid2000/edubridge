-- Drop existing policies if they exist
drop policy if exists "Schools are viewable by everyone" on public.schools;
drop policy if exists "Only admin can insert schools" on public.schools;
drop policy if exists "Only admin can update schools" on public.schools;
drop policy if exists "School stats are viewable by everyone" on public.school_stats;
drop policy if exists "Only system can modify school stats" on public.school_stats;

-- Create schools table if it doesn't exist
create table if not exists public.schools (
  id uuid not null default extensions.uuid_generate_v4(),
  name text not null,
  type text not null,
  code text unique,  -- official MOE school code
  district text not null,
  state text not null,
  address text,
  website text,
  phone text,
  principal_name text,
  total_students integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint schools_pkey primary key (id),
  constraint schools_type_check check (type in ('SMK', 'SMKA', 'MRSM', 'Sekolah Sains', 'Sekolah Sukan', 'Sekolah Seni', 'SBP', 'SMJK', 'KV'))
);

-- Index for faster lookups
do $$ 
begin
  if not exists (select 1 from pg_indexes where indexname = 'idx_schools_type') then
    create index idx_schools_type on public.schools using btree (type);
  end if;
  if not exists (select 1 from pg_indexes where indexname = 'idx_schools_state') then
    create index idx_schools_state on public.schools using btree (state);
  end if;
  if not exists (select 1 from pg_indexes where indexname = 'idx_schools_district') then
    create index idx_schools_district on public.schools using btree (district);
  end if;
end $$;

-- Updated timestamp trigger
do $$ 
begin
  if not exists (select 1 from pg_trigger where tgname = 'set_schools_updated_at') then
    create trigger set_schools_updated_at
      before update on public.schools
      for each row
      execute function public.handle_updated_at();
  end if;
end $$;

-- RLS policies
alter table public.schools enable row level security;

-- Everyone can view schools
create policy "Schools are viewable by everyone"
  on public.schools for select
  using (true);

-- Only admin can insert/update/delete
create policy "Only admin can insert schools"
  on public.schools for insert
  with check (auth.jwt() ->> 'role' = 'admin');

create policy "Only admin can update schools"
  on public.schools for update
  using (auth.jwt() ->> 'role' = 'admin');

-- Create a school_stats table to track performance metrics
create table if not exists public.school_stats (
  school_id uuid not null references public.schools(id) on delete cascade,
  average_score numeric(5,2) not null default 0,
  participation_rate numeric(5,2) not null default 0,
  total_quizzes_taken integer not null default 0,
  total_questions_answered integer not null default 0,
  correct_answers integer not null default 0,
  last_calculated_at timestamptz not null default now(),
  constraint school_stats_pkey primary key (school_id)
);

-- RLS policies for school_stats
alter table public.school_stats enable row level security;

create policy "School stats are viewable by everyone"
  on public.school_stats for select
  using (true);

create policy "Only system can modify school stats"
  on public.school_stats for all
  using (auth.jwt() ->> 'role' = 'service_role');

-- Add school_id to user profiles
alter table public.user_profiles 
  add column if not exists school_id uuid references public.schools(id),
  add column if not exists school_role text check (school_role in ('student', 'teacher', 'admin'));
