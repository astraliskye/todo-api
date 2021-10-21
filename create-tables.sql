drop table todos cascade;
drop table users cascade;
drop table todo_sessions cascade;

create table users (
    id              uuid,
    display_name    varchar unique not null,
    email           varchar unique not null,
    password        varchar not null,
    created_at      timestamp default current_timestamp,
    primary key (id)
);

create table todos (
    id              uuid,
    task            text not null,
    description     text,
    is_complete     boolean not null,
    created_at      timestamp default current_timestamp,
    user_id         uuid not null,
    primary key (id),
    foreign key (user_id) references users(id)
);

-- Necessary for connect-pg-simple, which for connecting express-session to the postgresql database
create table todo_sessions (
    sid     varchar not null collate "default",
    sess    json not null,
    expire  timestamp(6) not null
)
with (oids=false);
alter table todo_sessions add constraint session_pkey primary key (sid) not deferrable initially immediate;
create index IDX_session_expire on todo_sessions(expire);
