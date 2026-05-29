-- NoteFlow V1 Supabase schema
-- Run this in Supabase SQL Editor once before deploying.

create extension if not exists pgcrypto;

create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text default '',
  role text not null default 'member' check (role in ('admin', 'director', 'manager', 'member')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_app_state (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  app_key text not null default 'note_task_v1',
  state jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, app_key)
);

create or replace function public.current_user_role()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select role from public.user_profiles where id = auth.uid()
$$;

create or replace function public.current_user_is_active()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(is_active, false) from public.user_profiles where id = auth.uid()
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profiles (id, email, full_name, role, is_active)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    case when lower(coalesce(new.email, '')) = 'nikhilpareta16@gmail.com' then 'admin' else 'member' end,
    true
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(nullif(excluded.full_name, ''), public.user_profiles.full_name),
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_noteflow on auth.users;
create trigger on_auth_user_created_noteflow
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table public.user_profiles enable row level security;
alter table public.user_app_state enable row level security;

-- Profiles policies
drop policy if exists "profiles_select_own_or_admin_director" on public.user_profiles;
create policy "profiles_select_own_or_admin_director"
  on public.user_profiles
  for select
  to authenticated
  using (
    id = auth.uid()
    or public.current_user_role() in ('admin', 'director')
  );

drop policy if exists "profiles_insert_own" on public.user_profiles;
create policy "profiles_insert_own"
  on public.user_profiles
  for insert
  to authenticated
  with check (id = auth.uid());

drop policy if exists "profiles_update_admin_only" on public.user_profiles;
create policy "profiles_update_admin_only"
  on public.user_profiles
  for update
  to authenticated
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

-- App state policies
drop policy if exists "app_state_select_own" on public.user_app_state;
create policy "app_state_select_own"
  on public.user_app_state
  for select
  to authenticated
  using (user_id = auth.uid() and public.current_user_is_active());

drop policy if exists "app_state_insert_own" on public.user_app_state;
create policy "app_state_insert_own"
  on public.user_app_state
  for insert
  to authenticated
  with check (user_id = auth.uid() and public.current_user_is_active());

drop policy if exists "app_state_update_own" on public.user_app_state;
create policy "app_state_update_own"
  on public.user_app_state
  for update
  to authenticated
  using (user_id = auth.uid() and public.current_user_is_active())
  with check (user_id = auth.uid() and public.current_user_is_active());

drop policy if exists "app_state_delete_own" on public.user_app_state;
create policy "app_state_delete_own"
  on public.user_app_state
  for delete
  to authenticated
  using (user_id = auth.uid() and public.current_user_is_active());

-- In case the first admin has already signed up before this SQL was run.
update public.user_profiles
set role = 'admin', is_active = true, updated_at = now()
where lower(email) = 'nikhilpareta16@gmail.com';
