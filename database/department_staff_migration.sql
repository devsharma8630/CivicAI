alter table profiles drop constraint profiles_role_check;
alter table profiles add constraint profiles_role_check
  check (role = any (array['citizen'::text, 'admin'::text, 'department_staff'::text]));

alter table complaints drop constraint complaints_status_check;
alter table complaints add constraint complaints_status_check
  check (status = any (array['PENDING'::text, 'UNDER_REVIEW'::text, 'ASSIGNED'::text, 'IN_PROGRESS'::text, 'RESOLVED'::text, 'REJECTED'::text]));

alter table profiles add column if not exists department_id uuid references departments(id);
alter table complaints add column if not exists resolution_note text;

create table if not exists complaint_history (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null references complaints(id) on delete cascade,
  changed_by uuid references profiles(id),
  old_status text,
  new_status text,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists complaint_history_complaint_id_idx on complaint_history(complaint_id);

alter table complaint_history enable row level security;

create policy p_complaint_history_select on complaint_history for select to public
using (
  is_admin()
  or exists (select 1 from complaints c where c.id = complaint_id and c.user_id = auth.uid())
  or exists (
    select 1 from complaints c
    join profiles p on p.id = auth.uid()
    join departments d on d.id = p.department_id
    where c.id = complaint_id and p.role = 'department_staff' and c.department = d.name
  )
);

create policy p_complaint_history_insert on complaint_history for insert to public
with check (
  is_admin()
  or (
    changed_by = auth.uid()
    and exists (
      select 1 from complaints c
      join profiles p on p.id = auth.uid()
      join departments d on d.id = p.department_id
      where c.id = complaint_id and p.role = 'department_staff' and c.department = d.name
    )
  )
);

create policy p_complaints_dept_staff_select on complaints for select to public
using (
  exists (
    select 1 from profiles p
    join departments d on d.id = p.department_id
    where p.id = auth.uid() and p.role = 'department_staff' and d.name = complaints.department
  )
);

create policy p_complaints_dept_staff_update on complaints for update to public
using (
  exists (
    select 1 from profiles p
    join departments d on d.id = p.department_id
    where p.id = auth.uid() and p.role = 'department_staff' and d.name = complaints.department
  )
)
with check (
  exists (
    select 1 from profiles p
    join departments d on d.id = p.department_id
    where p.id = auth.uid() and p.role = 'department_staff' and d.name = complaints.department
  )
);

create policy p_departments_update on departments for update to public
using (is_admin()) with check (is_admin());

create policy p_departments_delete on departments for delete to public
using (is_admin());

create policy p_storage_dept_staff on storage.objects for all to public
using (
  bucket_id = 'complaint-images'
  and exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'department_staff')
)
with check (
  bucket_id = 'complaint-images'
  and exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'department_staff')
);
