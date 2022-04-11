drop table todos cascade;
drop table users cascade;
drop table todo_sessions cascade;

create table users (
    id              uuid primary key,
    displayName     varchar unique not null,
    email           varchar unique not null,
    password        varchar not null,
    createdAt       timestamp default current_timestamp
);

create table todos (
    id            uuid primary key,
    task          text not null,
    isComplete    boolean not null,
    userId        uuid references users(id) not null
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
