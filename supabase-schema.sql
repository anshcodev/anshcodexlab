create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  company text,
  role text not null default 'customer' check (role in ('customer','admin')),
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path=public
as $$
begin
  insert into public.profiles(id,full_name,company)
  values(new.id,coalesce(new.raw_user_meta_data->>'full_name',''),coalesce(new.raw_user_meta_data->>'company',''))
  on conflict(id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
on public.profiles for select
using (auth.uid()=id);

drop policy if exists "Admins can read profiles" on public.profiles;
create policy "Admins can read profiles"
on public.profiles for select
using (exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin'));

-- Public project enquiries / lead inbox
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  business text,
  email text not null,
  service text not null,
  budget text,
  message text not null,
  status text not null default 'new' check (status in ('new','contacted','proposal','won','lost'))
);

alter table public.leads enable row level security;

drop policy if exists "Anyone can submit a lead" on public.leads;
create policy "Anyone can submit a lead"
on public.leads for insert
to anon, authenticated
with check (true);

drop policy if exists "Admins can view leads" on public.leads;
create policy "Admins can view leads"
on public.leads for select
to authenticated
using (exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin'));

drop policy if exists "Admins can update leads" on public.leads;
create policy "Admins can update leads"
on public.leads for update
to authenticated
using (exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin'))
with check (exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin'));

-- After creating your own account, promote it to admin in SQL Editor:
-- update public.profiles set role='admin' where id='YOUR_USER_UUID';
