create table if not exists tasks (
    id bigserial primary key,
    title varchar(140) not null,
    description varchar(2000),
    status varchar(16) not null,
    created_at timestamptz not null,
    updated_at timestamptz not null,
    user_id bigint
);
create index if not exists idx_tasks_status on tasks(status);
create index if not exists idx_tasks_title on tasks(lower(title));

