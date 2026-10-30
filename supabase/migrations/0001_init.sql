-- GitHub token lives here, encrypted. RLS on with no policies: service role only.
create table public.profiles (
  user_id uuid primary key references auth.users on delete cascade,
  github_login text not null,
  github_token_enc text,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create table public.device_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  label text not null,
  platform text not null,
  os_version text not null,
  device_model text not null,
  app_version text,
  created_at timestamptz not null default now()
);
alter table public.device_profiles enable row level security;
create policy "own device profiles" on public.device_profiles
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  repo_full_name text not null,
  issue_number int not null,
  issue_url text not null,
  action text not null check (action in ('created', 'commented', 'reopened')),
  title text not null,
  created_at timestamptz not null default now()
);
alter table public.reports enable row level security;
create policy "read own reports" on public.reports
  for select using (user_id = auth.uid());
create policy "insert own reports" on public.reports
  for insert with check (user_id = auth.uid());

-- Screenshots: public read via unguessable paths, authenticated upload.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('screenshots', 'screenshots', true, 10485760, array['image/*']);
create policy "authenticated upload screenshots" on storage.objects
  for insert to authenticated with check (bucket_id = 'screenshots');
