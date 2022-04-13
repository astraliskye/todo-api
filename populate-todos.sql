-- Will enter 50000 todos for each user in the database
insert into todos (id, task, description, "isComplete", "userId")
select gen_random_uuid(), md5(i::text)::text, md5(i::text)::text, 'f', users.id
  from users, generate_series(1, 50000, 1) as i;