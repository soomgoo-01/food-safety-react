export const FOOD_TYPES = ["전체","유지류","냉동식품","수산물","음료류","과자류"];
export const STATUS_COLOR = { 예정:"#8c8c8c", 진행중:"#2563eb", 완료:"#16a34a" };
export const GRADE_COLOR = { 5:"#dc2626", 4:"#ea580c", 3:"#d97706", 2:"#65a30d", 1:"#6b7280" };
export const GRADE_LABEL = { 5:"긴급", 4:"높음", 3:"보통", 2:"낮음", 1:"정보" };

export const MENUS = [
  { group:"내부 데이터", items:[
    {key:"calendar",label:"① 기획검사 캘린더"},
    {key:"lsafe",label:"② L.safe 현황"},
    {key:"comparison",label:"③ 부적합률 비교"},
  ]},
  { group:"외부 데이터", items:[
    {key:"home",label:"④ 종합 현황"},
    {key:"noncompliant",label:"⑤ 부적합·회수"},
    {key:"import",label:"⑥ 수입식품 리스크"},
    {key:"news",label:"⑦ 뉴스 모니터링"},
  ]},
  { group:"알림·리포트", items:[
    {key:"report",label:"⑧ 알림 & 리포트"},
  ]},
];

export const SCREEN_TITLE = {
  home:"④ 종합 현황",
  calendar:"① 기획검사 캘린더",
  lsafe:"② L.safe 현황 (부적합)",
  comparison:"③ 부적합률 비교 (내부 vs 식약처)",
  noncompliant:"⑤ 부적합·회수 현황",
  import:"⑥ 수입식품 리스크",
  news:"⑦ 뉴스 모니터링",
  report:"⑧ 알림 & 리포트",
};
