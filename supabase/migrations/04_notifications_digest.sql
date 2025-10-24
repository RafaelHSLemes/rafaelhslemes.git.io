-- Expand notifications.type to include 'digest' for periodic email transcripts
do $$ begin
  -- try drop named constraint if it exists, then recreate with the new set
  begin
    alter table public.notifications drop constraint if exists notifications_type_check;
  exception when others then
    null;
  end;
  alter table public.notifications
    add constraint notifications_type_check check (type in ('new_message','admin_reply','digest'));
end $$;

