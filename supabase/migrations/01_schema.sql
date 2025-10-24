-- Tables
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  visitor_id uuid,
  last_event_at timestamptz,
  status text check (status in ('open','closed')) default 'open',
  email text null
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.conversations(id) on delete cascade,
  author text check (author in ('visitor','admin')) not null,
  text text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.conversations(id) on delete cascade,
  type text check (type in ('new_message','admin_reply')) not null,
  sent_at timestamptz not null default now()
);

create table if not exists public.admins (
  user_id uuid primary key
);

-- Indexes
create index if not exists messages_conversation_created_idx on public.messages(conversation_id, created_at);
create index if not exists conversations_visitor_idx on public.conversations(visitor_id);

-- Triggers to update last_event_at on new messages
create or replace function public.touch_conversation_last_event()
returns trigger as $$
begin
  update public.conversations set last_event_at = now() where id = NEW.conversation_id;
  return NEW;
end;$$ language plpgsql;

drop trigger if exists trg_touch_conversation on public.messages;
create trigger trg_touch_conversation after insert on public.messages
for each row execute function public.touch_conversation_last_event();

