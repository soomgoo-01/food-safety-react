-- 아래 SQL 전체를 Supabase SQL Editor에 붙여넣고 실행하세요.

-- ① lsafe_fail (L.safe 부적합)
create table lsafe_fail (
  id int4 primary key,
  product text not null,
  food_type text not null,
  item text not null,
  detected text not null,
  standard text not null,
  date date not null,
  measure text
);
alter table lsafe_fail enable row level security;
create policy "public_read" on lsafe_fail for select using (true);

insert into lsafe_fail values
(1,'참기름 500ml','유지류','산가','5.2','4.0 이하','2026-05-20','출하 보류 조치 완료'),
(2,'냉동볶음밥 500g','냉동식품','대장균군','검출','불검출','2026-05-15','공급업체 반품 처리'),
(3,'명태포 200g','수산물','히스타민','310','200 이하','2026-04-10','해당 로트 전량 회수'),
(4,'냉동만두 500g','냉동식품','세균수','250000','100000 이하','2026-03-22',null);

-- ② lsafe_all (L.safe 전체 이력)
create table lsafe_all (
  id serial primary key,
  product text not null,
  item text not null,
  detected text not null,
  standard text not null,
  result text not null,
  date date not null,
  measure text
);
alter table lsafe_all enable row level security;
create policy "public_read" on lsafe_all for select using (true);

insert into lsafe_all (product,item,detected,standard,result,date,measure) values
('참기름 500ml','산가','5.2','4.0 이하','부적합','2026-05-20','출하 보류 조치 완료'),
('참기름 500ml','산가','3.8','4.0 이하','적합','2025-11-10',null),
('참기름 500ml','벤조피렌','1.2','2.0 이하','적합','2025-08-05',null),
('참기름 500ml','산가','4.9','4.0 이하','부적합','2024-09-14','공급업체 개선 요청'),
('냉동볶음밥 500g','대장균군','검출','불검출','부적합','2026-05-15','공급업체 반품 처리'),
('냉동볶음밥 500g','세균수','72000','100000 이하','적합','2025-12-01',null),
('냉동볶음밥 500g','대장균군','불검출','불검출','적합','2025-06-20',null),
('명태포 200g','히스타민','310','200 이하','부적합','2026-04-10','해당 로트 전량 회수'),
('명태포 200g','히스타민','150','200 이하','적합','2025-10-05',null),
('냉동만두 500g','세균수','250000','100000 이하','부적합','2026-03-22',null),
('냉동만두 500g','세균수','80000','100000 이하','적합','2025-09-11',null);

-- ③ planned (기획검사 일정)
create table planned (
  id int4 primary key,
  title text not null,
  date date not null,
  expected_end date not null,
  status text not null,
  total int4 not null default 0,
  fail int4 not null default 0
);
alter table planned enable row level security;
create policy "public_read" on planned for select using (true);

insert into planned values
(1,'냉동수산물 기획검사','2026-06-03','2026-06-17','예정',0,0),
(2,'HMR 기획검사','2026-05-20','2026-06-03','진행중',12,0),
(3,'수산물 중금속 기획검사','2026-05-10','2026-05-24','완료',10,2),
(4,'음료류 보존료 기획검사','2026-04-15','2026-04-29','완료',6,0),
(5,'제과류 미생물 기획검사','2026-03-20','2026-04-03','완료',8,1),
(6,'유지류 산가·벤조피렌 기획검사','2026-06-10','2026-06-24','예정',0,0);

-- ④ plan_history (기획검사 연도별 이력)
create table plan_history (
  plan_id int4 not null,
  year int4 not null,
  total int4 not null default 0,
  fail int4 not null default 0,
  primary key (plan_id, year)
);
alter table plan_history enable row level security;
create policy "public_read" on plan_history for select using (true);

insert into plan_history values
(1,2024,8,0),(1,2025,9,1),(1,2026,0,0),
(2,2024,10,1),(2,2025,11,0),(2,2026,12,0),
(3,2024,8,2),(3,2025,9,1),(3,2026,10,2),
(4,2024,5,0),(4,2025,6,0),(4,2026,6,0),
(5,2024,7,1),(5,2025,8,2),(5,2026,8,1),
(6,2024,6,1),(6,2025,7,1),(6,2026,0,0);

-- ⑤ plan_fail_detail (기획검사 부적합 상세)
create table plan_fail_detail (
  id serial primary key,
  plan_id int4 not null,
  product text not null,
  item text not null,
  detected text not null,
  standard text not null,
  measure text
);
alter table plan_fail_detail enable row level security;
create policy "public_read" on plan_fail_detail for select using (true);

insert into plan_fail_detail (plan_id,product,item,detected,standard,measure) values
(3,'명태포 200g','히스타민','310','200 이하','해당 로트 전량 반품 완료'),
(3,'냉동새우 1kg','납','0.8','0.5 이하','조치 진행 중'),
(5,'전통한과 300g','타르색소','검출','불검출','출하 보류 후 반품');

-- ⑥ news (뉴스 모니터링)
create table news (
  id int4 primary key,
  grade int4 not null,
  title text not null,
  keyword text[] not null,
  food_type text not null,
  date date not null
);
alter table news enable row level security;
create policy "public_read" on news for select using (true);

insert into news values
(1,5,'경기 지역 학교급식 식중독 집단 발생…원인 식품 조사 중',array['식중독','집단발생','학교급식'],'즉석식품','2026-05-28'),
(2,4,'수입 참기름 벤조피렌 기준 초과…자진 회수 조치',array['벤조피렌','회수','참기름'],'유지류','2026-05-27'),
(3,3,'냉동새우 중금속 부적합 건수 전년 대비 증가 추세',array['중금속','냉동새우','부적합'],'수산물','2026-05-27'),
(4,2,'식약처, 여름철 식품 안전 관리 강화 캠페인 시작',array['식품안전','캠페인'],'전체','2026-05-26'),
(5,4,'국내산 명태포 히스타민 기준 초과 행정 명령 회수',array['히스타민','회수','행정명령'],'수산물','2026-05-25'),
(6,3,'참기름 산가 부적합 3건 연속 발생…유통 주의',array['산가','참기름','부적합'],'유지류','2026-05-20'),
(7,2,'수입 냉동식품 세균 검출 증가…검역 강화 예정',array['세균','냉동식품','검역'],'냉동식품','2026-05-15'),
(8,4,'어린이 식품 타르색소 집중 단속 결과 발표',array['타르색소','어린이식품','단속'],'과자류','2026-05-10'),
(9,3,'히스타민 기준 강화 논의…수산물 업계 대응 촉구',array['히스타민','수산물','기준강화'],'수산물','2026-04-28'),
(10,2,'식약처 상반기 수거검사 계획 발표',array['수거검사','식약처'],'전체','2026-04-20'),
(11,3,'냉동볶음밥 미생물 부적합 잇따라…제조 위생 점검 필요',array['미생물','냉동볶음밥','위생'],'냉동식품','2026-04-15'),
(12,4,'수입 수산물 중금속 초과…6개국 동시 회수 조치',array['중금속','수산물','회수'],'수산물','2026-04-10');

-- ⑦ import_risk (수입식품 리스크)
create table import_risk (
  id serial primary key,
  country text not null,
  food_type text not null,
  item text not null,
  count int4 not null
);
alter table import_risk enable row level security;
create policy "public_read" on import_risk for select using (true);

insert into import_risk (country,food_type,item,count) values
('중국','수산물','중금속',14),
('베트남','수산물','히스타민',8),
('미국','유지류','벤조피렌',5),
('태국','과자류','타르색소',4),
('인도','향신료','살모넬라',3);

-- ⑧ comparison_summary (부적합률 요약)
create table comparison_summary (
  source text primary key,
  rate numeric not null,
  prev numeric not null,
  total int4 not null,
  fail int4 not null
);
alter table comparison_summary enable row level security;
create policy "public_read" on comparison_summary for select using (true);

insert into comparison_summary values
('internal',4.2,5.1,238,10),
('mfds',3.8,4.2,1840,70);

-- ⑨ comparison_by_type (식품유형별 부적합률)
create table comparison_by_type (
  type text primary key,
  internal_rate numeric not null,
  mfds_rate numeric not null
);
alter table comparison_by_type enable row level security;
create policy "public_read" on comparison_by_type for select using (true);

insert into comparison_by_type values
('유지류',8.3,4.1),
('냉동식품',3.1,3.8),
('수산물',5.0,4.5),
('음료류',2.0,2.5),
('과자류',1.5,2.0);
