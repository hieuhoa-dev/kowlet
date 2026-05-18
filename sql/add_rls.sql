-- Enable RLS if not enabled
alter table public.tech enable row level security;

-- Read: allow everyone to see techs (feed)
create policy "tech_read_all"
on public.tech
for select
to anon, authenticated
using (true);

-- Admin-only write
create policy "tech_admin_insert"
on public.tech
for insert
to authenticated
with check (
  exists (
    select 1
    from public.profile
    where id = (select auth.uid())
      and role = 'admin'
  )
);

create policy "tech_admin_update"
on public.tech
for update
to authenticated
using (
  exists (
    select 1
    from public.profile
    where id = (select auth.uid())
      and role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.profile
    where id = (select auth.uid())
      and role = 'admin'
  )
);

create policy "tech_admin_delete"
on public.tech
for delete
to authenticated
using (
  exists (
    select 1
    from public.profile
    where id = (select auth.uid())
      and role = 'admin'
  )
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.profile (id, role)
    values (new.id, 'user')
    on conflict (id) do nothing;
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
