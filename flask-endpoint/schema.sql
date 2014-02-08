drop table if exists tapmap;
create table tapmap (
  id integer primary key autoincrement,
  hashedTap text not null,
  pass text not null
);