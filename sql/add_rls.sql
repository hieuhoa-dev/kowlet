create or replace function public.increment_bookmark_count(
  p_tech_id uuid,
  p_delta   integer
)
returns void
language sql
security definer
set search_path = public
as $$
  update public.tech
  set bookmark_count = greatest(0, bookmark_count + p_delta)
  where id = p_tech_id;
$$;

-- ─── TAG CATEGORY ─────────────────────────────────────────────
alter table public.tag_category enable row level security;

create policy "tag_category_read_all"
on public.tag_category for select
to anon, authenticated
using (true);

create policy "tag_category_admin_write"
on public.tag_category for all
to authenticated
using (
  exists (select 1 from public.profile where id = (select auth.uid()) and role = 'admin')
)
with check (
  exists (select 1 from public.profile where id = (select auth.uid()) and role = 'admin')
);

-- ─── TAG ──────────────────────────────────────────────────────
alter table public.tag enable row level security;

create policy "tag_read_all"
on public.tag for select
to anon, authenticated
using (true);

create policy "tag_admin_insert"
on public.tag for insert
to authenticated
with check (
  exists (select 1 from public.profile where id = (select auth.uid()) and role = 'admin')
);

create policy "tag_admin_update"
on public.tag for update
to authenticated
using (
  exists (select 1 from public.profile where id = (select auth.uid()) and role = 'admin')
)
with check (
  exists (select 1 from public.profile where id = (select auth.uid()) and role = 'admin')
);

create policy "tag_admin_delete"
on public.tag for delete
to authenticated
using (
  exists (select 1 from public.profile where id = (select auth.uid()) and role = 'admin')
);

-- ─── TAG_TECH ─────────────────────────────────────────────────
alter table public.tag_tech enable row level security;

create policy "tag_tech_read_all"
on public.tag_tech for select
to anon, authenticated
using (true);

create policy "tag_tech_admin_insert"
on public.tag_tech for insert
to authenticated
with check (
  exists (select 1 from public.profile where id = (select auth.uid()) and role = 'admin')
);

create policy "tag_tech_admin_delete"
on public.tag_tech for delete
to authenticated
using (
  exists (select 1 from public.profile where id = (select auth.uid()) and role = 'admin')
);

-- ─── TECH ─────────────────────────────────────────────────────
alter table public.tech enable row level security;

create policy "tech_read_all"
on public.tech for select
to anon, authenticated
using (true);

create policy "tech_admin_insert"
on public.tech for insert
to authenticated
with check (
  exists (select 1 from public.profile where id = (select auth.uid()) and role = 'admin')
);

create policy "tech_admin_update"
on public.tech for update
to authenticated
using (
  exists (select 1 from public.profile where id = (select auth.uid()) and role = 'admin')
)
with check (
  exists (select 1 from public.profile where id = (select auth.uid()) and role = 'admin')
);

create policy "tech_admin_delete"
on public.tech for delete
to authenticated
using (
  exists (select 1 from public.profile where id = (select auth.uid()) and role = 'admin')
);

-- ─── NOTIFICATION ─────────────────────────────────────────────
alter table public.notification enable row level security;

-- Users chỉ thấy submission của chính mình; admin thấy tất cả
create policy "notification_read_own_or_admin"
on public.notification for select
to authenticated
using (
  user_id = (select auth.uid())
  or exists (select 1 from public.profile where id = (select auth.uid()) and role = 'admin')
);

-- Chỉ submit cho chính mình
create policy "notification_insert_own"
on public.notification for insert
to authenticated
with check (user_id = (select auth.uid()));

-- Chỉ admin được update status (approve/reject)
create policy "notification_admin_update"
on public.notification for update
to authenticated
using (
  exists (select 1 from public.profile where id = (select auth.uid()) and role = 'admin')
)
with check (
  exists (select 1 from public.profile where id = (select auth.uid()) and role = 'admin')
);

-- ─── BOOKMARK ─────────────────────────────────────────────────
alter table public.bookmark enable row level security;

create policy "bookmark_read_own"
on public.bookmark for select
to authenticated
using (user_id = (select auth.uid()));

create policy "bookmark_insert_own"
on public.bookmark for insert
to authenticated
with check (user_id = (select auth.uid()));

create policy "bookmark_delete_own"
on public.bookmark for delete
to authenticated
using (user_id = (select auth.uid()));

-- ─── PROFILE ──────────────────────────────────────────────────
alter table public.profile enable row level security;

create policy "profile_read_own_or_admin"
on public.profile for select
to authenticated
using (
  id = (select auth.uid())
  or exists (select 1 from public.profile p2 where p2.id = (select auth.uid()) and p2.role = 'admin')
);

-- Không cho phép tự nâng role lên admin
create policy "profile_update_own"
on public.profile for update
to authenticated
using (id = (select auth.uid()))
with check (
  id = (select auth.uid())
  and (
    role = (select role from public.profile where id = (select auth.uid()))
    or exists (select 1 from public.profile where id = (select auth.uid()) and role = 'admin')
  )
);

-- ─── Auth trigger ─────────────────────────────────────────────
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