-- Enable Realtime on messages table for postgres_changes
do $$ begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    execute 'alter publication supabase_realtime add table public.messages';
  end if;
end $$;

