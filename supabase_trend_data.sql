-- Supabase SQL Editor에서 실행하세요.

create table trend_data (
  id serial primary key,
  period text not null,      -- '월별' | '분기별' | '3개년평균'
  label text not null,       -- 범례 레이블
  oily int4 not null default 0,      -- 유지류
  frozen int4 not null default 0,    -- 냉동식품
  seafood int4 not null default 0,   -- 수산물
  beverage int4 not null default 0,  -- 음료류
  snack int4 not null default 0      -- 과자류
);
alter table trend_data enable row level security;
create policy "public_read" on trend_data for select using (true);

insert into trend_data (period, label, oily, frozen, seafood, beverage, snack) values
('월별',     '전년동월(5월)',  7, 3,  4, 2, 1),
('월별',     '이번달(5월)',   10, 2,  6, 1, 1),
('분기별',   '전년 동분기',  18, 9, 11, 5, 3),
('분기별',   '이번 분기',    22, 7, 15, 4, 3),
('3개년평균','3개년 평균',   15,10,  9, 6, 4),
('3개년평균','올해 누계',    22,12, 18, 5, 4);
