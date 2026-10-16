create extension if not exists pg_cron;

create index if not exists tasks_archived_at_cleanup_idx
on public.tasks (archived_at)
where archived_at is not null;

select cron.schedule(
    'delete-archived-tasks-after-30-days',
    '15 3 * * *',
    $$
    delete from public.tasks
    where archived_at is not null
      and archived_at <= now() - interval '30 days';
    $$
);