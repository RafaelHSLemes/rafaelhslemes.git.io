-- Enable RLS
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;
alter table public.admins enable row level security;

-- Helper to read bool claim
create or replace function public.jwt_is_admin()
returns boolean as $$
declare claims jsonb;
begin
  claims := current_setting('request.jwt.claims', true)::jsonb;
  if claims ? 'is_admin' then
    return coalesce((claims->>'is_admin')::boolean, false);
  end if;
  return exists(select 1 from public.admins where user_id = auth.uid());
end;
$$ language plpgsql stable;

-- Helper to read visitor_id from JWT
create or replace function public.jwt_visitor_id()
returns uuid as $$
declare claims jsonb; v text;
begin
  claims := current_setting('request.jwt.claims', true)::jsonb;
  v := claims->>'visitor_id';
  if v is null then return null; end if;
  return v::uuid;
end;
$$ language plpgsql stable;

-- conversations policies
drop policy if exists conv_admin_all on public.conversations;
create policy conv_admin_all on public.conversations
  for all to authenticated
  using (public.jwt_is_admin())
  with check (public.jwt_is_admin());

drop policy if exists conv_anon_own on public.conversations;
create policy conv_anon_own on public.conversations
  for select using (visitor_id = public.jwt_visitor_id())
  with check (visitor_id = public.jwt_visitor_id());

-- messages policies
drop policy if exists msg_admin_all on public.messages;
create policy msg_admin_all on public.messages
  for all to authenticated
  using (public.jwt_is_admin())
  with check (public.jwt_is_admin());

drop policy if exists msg_anon_own on public.messages;
create policy msg_anon_own on public.messages
  for select using (exists(select 1 from public.conversations c where c.id = conversation_id and c.visitor_id = public.jwt_visitor_id()))
  with check (exists(select 1 from public.conversations c where c.id = conversation_id and c.visitor_id = public.jwt_visitor_id()));

-- notifications: only admins
drop policy if exists notif_admin_all on public.notifications;
create policy notif_admin_all on public.notifications
  for all to authenticated
  using (public.jwt_is_admin())
  with check (public.jwt_is_admin());

-- admins: only admins can read/write (self-manage)
drop policy if exists admins_admin_all on public.admins;
create policy admins_admin_all on public.admins
  for all to authenticated
  using (public.jwt_is_admin())
  with check (public.jwt_is_admin());

