create function is_admin() returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'ADMIN')
$$;

create function current_role_of_user() returns user_role language sql stable security definer set search_path = public as $$
  select role from profiles where id = auth.uid()
$$;

alter table profiles enable row level security;
alter table departments enable row level security;
alter table complaints enable row level security;
alter table complaint_ai_analysis enable row level security;
alter table complaint_updates enable row level security;
alter table notifications enable row level security;
alter table admin_actions enable row level security;

create policy profiles_select on profiles for select to authenticated
  using (id = auth.uid() or is_admin());
create policy profiles_update on profiles for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid() and role = current_role_of_user());
create policy profiles_admin_update on profiles for update to authenticated
  using (is_admin()) with check (is_admin());

create policy departments_select on departments for select to authenticated using (true);
create policy departments_admin on departments for all to authenticated
  using (is_admin()) with check (is_admin());

create policy complaints_select on complaints for select to authenticated
  using (user_id = auth.uid() or is_admin());
create policy complaints_insert on complaints for insert to authenticated
  with check (user_id = auth.uid() and status = 'SUBMITTED');
create policy complaints_admin_update on complaints for update to authenticated
  using (is_admin()) with check (is_admin());

create policy analysis_select on complaint_ai_analysis for select to authenticated
  using (is_admin() or exists (select 1 from complaints c where c.id = complaint_id and c.user_id = auth.uid()));
create policy analysis_insert on complaint_ai_analysis for insert to authenticated
  with check (exists (select 1 from complaints c where c.id = complaint_id and c.user_id = auth.uid()));

create policy updates_select on complaint_updates for select to authenticated
  using (is_admin() or exists (select 1 from complaints c where c.id = complaint_id and c.user_id = auth.uid()));
create policy updates_insert on complaint_updates for insert to authenticated
  with check (is_admin() and admin_id = auth.uid());

create policy notifications_select on notifications for select to authenticated
  using (user_id = auth.uid());
create policy notifications_update on notifications for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy admin_actions_all on admin_actions for all to authenticated
  using (is_admin()) with check (is_admin() and admin_id = auth.uid());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('complaint-images', 'complaint-images', false, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

create policy images_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'complaint-images' and (storage.foldername(name))[1] = auth.uid()::text);
create policy images_select on storage.objects for select to authenticated
  using (bucket_id = 'complaint-images' and ((storage.foldername(name))[1] = auth.uid()::text or is_admin()));

create function log_complaint_status_change() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.status is distinct from old.status then
    insert into complaint_updates (complaint_id, admin_id, old_status, new_status, note)
    values (new.id, auth.uid(), old.status, new.status, new.description);

    insert into notifications (user_id, title, message, type)
    values (
      new.user_id,
      'Complaint status updated',
      new.complaint_number || ' is now ' || new.status || '.',
      'STATUS_CHANGE'
    );
  end if;
  return new;
end $$;

create trigger complaints_status_logged after update of status on complaints
for each row execute function log_complaint_status_change();

create function block_role_self_promotion() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role and not is_admin() then
    raise exception 'Only an admin can change a user role.';
  end if;
  return new;
end $$;

create trigger profiles_block_self_promotion before update on profiles
for each row execute function block_role_self_promotion();
