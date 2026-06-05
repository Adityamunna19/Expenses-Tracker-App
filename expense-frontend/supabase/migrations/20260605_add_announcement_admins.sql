create table if not exists public.announcement_admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.announcement_admins enable row level security;

create or replace function public.is_announcement_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.announcement_admins
    where user_id = auth.uid()
  );
$$;

create or replace function public.claim_announcement_admin()
returns boolean
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  admin_count integer;
begin
  select count(*) into admin_count from public.announcement_admins;

  if admin_count > 0 and not exists (
    select 1
    from public.announcement_admins
    where user_id = auth.uid()
  ) then
    raise exception 'Announcement admin access is already assigned.';
  end if;

  insert into public.announcement_admins (user_id)
  values (auth.uid())
  on conflict (user_id) do nothing;

  return true;
end;
$$;

grant execute on function public.is_announcement_admin() to authenticated;
grant execute on function public.claim_announcement_admin() to authenticated;

create policy "Announcement admins can create announcements"
  on public.announcements
  for insert
  with check (public.is_announcement_admin());

create policy "Announcement admins can update announcements"
  on public.announcements
  for update
  using (public.is_announcement_admin())
  with check (public.is_announcement_admin());

create policy "Announcement admins can delete announcements"
  on public.announcements
  for delete
  using (public.is_announcement_admin());
