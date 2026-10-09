create extension if not exists pgcrypto;

create type user_role as enum ('USER','ADMIN');
create type complaint_status as enum ('SUBMITTED','UNDER_REVIEW','ASSIGNED','IN_PROGRESS','RESOLVED','REJECTED');
create type severity_level as enum ('LOW','MEDIUM','HIGH','CRITICAL');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  role user_role not null default 'USER',
  avatar_url text,
  created_at timestamptz not null default now()
);

create table departments (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz not null default now()
);

create sequence complaint_seq start 1;

create table complaints (
  id uuid primary key default gen_random_uuid(),
  complaint_number text unique not null default ('CIV-' || extract(year from now())::int || '-' || lpad(nextval('complaint_seq')::text, 6, '0')),
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  description text,
  category text not null,
  severity severity_level not null default 'MEDIUM',
  priority_score int not null default 50 check (priority_score between 0 and 100),
  department text,
  status complaint_status not null default 'SUBMITTED',
  latitude double precision not null,
  longitude double precision not null,
  address text,
  image_url text,
  ai_confidence numeric(3,2),
  spam_score int not null default 0 check (spam_score between 0 and 100),
  is_suspicious boolean not null default false,
  duplicate_group_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table complaint_ai_analysis (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null references complaints(id) on delete cascade,
  category text,
  severity severity_level,
  priority_score int,
  department text,
  impact text,
  confidence numeric(3,2),
  ai_description text,
  created_at timestamptz not null default now()
);

create table complaint_updates (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null references complaints(id) on delete cascade,
  admin_id uuid references profiles(id),
  old_status complaint_status,
  new_status complaint_status,
  note text,
  created_at timestamptz not null default now()
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table admin_actions (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references profiles(id),
  complaint_id uuid references complaints(id) on delete set null,
  action text not null,
  details jsonb,
  created_at timestamptz not null default now()
);

create index on complaints (user_id);
create index on complaints (status);
create index on complaints (priority_score desc);
create index on complaints (duplicate_group_id);
create index on complaints (latitude, longitude);
create index on complaints (created_at desc);
create index on notifications (user_id, is_read);
create index on complaint_updates (complaint_id);

create function set_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  if new.status = 'RESOLVED' and old.status <> 'RESOLVED' then new.resolved_at = now(); end if;
  return new;
end $$;

create trigger complaints_updated before update on complaints
for each row execute function set_updated_at();

create function handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email);
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
for each row execute function handle_new_user();

insert into departments (name, description) values
  ('Road Maintenance', 'Potholes, road damage, traffic signals'),
  ('Sanitation', 'Garbage, illegal dumping'),
  ('Water Supply', 'Water leakage'),
  ('Sewerage and Drainage', 'Sewage and drainage issues'),
  ('Electrical', 'Streetlights'),
  ('General Administration', 'Other issues');
