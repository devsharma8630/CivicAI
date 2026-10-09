-- Run this only in a development Supabase project.
-- Creates 30 demo citizens (password: Password123!) and 100 demo complaints
-- around a configurable city center. Change CITY_LAT / CITY_LNG below to
-- move the whole dataset to another city.

do $$
declare
  city_lat double precision := 28.6139;
  city_lng double precision := 77.2090;
  categories text[] := array['Pothole','Garbage','Broken Streetlight','Water Leakage',
                              'Sewage','Road Damage','Traffic Signal','Drainage',
                              'Public Property Damage','Illegal Dumping'];
  departments text[] := array['Road Maintenance','Sanitation','Water Supply',
                               'Sewerage and Drainage','Electrical','General Administration'];
  severities severity_level[] := array['LOW','MEDIUM','HIGH','CRITICAL']::severity_level[];
  statuses complaint_status[] := array['SUBMITTED','UNDER_REVIEW','ASSIGNED','IN_PROGRESS','RESOLVED','REJECTED']::complaint_status[];
  new_user_id uuid;
  demo_email text;
  cat text;
  sev severity_level;
  stat complaint_status;
  lat double precision;
  lng double precision;
  score int;
  cid uuid;
  cnum text;
  duplicate_lat double precision := city_lat + 0.01;
  duplicate_lng double precision := city_lng + 0.01;
  duplicate_group uuid := gen_random_uuid();
  i int;
  j int;
begin
  for i in 1..30 loop
    demo_email := 'citizen' || i || '@civicai.demo';
    new_user_id := gen_random_uuid();

    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, recovery_token
    ) values (
      '00000000-0000-0000-0000-000000000000', new_user_id, 'authenticated', 'authenticated',
      demo_email, crypt('Password123!', gen_salt('bf')),
      now(), '{"provider":"email","providers":["email"]}', jsonb_build_object('full_name', 'Demo Citizen ' || i),
      now(), now(), '', ''
    );

    insert into auth.identities (
      id, provider_id, user_id, identity_data, provider, created_at, updated_at
    ) values (
      gen_random_uuid(), new_user_id::text, new_user_id,
      jsonb_build_object('sub', new_user_id::text, 'email', demo_email),
      'email', now(), now()
    );

    for j in 1..3 loop
      cat := categories[1 + floor(random() * array_length(categories, 1))::int];
      sev := severities[1 + floor(random() * 4)::int];
      stat := statuses[1 + floor(random() * 6)::int];
      lat := city_lat + (random() - 0.5) * 0.2;
      lng := city_lng + (random() - 0.5) * 0.2;
      score := 20 + floor(random() * 80)::int;

      insert into complaints (
        user_id, title, description, category, severity, priority_score,
        department, status, latitude, longitude, address, image_url,
        ai_confidence, spam_score, is_suspicious,
        created_at
      ) values (
        new_user_id,
        initcap(cat) || ' reported near sector ' || (1 + floor(random() * 40)::int),
        'Demo seeded complaint describing a ' || lower(cat) || ' issue affecting the local area.',
        cat, sev, score,
        departments[1 + floor(random() * array_length(departments, 1))::int],
        stat, lat, lng, 'Demo Ward ' || (1 + floor(random() * 20)::int),
        'seed/placeholder.jpg',
        round((0.55 + random() * 0.44)::numeric, 2),
        case when random() < 0.08 then 60 + floor(random() * 40)::int else floor(random() * 20)::int end,
        random() < 0.08,
        now() - (floor(random() * 60) || ' days')::interval
      )
      returning id, complaint_number into cid, cnum;

      insert into complaint_ai_analysis (
        complaint_id, category, severity, priority_score, department, impact, confidence, ai_description
      ) values (
        cid, cat, sev, score,
        departments[1 + floor(random() * array_length(departments, 1))::int],
        'May affect residents and passersby in the reported area.',
        round((0.55 + random() * 0.44)::numeric, 2),
        'AI-generated description of a ' || lower(cat) || ' issue.'
      );

      insert into notifications (user_id, title, message, type)
      values (new_user_id, 'Complaint submitted', cnum || ' was received.', 'COMPLAINT_SUBMITTED');
    end loop;
  end loop;

  for i in 1..10 loop
    insert into complaints (
      user_id, title, description, category, severity, priority_score,
      department, status, latitude, longitude, address, image_url,
      ai_confidence, duplicate_group_id, created_at
    )
    select
      p.id,
      'Large pothole near main road',
      'Demo seeded duplicate report of the same pothole cluster.',
      'Pothole', 'HIGH', 88,
      'Road Maintenance', 'UNDER_REVIEW',
      duplicate_lat + (random() - 0.5) * 0.0004,
      duplicate_lng + (random() - 0.5) * 0.0004,
      'Demo Ward 5', 'seed/placeholder.jpg',
      0.9, duplicate_group, now() - (floor(random() * 5) || ' days')::interval
    from profiles p
    order by random()
    limit 1;
  end loop;
end $$;
