import { useState, useEffect } from "react";
import { supabase } from "./supabase.js";

// ── 샘플 데이터 ──────────────────────────────────────────
const SAMPLE = {
  noncompliant: [
    { id:1,  date:"2026-05-28", foodType:"유지류",   product:"참기름 500ml",      vendor:"(주)오일푸드",     item:"산가",      standard:"4.0 이하",      result:"5.2",    recall:true  },
    { id:2,  date:"2026-05-28", foodType:"수산물",   product:"냉동새우 1kg",      vendor:"씨푸드코리아",     item:"납",        standard:"0.5 이하",      result:"0.8",    recall:false },
    { id:3,  date:"2026-05-27", foodType:"냉동식품", product:"냉동볶음밥 500g",   vendor:"(주)프리젠푸드",   item:"대장균군",  standard:"불검출",        result:"검출",   recall:true  },
    { id:4,  date:"2026-05-27", foodType:"유지류",   product:"들기름 250ml",      vendor:"(주)오일푸드",     item:"산가",      standard:"4.0 이하",      result:"4.8",    recall:false },
    { id:5,  date:"2026-05-26", foodType:"음료류",   product:"과채음료 300ml",    vendor:"음료나라",         item:"보존료",    standard:"불검출",        result:"검출",   recall:false },
    { id:6,  date:"2026-05-25", foodType:"수산물",   product:"명태포 200g",       vendor:"동해수산",         item:"히스타민",  standard:"200 이하",      result:"310",    recall:true  },
    { id:7,  date:"2026-05-24", foodType:"과자류",   product:"전통한과 300g",     vendor:"한과명인",         item:"타르색소",  standard:"불검출",        result:"검출",   recall:false },
    { id:8,  date:"2026-05-23", foodType:"냉동식품", product:"냉동만두 500g",     vendor:"만두왕국",         item:"세균수",    standard:"100000 이하",   result:"250000", recall:true  },
    { id:9,  date:"2026-05-10", foodType:"유지류",   product:"참기름 500ml",      vendor:"(주)오일푸드",     item:"벤조피렌",  standard:"2.0 이하",      result:"2.8",    recall:false },
    { id:10, date:"2026-05-08", foodType:"수산물",   product:"냉동새우 1kg",      vendor:"씨푸드코리아",     item:"카드뮴",    standard:"0.3 이하",      result:"0.5",    recall:true  },
    { id:11, date:"2026-05-05", foodType:"냉동식품", product:"냉동볶음밥 500g",   vendor:"(주)프리젠푸드",   item:"세균수",    standard:"100000 이하",   result:"180000", recall:false },
    { id:12, date:"2026-05-03", foodType:"유지류",   product:"들기름 250ml",      vendor:"(주)오일푸드",     item:"산가",      standard:"4.0 이하",      result:"5.1",    recall:false },
    { id:13, date:"2026-04-30", foodType:"축산물",   product:"훈제오리 200g",     vendor:"목장식품",         item:"잔류항생제",standard:"불검출",        result:"검출",   recall:true  },
    { id:14, date:"2026-04-29", foodType:"농산물",   product:"깐마늘 500g",       vendor:"농협유통",         item:"잔류농약",  standard:"0.01 이하",     result:"0.05",   recall:false },
    { id:15, date:"2026-04-28", foodType:"유가공품", product:"체다슬라이스 200g", vendor:"서울유업",         item:"리스테리아",standard:"불검출",        result:"검출",   recall:true  },
    { id:16, date:"2026-04-25", foodType:"즉석식품", product:"삼각김밥 100g",     vendor:"편의식품(주)",     item:"대장균군",  standard:"불검출",        result:"검출",   recall:true  },
    { id:17, date:"2026-04-23", foodType:"음료류",   product:"오렌지주스 1L",     vendor:"음료나라",         item:"보존료",    standard:"불검출",        result:"검출",   recall:false },
    { id:18, date:"2026-04-22", foodType:"수산물",   product:"고등어통조림 400g", vendor:"동해수산",         item:"히스타민",  standard:"200 이하",      result:"280",    recall:true  },
    { id:19, date:"2026-04-20", foodType:"냉동식품", product:"냉동피자 400g",     vendor:"(주)프리젠푸드",   item:"세균수",    standard:"100000 이하",   result:"130000", recall:false },
    { id:20, date:"2026-04-18", foodType:"과자류",   product:"어린이과자 150g",   vendor:"과자나라",         item:"타르색소",  standard:"불검출",        result:"검출",   recall:true  },
    { id:21, date:"2026-04-15", foodType:"축산물",   product:"돼지갈비 500g",     vendor:"축산유통",         item:"살모넬라",  standard:"불검출",        result:"검출",   recall:true  },
    { id:22, date:"2026-04-12", foodType:"농산물",   product:"방울토마토 500g",   vendor:"청정농원",         item:"잔류농약",  standard:"0.01 이하",     result:"0.03",   recall:false },
    { id:23, date:"2026-04-10", foodType:"유가공품", product:"요거트 150g",       vendor:"서울유업",         item:"세균수",    standard:"10000 이하",    result:"25000",  recall:false },
    { id:24, date:"2026-04-08", foodType:"즉석식품", product:"컵라면 110g",       vendor:"면왕국",           item:"납",        standard:"0.3 이하",      result:"0.6",    recall:true  },
    { id:25, date:"2026-04-05", foodType:"수산물",   product:"참치통조림 200g",   vendor:"씨푸드코리아",     item:"수은",      standard:"0.5 이하",      result:"0.9",    recall:true  },
    { id:26, date:"2026-04-03", foodType:"유지류",   product:"포도씨유 900ml",    vendor:"(주)오일푸드",     item:"산가",      standard:"4.0 이하",      result:"4.5",    recall:false },
    { id:27, date:"2026-03-31", foodType:"냉동식품", product:"냉동새우튀김 300g", vendor:"만두왕국",         item:"대장균군",  standard:"불검출",        result:"검출",   recall:false },
    { id:28, date:"2026-03-28", foodType:"음료류",   product:"식혜 500ml",        vendor:"전통음료(주)",     item:"세균수",    standard:"100 이하",      result:"350",    recall:true  },
    { id:29, date:"2026-03-25", foodType:"과자류",   product:"초콜릿 100g",       vendor:"과자나라",         item:"카드뮴",    standard:"0.1 이하",      result:"0.15",   recall:false },
    { id:30, date:"2026-03-22", foodType:"축산물",   product:"닭가슴살 200g",     vendor:"목장식품",         item:"리스테리아",standard:"불검출",        result:"검출",   recall:true  },
    { id:31, date:"2026-03-20", foodType:"농산물",   product:"시금치 300g",       vendor:"청정농원",         item:"잔류농약",  standard:"0.01 이하",     result:"0.04",   recall:false },
    { id:32, date:"2026-03-18", foodType:"유가공품", product:"버터 200g",         vendor:"서울유업",         item:"대장균군",  standard:"불검출",        result:"검출",   recall:true  },
    { id:33, date:"2026-03-15", foodType:"즉석식품", product:"도시락 350g",       vendor:"편의식품(주)",     item:"세균수",    standard:"100000 이하",   result:"200000", recall:true  },
    { id:34, date:"2026-03-12", foodType:"수산물",   product:"건오징어 100g",     vendor:"동해수산",         item:"카드뮴",    standard:"2.0 이하",      result:"3.1",    recall:false },
    { id:35, date:"2026-03-10", foodType:"냉동식품", product:"냉동잡채 250g",     vendor:"(주)프리젠푸드",   item:"보존료",    standard:"불검출",        result:"검출",   recall:false },
    { id:36, date:"2026-03-07", foodType:"유지류",   product:"해바라기유 1L",     vendor:"(주)오일푸드",     item:"과산화물가",standard:"10 이하",       result:"14",     recall:false },
    { id:37, date:"2026-03-05", foodType:"음료류",   product:"두유 190ml",        vendor:"음료나라",         item:"대장균군",  standard:"불검출",        result:"검출",   recall:true  },
    { id:38, date:"2026-03-03", foodType:"과자류",   product:"쌀과자 80g",        vendor:"과자나라",         item:"세균수",    standard:"10000 이하",    result:"18000",  recall:false },
    { id:39, date:"2026-02-28", foodType:"축산물",   product:"소시지 300g",       vendor:"축산유통",         item:"아질산염",  standard:"70 이하",       result:"95",     recall:true  },
    { id:40, date:"2026-02-25", foodType:"농산물",   product:"파프리카 500g",     vendor:"청정농원",         item:"잔류농약",  standard:"0.01 이하",     result:"0.02",   recall:false },
    { id:41, date:"2026-02-22", foodType:"유가공품", product:"치즈 200g",         vendor:"서울유업",         item:"리스테리아",standard:"불검출",        result:"검출",   recall:true  },
    { id:42, date:"2026-02-20", foodType:"즉석식품", product:"냉동김밥 300g",     vendor:"편의식품(주)",     item:"대장균군",  standard:"불검출",        result:"검출",   recall:false },
    { id:43, date:"2026-02-18", foodType:"수산물",   product:"훈제연어 200g",     vendor:"씨푸드코리아",     item:"리스테리아",standard:"불검출",        result:"검출",   recall:true  },
    { id:44, date:"2026-02-15", foodType:"냉동식품", product:"냉동햄버거 150g",   vendor:"만두왕국",         item:"세균수",    standard:"100000 이하",   result:"160000", recall:false },
    { id:45, date:"2026-02-12", foodType:"유지류",   product:"올리브유 500ml",    vendor:"(주)오일푸드",     item:"산가",      standard:"4.0 이하",      result:"4.6",    recall:false },
    { id:46, date:"2026-02-10", foodType:"음료류",   product:"녹차음료 500ml",    vendor:"전통음료(주)",     item:"카페인",    standard:"150 이하",      result:"210",    recall:false },
    { id:47, date:"2026-02-08", foodType:"과자류",   product:"젤리 100g",         vendor:"과자나라",         item:"타르색소",  standard:"불검출",        result:"검출",   recall:false },
    { id:48, date:"2026-02-05", foodType:"축산물",   product:"베이컨 150g",       vendor:"목장식품",         item:"아질산염",  standard:"70 이하",       result:"88",     recall:true  },
    { id:49, date:"2026-02-03", foodType:"농산물",   product:"딸기 500g",         vendor:"청정농원",         item:"잔류농약",  standard:"0.01 이하",     result:"0.03",   recall:false },
    { id:50, date:"2026-01-30", foodType:"유가공품", product:"아이스크림 150g",   vendor:"서울유업",         item:"세균수",    standard:"10000 이하",    result:"30000",  recall:false },
    { id:51, date:"2026-01-28", foodType:"즉석식품", product:"즉석밥 210g",       vendor:"편의식품(주)",     item:"곰팡이독소",standard:"10 이하",       result:"18",     recall:true  },
    { id:52, date:"2026-01-25", foodType:"수산물",   product:"굴 200g",           vendor:"동해수산",         item:"노로바이러스",standard:"불검출",       result:"검출",   recall:true  },
    { id:53, date:"2026-01-22", foodType:"냉동식품", product:"냉동닭강정 400g",   vendor:"(주)프리젠푸드",   item:"대장균군",  standard:"불검출",        result:"검출",   recall:false },
    { id:54, date:"2026-01-20", foodType:"유지류",   product:"카놀라유 1.8L",     vendor:"(주)오일푸드",     item:"벤조피렌",  standard:"2.0 이하",      result:"2.4",    recall:false },
    { id:55, date:"2026-01-18", foodType:"음료류",   product:"에너지드링크 250ml",vendor:"음료나라",         item:"카페인",    standard:"150 이하",      result:"195",    recall:false },
    { id:56, date:"2026-01-15", foodType:"과자류",   product:"스낵 90g",          vendor:"과자나라",         item:"산가",      standard:"5.0 이하",      result:"6.2",    recall:false },
    { id:57, date:"2026-01-12", foodType:"축산물",   product:"햄 200g",           vendor:"축산유통",         item:"살모넬라",  standard:"불검출",        result:"검출",   recall:true  },
    { id:58, date:"2026-01-10", foodType:"농산물",   product:"브로콜리 400g",     vendor:"청정농원",         item:"잔류농약",  standard:"0.01 이하",     result:"0.02",   recall:false },
    { id:59, date:"2026-01-08", foodType:"유가공품", product:"발효유 100ml",      vendor:"서울유업",         item:"대장균군",  standard:"불검출",        result:"검출",   recall:false },
    { id:60, date:"2026-01-05", foodType:"즉석식품", product:"샌드위치 150g",     vendor:"편의식품(주)",     item:"세균수",    standard:"100000 이하",   result:"120000", recall:false },
    { id:61, date:"2025-12-28", foodType:"수산물",   product:"새우젓 300g",       vendor:"씨푸드코리아",     item:"히스타민",  standard:"200 이하",      result:"260",    recall:false },
    { id:62, date:"2025-12-25", foodType:"냉동식품", product:"냉동떡볶이 350g",   vendor:"만두왕국",         item:"타르색소",  standard:"불검출",        result:"검출",   recall:false },
    { id:63, date:"2025-12-22", foodType:"유지류",   product:"참기름 200ml",      vendor:"(주)오일푸드",     item:"산가",      standard:"4.0 이하",      result:"5.0",    recall:true  },
    { id:64, date:"2025-12-20", foodType:"음료류",   product:"홍차음료 300ml",    vendor:"전통음료(주)",     item:"보존료",    standard:"불검출",        result:"검출",   recall:false },
    { id:65, date:"2025-12-18", foodType:"과자류",   product:"비스킷 120g",       vendor:"과자나라",         item:"세균수",    standard:"10000 이하",    result:"15000",  recall:false },
    { id:66, date:"2025-12-15", foodType:"축산물",   product:"육포 100g",         vendor:"목장식품",         item:"아질산염",  standard:"70 이하",       result:"82",     recall:false },
    { id:67, date:"2025-12-12", foodType:"농산물",   product:"당근 1kg",          vendor:"청정농원",         item:"잔류농약",  standard:"0.01 이하",     result:"0.04",   recall:false },
    { id:68, date:"2025-12-10", foodType:"유가공품", product:"크림치즈 200g",     vendor:"서울유업",         item:"리스테리아",standard:"불검출",        result:"검출",   recall:true  },
    { id:69, date:"2025-12-08", foodType:"즉석식품", product:"컵밥 280g",         vendor:"편의식품(주)",     item:"대장균군",  standard:"불검출",        result:"검출",   recall:false },
    { id:70, date:"2025-12-05", foodType:"수산물",   product:"오징어채 150g",     vendor:"동해수산",         item:"카드뮴",    standard:"2.0 이하",      result:"2.8",    recall:false },
    { id:71, date:"2025-11-30", foodType:"냉동식품", product:"냉동깐두부 400g",   vendor:"(주)프리젠푸드",   item:"세균수",    standard:"100000 이하",   result:"140000", recall:false },
    { id:72, date:"2025-11-28", foodType:"유지류",   product:"들기름 500ml",      vendor:"(주)오일푸드",     item:"과산화물가",standard:"10 이하",       result:"13",     recall:false },
    { id:73, date:"2025-11-25", foodType:"음료류",   product:"매실음료 500ml",    vendor:"전통음료(주)",     item:"보존료",    standard:"불검출",        result:"검출",   recall:false },
    { id:74, date:"2025-11-22", foodType:"과자류",   product:"사탕 200g",         vendor:"과자나라",         item:"타르색소",  standard:"불검출",        result:"검출",   recall:false },
    { id:75, date:"2025-11-20", foodType:"축산물",   product:"치킨너겟 300g",     vendor:"축산유통",         item:"살모넬라",  standard:"불검출",        result:"검출",   recall:true  },
    { id:76, date:"2025-11-18", foodType:"농산물",   product:"배추 2kg",          vendor:"청정농원",         item:"잔류농약",  standard:"0.01 이하",     result:"0.03",   recall:false },
    { id:77, date:"2025-11-15", foodType:"유가공품", product:"우유 1L",           vendor:"서울유업",         item:"항생제잔류",standard:"불검출",        result:"검출",   recall:true  },
    { id:78, date:"2025-11-12", foodType:"즉석식품", product:"냉동볶음밥 500g",   vendor:"편의식품(주)",     item:"세균수",    standard:"100000 이하",   result:"170000", recall:false },
    { id:79, date:"2025-11-10", foodType:"수산물",   product:"쪽파무침 200g",     vendor:"씨푸드코리아",     item:"대장균군",  standard:"불검출",        result:"검출",   recall:false },
    { id:80, date:"2025-11-08", foodType:"냉동식품", product:"냉동갈비 600g",     vendor:"만두왕국",         item:"리스테리아",standard:"불검출",        result:"검출",   recall:true  },
    { id:81, date:"2025-10-30", foodType:"유지류",   product:"옥수수유 900ml",    vendor:"(주)오일푸드",     item:"벤조피렌",  standard:"2.0 이하",      result:"2.3",    recall:false },
    { id:82, date:"2025-10-28", foodType:"음료류",   product:"스포츠음료 500ml",  vendor:"음료나라",         item:"세균수",    standard:"100 이하",      result:"220",    recall:false },
    { id:83, date:"2025-10-25", foodType:"과자류",   product:"팝콘 80g",          vendor:"과자나라",         item:"세균수",    standard:"10000 이하",    result:"12000",  recall:false },
    { id:84, date:"2025-10-22", foodType:"축산물",   product:"삼겹살 500g",       vendor:"목장식품",         item:"리스테리아",standard:"불검출",        result:"검출",   recall:false },
    { id:85, date:"2025-10-20", foodType:"농산물",   product:"고추 500g",         vendor:"청정농원",         item:"잔류농약",  standard:"0.01 이하",     result:"0.05",   recall:true  },
    { id:86, date:"2025-10-18", foodType:"유가공품", product:"분유 400g",         vendor:"서울유업",         item:"세균수",    standard:"10000 이하",    result:"20000",  recall:false },
    { id:87, date:"2025-10-15", foodType:"즉석식품", product:"떡볶이 250g",       vendor:"편의식품(주)",     item:"타르색소",  standard:"불검출",        result:"검출",   recall:false },
    { id:88, date:"2025-10-12", foodType:"수산물",   product:"멸치 200g",         vendor:"동해수산",         item:"납",        standard:"0.5 이하",      result:"0.7",    recall:false },
    { id:89, date:"2025-10-10", foodType:"냉동식품", product:"냉동쫄면 300g",     vendor:"(주)프리젠푸드",   item:"타르색소",  standard:"불검출",        result:"검출",   recall:false },
    { id:90, date:"2025-10-08", foodType:"유지류",   product:"아마씨유 250ml",    vendor:"(주)오일푸드",     item:"산가",      standard:"4.0 이하",      result:"4.7",    recall:false },
    { id:91, date:"2025-09-30", foodType:"음료류",   product:"탄산음료 1.5L",     vendor:"음료나라",         item:"보존료",    standard:"불검출",        result:"검출",   recall:false },
    { id:92, date:"2025-09-28", foodType:"과자류",   product:"케이크 300g",       vendor:"과자나라",         item:"세균수",    standard:"10000 이하",    result:"22000",  recall:true  },
    { id:93, date:"2025-09-25", foodType:"축산물",   product:"오리훈제 200g",     vendor:"축산유통",         item:"아질산염",  standard:"70 이하",       result:"90",     recall:false },
    { id:94, date:"2025-09-22", foodType:"농산물",   product:"깻잎 100g",         vendor:"청정농원",         item:"잔류농약",  standard:"0.01 이하",     result:"0.02",   recall:false },
    { id:95, date:"2025-09-20", foodType:"유가공품", product:"생크림 200ml",      vendor:"서울유업",         item:"대장균군",  standard:"불검출",        result:"검출",   recall:true  },
    { id:96, date:"2025-09-18", foodType:"즉석식품", product:"햄버거 패티 100g",  vendor:"편의식품(주)",     item:"살모넬라",  standard:"불검출",        result:"검출",   recall:true  },
    { id:97, date:"2025-09-15", foodType:"수산물",   product:"어묵 200g",         vendor:"씨푸드코리아",     item:"세균수",    standard:"100000 이하",   result:"150000", recall:false },
    { id:98, date:"2025-09-12", foodType:"냉동식품", product:"냉동생선까스 300g", vendor:"만두왕국",         item:"대장균군",  standard:"불검출",        result:"검출",   recall:false },
    { id:99, date:"2025-09-10", foodType:"유지류",   product:"혼합식용유 1.8L",   vendor:"(주)오일푸드",     item:"과산화물가",standard:"10 이하",       result:"11",     recall:false },
    { id:100,date:"2025-09-08", foodType:"음료류",   product:"콤부차 300ml",      vendor:"전통음료(주)",     item:"세균수",    standard:"100 이하",      result:"180",    recall:false },
  ],
  // L.safe 목록: 부적합만
  lsafeFail: [
    { id:1, product:"참기름 500ml", foodType:"유지류", item:"산가", detected:"5.2", standard:"4.0 이하", date:"2026-05-20", measure:"출하 보류 조치 완료" },
    { id:2, product:"냉동볶음밥 500g", foodType:"냉동식품", item:"대장균군", detected:"검출", standard:"불검출", date:"2026-05-15", measure:"공급업체 반품 처리" },
    { id:3, product:"명태포 200g", foodType:"수산물", item:"히스타민", detected:"310", standard:"200 이하", date:"2026-04-10", measure:"해당 로트 전량 회수" },
    { id:4, product:"냉동만두 500g", foodType:"냉동식품", item:"세균수", detected:"250000", standard:"100000 이하", date:"2026-03-22", measure:null },
  ],
  // 이력 팝업: 적합+부적합 전체
  lsafeAll: [
    { product:"참기름 500ml", item:"산가", detected:"5.2", standard:"4.0 이하", result:"부적합", date:"2026-05-20", measure:"출하 보류 조치 완료" },
    { product:"참기름 500ml", item:"산가", detected:"3.8", standard:"4.0 이하", result:"적합", date:"2025-11-10", measure:null },
    { product:"참기름 500ml", item:"벤조피렌", detected:"1.2", standard:"2.0 이하", result:"적합", date:"2025-08-05", measure:null },
    { product:"참기름 500ml", item:"산가", detected:"4.9", standard:"4.0 이하", result:"부적합", date:"2024-09-14", measure:"공급업체 개선 요청" },
    { product:"냉동볶음밥 500g", item:"대장균군", detected:"검출", standard:"불검출", result:"부적합", date:"2026-05-15", measure:"공급업체 반품 처리" },
    { product:"냉동볶음밥 500g", item:"세균수", detected:"72000", standard:"100000 이하", result:"적합", date:"2025-12-01", measure:null },
    { product:"냉동볶음밥 500g", item:"대장균군", detected:"불검출", standard:"불검출", result:"적합", date:"2025-06-20", measure:null },
    { product:"명태포 200g", item:"히스타민", detected:"310", standard:"200 이하", result:"부적합", date:"2026-04-10", measure:"해당 로트 전량 회수" },
    { product:"명태포 200g", item:"히스타민", detected:"150", standard:"200 이하", result:"적합", date:"2025-10-05", measure:null },
    { product:"냉동만두 500g", item:"세균수", detected:"250000", standard:"100000 이하", result:"부적합", date:"2026-03-22", measure:null },
    { product:"냉동만두 500g", item:"세균수", detected:"80000", standard:"100000 이하", result:"적합", date:"2025-09-11", measure:null },
  ],
  // 기획검사: 제목만, 계열사·시험구분 없음
  planned: [
    { id:1, title:"냉동수산물 기획검사", date:"2026-06-03", expectedEnd:"2026-06-17", status:"예정", total:0, fail:0 },
    { id:2, title:"HMR 기획검사", date:"2026-05-20", expectedEnd:"2026-06-03", status:"진행중", total:12, fail:0 },
    { id:3, title:"수산물 중금속 기획검사", date:"2026-05-10", expectedEnd:"2026-05-24", status:"완료", total:10, fail:2 },
    { id:4, title:"음료류 보존료 기획검사", date:"2026-04-15", expectedEnd:"2026-04-29", status:"완료", total:6, fail:0 },
    { id:5, title:"제과류 미생물 기획검사", date:"2026-03-20", expectedEnd:"2026-04-03", status:"완료", total:8, fail:1 },
    { id:6, title:"유지류 산가·벤조피렌 기획검사", date:"2026-06-10", expectedEnd:"2026-06-24", status:"예정", total:0, fail:0 },
  ],
  // 뉴스: 다양한 날짜로 기간 필터 테스트 가능하게
  news: [
    { id:1, grade:5, title:"경기 지역 학교급식 식중독 집단 발생…원인 식품 조사 중", keyword:["식중독","집단발생","학교급식"], foodType:"즉석식품", date:"2026-05-28" },
    { id:2, grade:4, title:"수입 참기름 벤조피렌 기준 초과…자진 회수 조치", keyword:["벤조피렌","회수","참기름"], foodType:"유지류", date:"2026-05-27" },
    { id:3, grade:3, title:"냉동새우 중금속 부적합 건수 전년 대비 증가 추세", keyword:["중금속","냉동새우","부적합"], foodType:"수산물", date:"2026-05-27" },
    { id:4, grade:2, title:"식약처, 여름철 식품 안전 관리 강화 캠페인 시작", keyword:["식품안전","캠페인"], foodType:"전체", date:"2026-05-26" },
    { id:5, grade:4, title:"국내산 명태포 히스타민 기준 초과 행정 명령 회수", keyword:["히스타민","회수","행정명령"], foodType:"수산물", date:"2026-05-25" },
    { id:6, grade:3, title:"참기름 산가 부적합 3건 연속 발생…유통 주의", keyword:["산가","참기름","부적합"], foodType:"유지류", date:"2026-05-20" },
    { id:7, grade:2, title:"수입 냉동식품 세균 검출 증가…검역 강화 예정", keyword:["세균","냉동식품","검역"], foodType:"냉동식품", date:"2026-05-15" },
    { id:8, grade:4, title:"어린이 식품 타르색소 집중 단속 결과 발표", keyword:["타르색소","어린이식품","단속"], foodType:"과자류", date:"2026-05-10" },
    { id:9, grade:3, title:"히스타민 기준 강화 논의…수산물 업계 대응 촉구", keyword:["히스타민","수산물","기준강화"], foodType:"수산물", date:"2026-04-28" },
    { id:10, grade:2, title:"식약처 상반기 수거검사 계획 발표", keyword:["수거검사","식약처"], foodType:"전체", date:"2026-04-20" },
    { id:11, grade:3, title:"냉동볶음밥 미생물 부적합 잇따라…제조 위생 점검 필요", keyword:["미생물","냉동볶음밥","위생"], foodType:"냉동식품", date:"2026-04-15" },
    { id:12, grade:4, title:"수입 수산물 중금속 초과…6개국 동시 회수 조치", keyword:["중금속","수산물","회수"], foodType:"수산물", date:"2026-04-10" },
  ],
  comparison: {
    internal: { rate:4.2, prev:5.1, total:238, fail:10 },
    mfds: { rate:3.8, prev:4.2, total:1840, fail:70 },
    byType: [
      { type:"유지류", internal:8.3, mfds:4.1 },
      { type:"냉동식품", internal:3.1, mfds:3.8 },
      { type:"수산물", internal:5.0, mfds:4.5 },
      { type:"음료류", internal:2.0, mfds:2.5 },
      { type:"과자류", internal:1.5, mfds:2.0 },
    ]
  },
  trendData: {
    월별: [
      { label:"전년동월(5월)", data:{ 유지류:7, 냉동식품:3, 수산물:4, 음료류:2, 과자류:1 } },
      { label:"이번달(5월)", data:{ 유지류:10, 냉동식품:2, 수산물:6, 음료류:1, 과자류:1 } },
    ],
    분기별: [
      { label:"전년 동분기", data:{ 유지류:18, 냉동식품:9, 수산물:11, 음료류:5, 과자류:3 } },
      { label:"이번 분기", data:{ 유지류:22, 냉동식품:7, 수산물:15, 음료류:4, 과자류:3 } },
    ],
    "3개년평균": [
      { label:"3개년 평균", data:{ 유지류:15, 냉동식품:10, 수산물:9, 음료류:6, 과자류:4 } },
      { label:"올해 누계", data:{ 유지류:22, 냉동식품:12, 수산물:18, 음료류:5, 과자류:4 } },
    ],
  },
  importRisk: [
    { country:"중국", foodType:"수산물", item:"중금속", count:14 },
    { country:"베트남", foodType:"수산물", item:"히스타민", count:8 },
    { country:"미국", foodType:"유지류", item:"벤조피렌", count:5 },
    { country:"태국", foodType:"과자류", item:"타르색소", count:4 },
    { country:"인도", foodType:"향신료", item:"살모넬라", count:3 },
  ],
};

// ── 상수 ─────────────────────────────────────────────────
const FOOD_TYPES = ["전체","유지류","냉동식품","수산물","음료류","과자류"];
const STATUS_COLOR = { 예정:"#8c8c8c", 진행중:"#2563eb", 완료:"#16a34a" };
const GRADE_COLOR = { 5:"#dc2626", 4:"#ea580c", 3:"#d97706", 2:"#65a30d", 1:"#6b7280" };
const GRADE_LABEL = { 5:"긴급", 4:"높음", 3:"보통", 2:"낮음", 1:"정보" };

const planHistory = {
  1:[{year:2024,total:8,fail:0},{year:2025,total:9,fail:1},{year:2026,total:0,fail:0}],
  2:[{year:2024,total:10,fail:1},{year:2025,total:11,fail:0},{year:2026,total:12,fail:0}],
  3:[{year:2024,total:8,fail:2},{year:2025,total:9,fail:1},{year:2026,total:10,fail:2}],
  4:[{year:2024,total:5,fail:0},{year:2025,total:6,fail:0},{year:2026,total:6,fail:0}],
  5:[{year:2024,total:7,fail:1},{year:2025,total:8,fail:2},{year:2026,total:8,fail:1}],
  6:[{year:2024,total:6,fail:1},{year:2025,total:7,fail:1},{year:2026,total:0,fail:0}],
};
const planFailDetail = {
  3:[
    {product:"명태포 200g", item:"히스타민", detected:"310", standard:"200 이하", measure:"해당 로트 전량 반품 완료"},
    {product:"냉동새우 1kg", item:"납", detected:"0.8", standard:"0.5 이하", measure:"조치 진행 중"},
  ],
  5:[{product:"전통한과 300g", item:"타르색소", detected:"검출", standard:"불검출", measure:"출하 보류 후 반품"}],
};

// ── 유틸 ─────────────────────────────────────────────────
function filterByPeriod(list, period, key="date") {
  const now = new Date("2026-05-28");
  return list.filter(d => {
    const diff = (now - new Date(d[key])) / 86400000;
    if (period==="1주") return diff <= 7;
    if (period==="1개월") return diff <= 30;
    if (period==="3개월") return diff <= 90;
    return true;
  });
}
function getHotKeywords(list) {
  const freq = {};
  list.forEach(n => n.keyword.forEach(kw => { freq[kw]=(freq[kw]||0)+1; }));
  return Object.entries(freq).filter(([,c])=>c>=2).sort((a,b)=>b[1]-a[1]);
}

// ── 공통 컴포넌트 ────────────────────────────────────────
function Badge({ grade }) {
  return (
    <span style={{ display:"inline-block", padding:"2px 8px", borderRadius:20, fontSize:11, fontWeight:600,
      background:GRADE_COLOR[grade]+"22", color:GRADE_COLOR[grade], border:`1px solid ${GRADE_COLOR[grade]}44` }}>
      {GRADE_LABEL[grade]}
    </span>
  );
}
function Tag({ children, color="#e5e7eb", text="#374151" }) {
  return (
    <span style={{ display:"inline-block", padding:"2px 8px", borderRadius:12, fontSize:11,
      background:color, color:text, marginRight:4, marginTop:2 }}>{children}</span>
  );
}
function Btn({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      padding:"5px 14px", borderRadius:20, fontSize:12, fontWeight:600, border:"1px solid",
      borderColor:active?"#111":"#e5e7eb", background:active?"#111":"#fff",
      color:active?"#fff":"#374151", cursor:"pointer" }}>{children}</button>
  );
}
function Modal({ title, onClose, children }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:1000,
      display:"flex", alignItems:"center", justifyContent:"center" }} onClick={onClose}>
      <div style={{ background:"#fff", borderRadius:12, padding:28, width:700, maxHeight:"82vh",
        overflowY:"auto", boxShadow:"0 20px 60px rgba(0,0,0,0.2)" }} onClick={e=>e.stopPropagation()}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <h3 style={{ margin:0, fontSize:16, fontWeight:700, color:"#111" }}>{title}</h3>
          <button onClick={onClose} style={{ border:"none", background:"none", fontSize:22, cursor:"pointer", color:"#6b7280" }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── ① 기획검사 캘린더 ────────────────────────────────────
function CalendarScreen() {
  const [selected, setSelected] = useState(null);
  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 360px", gap:16 }}>
      <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:12, padding:20 }}>
        <div style={{ fontSize:14, fontWeight:700, color:"#111", marginBottom:16 }}>2026년 기획검사 일정</div>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {SAMPLE.planned.map(p=>(
            <div key={p.id} onClick={()=>setSelected(selected?.id===p.id?null:p)}
              style={{ border:selected?.id===p.id?"2px solid #111":"1px solid #e5e7eb",
                borderRadius:10, padding:"14px 18px", cursor:"pointer",
                background:selected?.id===p.id?"#f9fafb":"#fff", transition:"border-color 0.15s" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:14, color:"#111", marginBottom:4 }}>{p.title}</div>
                  <div style={{ fontSize:12, color:"#6b7280" }}>예정완료일 {p.expectedEnd}</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ display:"inline-block", padding:"3px 12px", borderRadius:20, fontSize:12, fontWeight:600,
                    background:STATUS_COLOR[p.status]+"22", color:STATUS_COLOR[p.status] }}>{p.status}</div>
                  {p.status==="완료" && (
                    <div style={{ fontSize:13, marginTop:6, fontWeight:700, color:p.fail>0?"#dc2626":"#16a34a" }}>
                      부적합 {p.fail}건 / 전체 {p.total}건
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        {selected ? (
          <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:12, padding:20 }}>
            <div style={{ fontSize:13, fontWeight:700, color:"#111", marginBottom:16 }}>{selected.title} — 연도별 비교</div>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13, marginBottom:20 }}>
              <thead>
                <tr style={{ borderBottom:"2px solid #e5e7eb" }}>
                  {["연도","전체","부적합","부적합률"].map(h=>(
                    <th key={h} style={{ padding:"6px 8px", textAlign:h==="연도"?"left":"center", color:"#6b7280", fontWeight:600, fontSize:12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(planHistory[selected.id]||[]).map((h,i,arr)=>{
                  const avg3 = arr.reduce((s,r)=>s+(r.total>0?r.fail/r.total:0),0)/arr.length*100;
                  const rate = h.total>0?((h.fail/h.total)*100).toFixed(1):"—";
                  const isCur = h.year===2026;
                  const warn = h.total>0 && parseFloat(rate)>avg3*1.2;
                  return (
                    <tr key={h.year} style={{ borderBottom:"1px solid #f3f4f6", background:isCur?"#f9fafb":"#fff" }}>
                      <td style={{ padding:"8px", fontWeight:isCur?700:400, color:"#111" }}>{h.year}{isCur?" ← 현재":""}</td>
                      <td style={{ padding:"8px", textAlign:"center", color:"#374151" }}>{h.total||"—"}</td>
                      <td style={{ padding:"8px", textAlign:"center", color:h.fail>0?"#dc2626":"#16a34a", fontWeight:600 }}>{h.total>0?h.fail:"—"}</td>
                      <td style={{ padding:"8px", textAlign:"center", color:warn?"#dc2626":"#374151", fontWeight:600 }}>
                        {rate}{rate!=="—"?"%":""}{warn?" ⚠":""}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {planFailDetail[selected.id] ? (
              <>
                <div style={{ fontSize:11, fontWeight:700, color:"#6b7280", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:10 }}>부적합 내역</div>
                {planFailDetail[selected.id].map((d,i)=>(
                  <div key={i} style={{ background:"#fef2f2", borderRadius:8, padding:"10px 14px", borderLeft:"3px solid #dc2626", marginBottom:6 }}>
                    <div style={{ fontWeight:600, fontSize:13, color:"#111", marginBottom:4 }}>{d.product}</div>
                    <div style={{ fontSize:12, color:"#374151" }}>{d.item} · 검출 {d.detected} (기준 {d.standard})</div>
                    <div style={{ fontSize:12, color:"#6b7280", marginTop:4 }}>조치: {d.measure}</div>
                  </div>
                ))}
              </>
            ) : selected.status==="완료" ? (
              <div style={{ background:"#f0fdf4", borderRadius:8, padding:14, textAlign:"center", fontSize:13, color:"#16a34a" }}>
                이번 검사에서 부적합 없음
              </div>
            ) : (
              <div style={{ background:"#f9fafb", borderRadius:8, padding:14, textAlign:"center", fontSize:13, color:"#9ca3af" }}>
                검사 진행 중 또는 예정
              </div>
            )}
          </div>
        ) : (
          <div style={{ background:"#f9fafb", border:"1px solid #e5e7eb", borderRadius:12, padding:32,
            textAlign:"center", color:"#9ca3af", fontSize:13 }}>
            좌측 검사 항목을 클릭하면<br/>연도별 결과 비교가 표시됩니다
          </div>
        )}
      </div>
    </div>
  );
}

// ── ② L.safe 현황 (부적합만, 이력팝업에서 적합 포함) ─────
function LSafeScreen() {
  const [historyModal, setHistoryModal] = useState(null);
  const [measures, setMeasures] = useState({});
  const [filter, setFilter] = useState({ product:"", foodType:"전체" });

  const filtered = SAMPLE.lsafeFail.filter(d=>
    (filter.product===""||d.product.includes(filter.product))&&
    (filter.foodType==="전체"||d.foodType===filter.foodType)
  );
  const getHistory = (product) =>
    SAMPLE.lsafeAll.filter(d=>d.product===product).sort((a,b)=>b.date.localeCompare(a.date));

  return (
    <div>
      <div style={{ background:"#fef2f2", border:"1px solid #fca5a5", borderRadius:12, padding:"10px 16px",
        display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
        <span style={{ fontSize:12, color:"#dc2626", fontWeight:600 }}>부적합 건만 표시 중</span>
        <span style={{ fontSize:12, color:"#6b7280" }}>이력 버튼 클릭 시 적합 이력까지 전체 확인 가능</span>
        <div style={{ marginLeft:"auto" }}>
          <button style={{ padding:"5px 14px", background:"#16a34a", color:"#fff", border:"none",
            borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer" }}>CSV 업로드</button>
          <span style={{ fontSize:11, color:"#6b7280", marginLeft:10 }}>마지막 업로드: 2026-05-26</span>
        </div>
      </div>

      <div style={{ display:"flex", gap:10, marginBottom:16 }}>
        <input value={filter.product} onChange={e=>setFilter({...filter,product:e.target.value})}
          placeholder="제품명 검색..."
          style={{ flex:1, border:"1px solid #e5e7eb", borderRadius:8, padding:"7px 12px", fontSize:13 }} />
        <select value={filter.foodType} onChange={e=>setFilter({...filter,foodType:e.target.value})}
          style={{ border:"1px solid #e5e7eb", borderRadius:8, padding:"7px 12px", fontSize:13 }}>
          {FOOD_TYPES.map(f=><option key={f}>{f}</option>)}
        </select>
        <div style={{ padding:"7px 14px", background:"#fef2f2", border:"1px solid #fca5a5",
          borderRadius:8, fontSize:12, color:"#dc2626", fontWeight:600, display:"flex", alignItems:"center" }}>
          부적합 {filtered.length}건
        </div>
      </div>

      <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:12, overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
          <thead style={{ background:"#fef2f2" }}>
            <tr>
              {["제품명","식품유형","시험항목","검출값","기준값","시험일","전체이력","조치내역"].map(h=>(
                <th key={h} style={{ padding:"10px 14px", textAlign:"left", fontSize:12, color:"#6b7280",
                  fontWeight:600, borderBottom:"1px solid #fca5a5" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(row=>(
              <tr key={row.id} style={{ borderBottom:"1px solid #f3f4f6" }}>
                <td style={{ padding:"10px 14px", fontWeight:600, color:"#111" }}>{row.product}</td>
                <td style={{ padding:"10px 14px" }}><Tag color="#eff6ff" text="#1d4ed8">{row.foodType}</Tag></td>
                <td style={{ padding:"10px 14px", color:"#dc2626", fontWeight:600 }}>{row.item}</td>
                <td style={{ padding:"10px 14px", color:"#dc2626", fontWeight:700 }}>{row.detected}</td>
                <td style={{ padding:"10px 14px", color:"#6b7280" }}>{row.standard}</td>
                <td style={{ padding:"10px 14px", color:"#6b7280" }}>{row.date}</td>
                <td style={{ padding:"10px 14px" }}>
                  <button onClick={()=>setHistoryModal(row.product)} style={{
                    padding:"3px 10px", border:"1px solid #2563eb", borderRadius:8,
                    background:"#eff6ff", fontSize:12, cursor:"pointer", color:"#2563eb", fontWeight:600 }}>
                    {getHistory(row.product).length}건 ▸
                  </button>
                </td>
                <td style={{ padding:"10px 14px" }}>
                  <input defaultValue={measures[row.id]||row.measure||""} placeholder="조치내역 입력..."
                    style={{ width:160, border:"1px solid #fca5a5", borderRadius:6, padding:"4px 8px", fontSize:12 }}
                    onBlur={e=>setMeasures({...measures,[row.id]:e.target.value})} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {historyModal && (
        <Modal title={`${historyModal} — 시험 이력 전체 (적합+부적합)`} onClose={()=>setHistoryModal(null)}>
          <div style={{ fontSize:12, color:"#6b7280", marginBottom:14 }}>
            최신순 정렬 · 조치내역은 부적합 건에만 표시
          </div>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
            <thead>
              <tr style={{ borderBottom:"2px solid #e5e7eb" }}>
                {["시험일","시험항목","검출값","기준값","결과","조치사항"].map(h=>(
                  <th key={h} style={{ padding:"7px 10px", textAlign:"left", color:"#6b7280", fontWeight:600, fontSize:12 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {getHistory(historyModal).map((h,i)=>(
                <tr key={i} style={{ borderBottom:"1px solid #f3f4f6",
                  background:h.result==="부적합"?"#fef9f9":i===0?"#f9fafb":"#fff" }}>
                  <td style={{ padding:"9px 10px", color:"#374151" }}>{h.date}{i===0?" ← 최신":""}</td>
                  <td style={{ padding:"9px 10px", color:"#374151" }}>{h.item}</td>
                  <td style={{ padding:"9px 10px", color:h.result==="부적합"?"#dc2626":"#374151",
                    fontWeight:h.result==="부적합"?700:400 }}>{h.detected}</td>
                  <td style={{ padding:"9px 10px", color:"#6b7280" }}>{h.standard}</td>
                  <td style={{ padding:"9px 10px" }}>
                    <span style={{ padding:"2px 10px", borderRadius:12, fontSize:12, fontWeight:600,
                      background:h.result==="부적합"?"#fef2f2":"#f0fdf4",
                      color:h.result==="부적합"?"#dc2626":"#16a34a" }}>{h.result}</span>
                  </td>
                  <td style={{ padding:"9px 10px", fontSize:12, color:"#6b7280" }}>
                    {h.result==="부적합"
                      ? (h.measure||<span style={{color:"#fca5a5"}}>미입력</span>)
                      : <span style={{color:"#d1d5db"}}>—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Modal>
      )}
    </div>
  );
}

// ── ③ 부적합률 비교 ──────────────────────────────────────
function ComparisonScreen() {
  const [drillModal, setDrillModal] = useState(null);
  const { internal, mfds, byType } = SAMPLE.comparison;
  const drillData = {
    유지류:[{item:"산가",internal:4,mfds:2},{item:"벤조피렌",internal:2,mfds:1},{item:"과산화물가",internal:1,mfds:0}],
    수산물:[{item:"히스타민",internal:3,mfds:2},{item:"납",internal:2,mfds:1},{item:"카드뮴",internal:1,mfds:1}],
    냉동식품:[{item:"대장균군",internal:2,mfds:3},{item:"세균수",internal:1,mfds:1}],
    음료류:[{item:"보존료",internal:1,mfds:1},{item:"산도",internal:1,mfds:2}],
    과자류:[{item:"타르색소",internal:1,mfds:1}],
  };
  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:20 }}>
        {[
          {label:"내부 부적합률", sub:"기획검사+L.safe", rate:internal.rate, prev:internal.prev, total:internal.total, fail:internal.fail, hi:internal.rate>mfds.rate},
          {label:"식약처 부적합률", sub:"수거검사 계획실적", rate:mfds.rate, prev:mfds.prev, total:mfds.total, fail:mfds.fail, hi:false},
        ].map(c=>(
          <div key={c.label} style={{ background:"#fff", border:c.hi?"2px solid #dc2626":"1px solid #e5e7eb", borderRadius:12, padding:24 }}>
            <div style={{ fontSize:12, color:"#6b7280", marginBottom:2 }}>{c.label}</div>
            <div style={{ fontSize:11, color:"#9ca3af", marginBottom:14 }}>{c.sub}</div>
            <div style={{ display:"flex", gap:20, alignItems:"flex-end" }}>
              <div>
                <div style={{ fontSize:11, color:"#6b7280", marginBottom:2 }}>올해 누적</div>
                <div style={{ fontSize:38, fontWeight:800, color:c.hi?"#dc2626":"#111", lineHeight:1 }}>{c.rate}%</div>
                <div style={{ fontSize:12, color:"#9ca3af", marginTop:4 }}>{c.total}건 중 {c.fail}건</div>
              </div>
              <div style={{ paddingBottom:6 }}>
                <div style={{ fontSize:11, color:"#6b7280", marginBottom:2 }}>전년</div>
                <div style={{ fontSize:22, fontWeight:700, color:"#9ca3af" }}>{c.prev}%</div>
                <div style={{ fontSize:12, color:c.rate<c.prev?"#16a34a":"#dc2626" }}>
                  {c.rate<c.prev?"▼ 개선":"▲ 악화"}
                </div>
              </div>
            </div>
            {c.hi&&<div style={{ marginTop:10, fontSize:11, color:"#dc2626", background:"#fef2f2", borderRadius:6, padding:"4px 8px" }}>⚠ 내부 부적합률이 식약처보다 높습니다</div>}
          </div>
        ))}
      </div>
      <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:12, padding:20 }}>
        <div style={{ fontSize:14, fontWeight:700, color:"#111", marginBottom:4 }}>식품유형별 부적합률 비교</div>
        <div style={{ fontSize:12, color:"#6b7280", marginBottom:16 }}>클릭 시 시험항목별 상세 확인</div>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {byType.map(row=>{
            const hi=row.internal>row.mfds, max=Math.max(row.internal,row.mfds,10);
            return (
              <div key={row.type} onClick={()=>setDrillModal(row.type)}
                style={{ cursor:"pointer", padding:"12px 16px", borderRadius:8,
                  background:hi?"#fef2f2":"#f9fafb", border:hi?"1px solid #fca5a5":"1px solid #f3f4f6" }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                  <span style={{ fontWeight:700, fontSize:13, color:"#111" }}>{row.type}</span>
                  <span style={{ fontSize:12, color:hi?"#dc2626":"#16a34a", fontWeight:600 }}>
                    {hi?`▲ 내부 +${(row.internal-row.mfds).toFixed(1)}%p`:"◆ 양호"}
                  </span>
                </div>
                {[{label:"내부",val:row.internal,color:hi?"#dc2626":"#2563eb"},{label:"식약처",val:row.mfds,color:"#9ca3af"}].map(b=>(
                  <div key={b.label} style={{ display:"flex", gap:10, alignItems:"center", marginBottom:4 }}>
                    <span style={{ fontSize:12, color:"#6b7280", width:40 }}>{b.label}</span>
                    <div style={{ flex:1, background:"#e5e7eb", borderRadius:4, height:8 }}>
                      <div style={{ width:`${(b.val/max)*100}%`, background:b.color, height:8, borderRadius:4 }} />
                    </div>
                    <span style={{ fontSize:13, fontWeight:700, color:b.color, width:36, textAlign:"right" }}>{b.val}%</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
        <div style={{ marginTop:12, padding:"8px 12px", background:"#f9fafb", borderRadius:8, fontSize:11, color:"#6b7280" }}>
          산출기준: 내부=(기획검사+L.safe 부적합)÷전체시험건수×100 / 식약처=수거검사부적합÷수거검사총건수×100 / 갱신: 내부·식약처 모두 월 1회
        </div>
      </div>
      {drillModal&&(
        <Modal title={`[${drillModal}] 시험항목별 부적합 건수`} onClose={()=>setDrillModal(null)}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
            <thead>
              <tr style={{ borderBottom:"2px solid #e5e7eb" }}>
                {["시험항목","내부","식약처","비고"].map(h=>(
                  <th key={h} style={{ padding:"8px 10px", textAlign:"left", color:"#6b7280", fontWeight:600, fontSize:12 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(drillData[drillModal]||[]).map((row,i)=>{
                const hi=row.internal>row.mfds;
                return (
                  <tr key={i} style={{ borderBottom:"1px solid #f3f4f6", background:hi?"#fef2f2":"#fff" }}>
                    <td style={{ padding:"10px", fontWeight:600 }}>{row.item}</td>
                    <td style={{ padding:"10px", color:hi?"#dc2626":"#374151", fontWeight:hi?700:400 }}>{row.internal}건</td>
                    <td style={{ padding:"10px", color:"#6b7280" }}>{row.mfds}건</td>
                    <td style={{ padding:"10px", fontSize:12, color:hi?"#dc2626":"#6b7280" }}>{hi?"내부 건수 높음 ⚠":"-"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Modal>
      )}
    </div>
  );
}

// ── ④ 종합 현황 ──────────────────────────────────────────
function HomeScreen({ onNav, noncompliant }) {
  const [trendTab, setTrendTab] = useState("월별");
  const todayFails = noncompliant.filter(d=>d.date==="2026-05-28");
  const recallActive = noncompliant.filter(d=>d.recall&&d.date!=="2026-05-28");
  const allActive = [...todayFails,...recallActive];
  const byType = {};
  allActive.forEach(d=>{byType[d.foodType]=(byType[d.foodType]||0)+1;});
  const typeEntries = Object.entries(byType).sort((a,b)=>b[1]-a[1]);
  const highNews = SAMPLE.news.filter(n=>n.grade>=3&&(new Date("2026-05-28")-new Date(n.date))/86400000<=7);
  const topNews = highNews.find(n=>n.grade>=4);
  const {internal,mfds} = SAMPLE.comparison;
  const trendRows = SAMPLE.trendData[trendTab];
  const foodKeys = ["유지류","냉동식품","수산물","음료류","과자류"];
  const maxTrend = Math.max(...trendRows.flatMap(r=>foodKeys.map(k=>r.data[k]||0)));
  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14, marginBottom:24 }}>
        <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:12, padding:20, cursor:"pointer" }}
          onClick={()=>onNav("noncompliant")}>
          <div style={{ fontSize:11, color:"#6b7280", fontWeight:600, marginBottom:4 }}>오늘 부적합 · 진행 중 회수</div>
          <div style={{ display:"flex", alignItems:"baseline", gap:8, marginBottom:10 }}>
            <span style={{ fontSize:32, fontWeight:800, color:allActive.length>0?"#ea580c":"#111" }}>
              {todayFails.length+recallActive.length}
            </span>
            <span style={{ fontSize:13, color:"#6b7280" }}>건</span>
            <span style={{ fontSize:12, color:"#9ca3af" }}>부적합 {todayFails.length} · 회수 {recallActive.length}</span>
          </div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
            {typeEntries.map(([type,cnt])=>(
              <Tag key={type} color="#fef3c7" text="#92400e">{type} {cnt}건</Tag>
            ))}
          </div>
        </div>
        <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:12, padding:20, cursor:"pointer" }}
          onClick={()=>onNav("news")}>
          <div style={{ fontSize:11, color:"#6b7280", fontWeight:600, marginBottom:4 }}>이번주 주의 기사</div>
          <div style={{ display:"flex", alignItems:"baseline", gap:8, marginBottom:10 }}>
            <span style={{ fontSize:32, fontWeight:800, color:highNews.length>=1?"#ea580c":"#111" }}>{highNews.length}</span>
            <span style={{ fontSize:13, color:"#6b7280" }}>건 (3등급 이상)</span>
          </div>
          {topNews&&(
            <div style={{ fontSize:12, color:"#374151", background:"#fef2f2", borderRadius:8, padding:"6px 10px",
              borderLeft:"3px solid #dc2626", lineHeight:1.4 }}>{topNews.title}</div>
          )}
        </div>
        <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:12, padding:20, cursor:"pointer" }}
          onClick={()=>onNav("comparison")}>
          <div style={{ fontSize:11, color:"#6b7280", fontWeight:600, marginBottom:8 }}>내부 vs 식약처 부적합률 (올해 누적)</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            {[{label:"내부",rate:internal.rate,prev:internal.prev,hi:internal.rate>mfds.rate},
              {label:"식약처",rate:mfds.rate,prev:mfds.prev,hi:false}].map(c=>(
              <div key={c.label}>
                <div style={{ fontSize:11, color:"#6b7280", marginBottom:2 }}>{c.label}</div>
                <div style={{ fontSize:26, fontWeight:800, color:c.hi?"#dc2626":"#374151" }}>{c.rate}%</div>
                <div style={{ fontSize:11, color:"#9ca3af" }}>전년 {c.prev}%</div>
              </div>
            ))}
          </div>
          {internal.rate>mfds.rate&&<div style={{ marginTop:8, fontSize:11, color:"#dc2626", background:"#fef2f2", borderRadius:6, padding:"4px 8px" }}>⚠ 내부가 식약처보다 높음</div>}
        </div>
      </div>

      <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:12, padding:20, marginBottom:16 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <div style={{ fontSize:14, fontWeight:700, color:"#111" }}>식품유형별 부적합 건수 비교</div>
          <div style={{ display:"flex", gap:6 }}>
            {["월별","분기별","3개년평균"].map(tab=>(
              <Btn key={tab} active={trendTab===tab} onClick={()=>setTrendTab(tab)}>{tab}</Btn>
            ))}
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:12 }}>
          {foodKeys.map(food=>{
            const [r1,r2]=trendRows; const v1=r1.data[food]||0,v2=r2.data[food]||0; const hi=v2>v1;
            return (
              <div key={food} style={{ textAlign:"center" }}>
                <div style={{ fontSize:12, color:"#6b7280", marginBottom:8, fontWeight:600 }}>{food}</div>
                <div style={{ display:"flex", gap:4, justifyContent:"center", alignItems:"flex-end", height:80 }}>
                  {[{v:v1,c:"#d1d5db"},{v:v2,c:hi?"#dc2626":"#2563eb"}].map((b,i)=>(
                    <div key={i} style={{ width:24, borderRadius:"4px 4px 0 0",
                      height:`${Math.max((b.v/maxTrend)*76,4)}px`, background:b.c,
                      display:"flex", alignItems:"flex-end", justifyContent:"center" }}>
                      <span style={{ fontSize:10, color:i===0?"#6b7280":"#fff", paddingBottom:2 }}>{b.v}</span>
                    </div>
                  ))}
                </div>
                {hi&&<div style={{ fontSize:10, color:"#dc2626", marginTop:4 }}>↑ 증가</div>}
              </div>
            );
          })}
        </div>
        <div style={{ display:"flex", gap:16, marginTop:12, fontSize:11, color:"#6b7280" }}>
          {[{c:"#d1d5db",l:trendRows[0].label},{c:"#2563eb",l:trendRows[1].label},{c:"#dc2626",l:"증가 항목"}].map(l=>(
            <span key={l.l}><span style={{ display:"inline-block",width:10,height:10,background:l.c,borderRadius:2,marginRight:4 }}></span>{l.l}</span>
          ))}
        </div>
      </div>

      <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:12, padding:20 }}>
        <div style={{ fontSize:14, fontWeight:700, color:"#111", marginBottom:14 }}>최신 부적합·회수 목록</div>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
          <thead>
            <tr style={{ borderBottom:"2px solid #e5e7eb" }}>
              {["날짜","식품유형","제품명","업체명","위반항목","회수"].map(h=>(
                <th key={h} style={{ padding:"6px 8px", textAlign:"left", color:"#6b7280", fontWeight:600, fontSize:12 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {noncompliant.slice(0,6).map(row=>(
              <tr key={row.id} style={{ borderBottom:"1px solid #f3f4f6" }}>
                <td style={{ padding:"8px", color:"#6b7280", fontSize:12 }}>{row.date}</td>
                <td style={{ padding:"8px" }}><Tag color="#eff6ff" text="#1d4ed8">{row.foodType}</Tag></td>
                <td style={{ padding:"8px", fontWeight:500, color:"#111" }}>{row.product}</td>
                <td style={{ padding:"8px", color:"#374151" }}>{row.vendor}</td>
                <td style={{ padding:"8px", color:"#dc2626", fontWeight:600 }}>{row.item}</td>
                <td style={{ padding:"8px" }}>{row.recall?<Tag color="#fef2f2" text="#dc2626">회수</Tag>:<Tag color="#f9fafb" text="#9ca3af">없음</Tag>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── ⑤ 부적합·회수 현황 ───────────────────────────────────
function NoncompliantScreen({ noncompliant }) {
  const [ftFilter, setFtFilter] = useState("전체");
  const [recFilter, setRecFilter] = useState("전체");
  const [activeTab, setActiveTab] = useState("위험식품유형");
  const [typeModal, setTypeModal] = useState(null);
  const [heatModal, setHeatModal] = useState(null);

  const filtered = noncompliant.filter(d=>
    (ftFilter==="전체"||d.foodType===ftFilter)&&
    (recFilter==="전체"||(recFilter==="회수"?d.recall:!d.recall))
  );

  // 식품유형별 건수
  const byFT = {};
  noncompliant.forEach(d=>{byFT[d.foodType]=(byFT[d.foodType]||0)+1;});
  const ftList = Object.entries(byFT).sort((a,b)=>b[1]-a[1]);
  const maxFT = ftList[0]?.[1]||1;

  const getItemsForType = (type) => {
    const c={};
    noncompliant.filter(d=>d.foodType===type).forEach(d=>{c[d.item]=(c[d.item]||0)+1;});
    return Object.entries(c).sort((a,b)=>b[1]-a[1]);
  };

  // 히트맵
  const heatmap={}, allItems=[], allTypes=[];
  noncompliant.forEach(d=>{
    if(!heatmap[d.foodType])heatmap[d.foodType]={};
    heatmap[d.foodType][d.item]=(heatmap[d.foodType][d.item]||0)+1;
    if(!allTypes.includes(d.foodType))allTypes.push(d.foodType);
    if(!allItems.includes(d.item))allItems.push(d.item);
  });
  const maxHeat=Math.max(...Object.values(heatmap).flatMap(v=>Object.values(v)));

  const prevYear={유지류:6,냉동식품:4,수산물:3,음료류:2,과자류:2};
  const currYear={};
  noncompliant.forEach(d=>{currYear[d.foodType]=(currYear[d.foodType]||0)+1;});

  const repeatVendors={};
  noncompliant.forEach(d=>{repeatVendors[d.vendor]=(repeatVendors[d.vendor]||[]).concat(d);});
  const repeated=Object.entries(repeatVendors).filter(([,arr])=>arr.length>=2).sort((a,b)=>b[1].length-a[1].length);

  return (
    <div>
      <div style={{ display:"flex", gap:10, marginBottom:16 }}>
        <select value={ftFilter} onChange={e=>setFtFilter(e.target.value)}
          style={{ border:"1px solid #e5e7eb", borderRadius:8, padding:"7px 12px", fontSize:13 }}>
          {FOOD_TYPES.map(f=><option key={f}>{f}</option>)}
        </select>
        <select value={recFilter} onChange={e=>setRecFilter(e.target.value)}
          style={{ border:"1px solid #e5e7eb", borderRadius:8, padding:"7px 12px", fontSize:13 }}>
          {["전체","회수","회수없음"].map(r=><option key={r}>{r}</option>)}
        </select>
      </div>

      <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:12, overflow:"hidden", marginBottom:16 }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
          <thead style={{ background:"#f9fafb" }}>
            <tr>
              {["날짜","식품유형","제품명","업소명","부적합항목","검사결과","기준규격","회수여부"].map(h=>(
                <th key={h} style={{ padding:"10px 12px", textAlign:"left", fontSize:12, color:"#6b7280", fontWeight:600, borderBottom:"1px solid #e5e7eb" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(row=>(
              <tr key={row.id} style={{ borderBottom:"1px solid #f3f4f6" }}>
                <td style={{ padding:"10px 12px", color:"#6b7280", fontSize:12 }}>{row.date}</td>
                <td style={{ padding:"10px 12px" }}><Tag color="#eff6ff" text="#1d4ed8">{row.foodType}</Tag></td>
                <td style={{ padding:"10px 12px", fontWeight:600, color:"#111" }}>{row.product}</td>
                <td style={{ padding:"10px 12px", color:"#374151" }}>{row.vendor}</td>
                <td style={{ padding:"10px 12px", color:"#dc2626", fontWeight:600 }}>{row.item}</td>
                <td style={{ padding:"10px 12px", color:"#dc2626" }}>{row.result}</td>
                <td style={{ padding:"10px 12px", color:"#6b7280" }}>{row.standard}</td>
                <td style={{ padding:"10px 12px" }}>{row.recall?<Tag color="#fef2f2" text="#dc2626">회수</Tag>:<Tag color="#f9fafb" text="#9ca3af">없음</Tag>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display:"flex", gap:8, marginBottom:14 }}>
        {["위험식품유형","전년대비증가","위반항목히트맵","반복위반업체"].map(tab=>(
          <Btn key={tab} active={activeTab===tab} onClick={()=>setActiveTab(tab)}>{tab}</Btn>
        ))}
      </div>

      {activeTab==="위험식품유형"&&(
        <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:12, padding:20 }}>
          <div style={{ fontSize:13, fontWeight:700, color:"#111", marginBottom:4 }}>식품유형별 부적합 건수</div>
          <div style={{ fontSize:12, color:"#6b7280", marginBottom:14 }}>클릭 시 해당 식품유형의 시험항목별 건수 확인 (부적합 건수 순)</div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {ftList.map(([type,cnt],i)=>(
              <div key={type} onClick={()=>setTypeModal(type)}
                style={{ display:"flex", gap:12, alignItems:"center", cursor:"pointer",
                  padding:"8px 12px", borderRadius:8,
                  background:i===0?"#fef2f2":"#f9fafb",
                  border:i===0?"1px solid #fca5a5":"1px solid #f3f4f6" }}>
                <span style={{ width:70, fontWeight:700, fontSize:13, color:"#111" }}>{type}</span>
                <div style={{ flex:1, background:"#e5e7eb", borderRadius:4, height:20 }}>
                  <div style={{ width:`${(cnt/maxFT)*100}%`,
                    background:i===0?"#dc2626":i===1?"#ea580c":"#2563eb",
                    height:20, borderRadius:4, display:"flex", alignItems:"center", paddingLeft:8 }}>
                    <span style={{ fontSize:11, color:"#fff", fontWeight:600 }}>{cnt}건</span>
                  </div>
                </div>
                <span style={{ fontSize:12, color:"#2563eb" }}>시험항목 ▸</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab==="전년대비증가"&&(
        <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:12, padding:20 }}>
          <div style={{ fontSize:13, fontWeight:700, color:"#111", marginBottom:16 }}>식품유형별 전년 동기 대비</div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {Object.keys(prevYear).map(type=>{
              const curr=currYear[type]||0,prev=prevYear[type],inc=curr>prev;
              return (
                <div key={type} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 14px", borderRadius:8,
                  background:inc?"#fef2f2":"#f9fafb", border:inc?"1px solid #fca5a5":"1px solid #f3f4f6" }}>
                  <span style={{ width:70, fontWeight:600, fontSize:13, color:"#111" }}>{type}</span>
                  <span style={{ fontSize:12, color:"#6b7280", width:60 }}>전년 {prev}건</span>
                  <span style={{ fontSize:14, fontWeight:700, color:inc?"#dc2626":"#374151" }}>올해 {curr}건</span>
                  {inc?<Tag color="#fef2f2" text="#dc2626">↑ {curr-prev}건 증가</Tag>:<Tag color="#f0fdf4" text="#16a34a">양호</Tag>}
                </div>
              );
            })}
          </div>
          <div style={{ fontSize:11, color:"#9ca3af", marginTop:10 }}>* 현재 월까지의 구간을 전년 동기와 비교</div>
        </div>
      )}

      {activeTab==="위반항목히트맵"&&(
        <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:12, padding:20 }}>
          <div style={{ fontSize:13, fontWeight:700, color:"#111", marginBottom:16 }}>식품유형 × 시험항목 히트맵</div>
          <div style={{ overflowX:"auto" }}>
            <table style={{ borderCollapse:"collapse", fontSize:12 }}>
              <thead>
                <tr>
                  <th style={{ padding:"6px 12px", textAlign:"left", color:"#6b7280", minWidth:80 }}>식품유형 ╲ 항목</th>
                  {allItems.map(item=>(
                    <th key={item} style={{ padding:"6px 10px", color:"#6b7280", fontWeight:600, whiteSpace:"nowrap" }}>{item}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allTypes.map(type=>(
                  <tr key={type}>
                    <td style={{ padding:"8px 12px", fontWeight:600, color:"#111" }}>{type}</td>
                    {allItems.map(item=>{
                      const cnt=heatmap[type]?.[item]||0, intensity=cnt/maxHeat;
                      return (
                        <td key={item} onClick={()=>cnt>0&&setHeatModal({type,item})}
                          style={{ padding:"8px 10px", textAlign:"center",
                            background:cnt>0?`rgba(220,38,38,${0.15+intensity*0.7})`:"#f9fafb",
                            cursor:cnt>0?"pointer":"default", borderRadius:4,
                            color:cnt>0?"#fff":"#d1d5db", fontWeight:700 }}>
                          {cnt||""}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab==="반복위반업체"&&(
        <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:12, padding:20 }}>
          <div style={{ fontSize:13, fontWeight:700, color:"#111", marginBottom:16 }}>반복 위반 업체 (1년 내 2회 이상)</div>
          {repeated.length===0
            ?<div style={{ color:"#9ca3af", textAlign:"center", padding:24 }}>해당 업체 없음</div>
            :repeated.map(([vendor,records])=>(
              <div key={vendor} style={{ border:"1px solid #fca5a5", borderRadius:10, padding:"12px 16px", background:"#fef2f2", marginBottom:8 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                  <span style={{ fontWeight:700, fontSize:14, color:"#111" }}>{vendor}</span>
                  <div>
                    <Tag color="#fef2f2" text="#dc2626">부적합 {records.length}건</Tag>
                    {records.some(r=>r.recall)&&<Tag color="#fef9c3" text="#92400e">회수 포함</Tag>}
                  </div>
                </div>
                {records.map(r=>(
                  <div key={r.id} style={{ fontSize:12, color:"#374151", marginBottom:2 }}>
                    {r.date} · {r.foodType} · {r.product} · <span style={{ color:"#dc2626", fontWeight:600 }}>{r.item}</span>
                  </div>
                ))}
              </div>
            ))
          }
        </div>
      )}

      {typeModal&&(
        <Modal title={`[${typeModal}] 시험항목별 부적합 건수 (건수 순)`} onClose={()=>setTypeModal(null)}>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {getItemsForType(typeModal).map(([item,cnt],i)=>{
              const max=getItemsForType(typeModal)[0][1];
              return (
                <div key={item} style={{ display:"flex", gap:12, alignItems:"center", padding:"8px 10px",
                  background:i===0?"#fef2f2":"#f9fafb", borderRadius:8 }}>
                  <span style={{ width:100, fontWeight:i===0?700:400, fontSize:13, color:"#111" }}>{item}</span>
                  <div style={{ flex:1, background:"#e5e7eb", borderRadius:4, height:18 }}>
                    <div style={{ width:`${(cnt/max)*100}%`, background:i===0?"#dc2626":"#2563eb",
                      height:18, borderRadius:4, display:"flex", alignItems:"center", paddingLeft:8 }}>
                      <span style={{ fontSize:11, color:"#fff", fontWeight:600 }}>{cnt}건</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Modal>
      )}
      {heatModal&&(
        <Modal title={`${heatModal.type} × ${heatModal.item}`} onClose={()=>setHeatModal(null)}>
          {noncompliant.filter(d=>d.foodType===heatModal.type&&d.item===heatModal.item).map(d=>(
            <div key={d.id} style={{ background:"#fef2f2", borderRadius:8, padding:"10px 14px", marginBottom:6 }}>
              <div style={{ fontWeight:600, fontSize:13 }}>{d.product}</div>
              <div style={{ fontSize:12, color:"#374151" }}>{d.vendor} · {d.date} · 검출 {d.result} (기준 {d.standard})</div>
            </div>
          ))}
        </Modal>
      )}
    </div>
  );
}

// ── ⑦ 뉴스 모니터링 ─────────────────────────────────────
// 조치 상태 색상
const ACTION_STATUS_STYLE = {
  "검토중":  { bg:"#fef9c3", text:"#92400e", border:"#fde68a" },
  "조치완료":{ bg:"#f0fdf4", text:"#15803d", border:"#bbf7d0" },
  "해당없음":{ bg:"#f3f4f6", text:"#6b7280", border:"#e5e7eb" },
};

// 샘플 초기 조치 이력 (4~5등급 뉴스 일부에 미리 데이터)
const INITIAL_ACTIONS = {
  2: [{ id:1, date:"2026-05-27", writer:"김안전", content:"자사 취급 참기름 L.safe 시험의뢰 완료, 결과 대기 중", status:"검토중" }],
  5: [
    { id:1, date:"2026-05-25", writer:"이검사", content:"협력사 동해수산 명태포 해당 로트 입고 보류 조치", status:"조치완료" },
    { id:2, date:"2026-05-26", writer:"김안전", content:"재입고 기준 강화 협의 완료", status:"조치완료" },
  ],
};

function NewsScreen() {
  const [period, setPeriod] = useState("1주");
  const [gradeFilter, setGradeFilter] = useState("전체");
  const [actionMap, setActionMap] = useState(INITIAL_ACTIONS); // {newsId: [{id,date,writer,content,status}]}
  const [expandedAction, setExpandedAction] = useState({}); // {newsId: bool}
  const [inputMap, setInputMap] = useState({}); // {newsId: {writer,content,status}}
  const [historyModal, setHistoryModal] = useState(null); // newsId

  const periodFiltered = filterByPeriod(SAMPLE.news, period);
  const displayed = gradeFilter==="전체" ? periodFiltered : periodFiltered.filter(n=>n.grade>=parseInt(gradeFilter));
  const hotKeywords = getHotKeywords(periodFiltered);
  const hotSet = new Set(hotKeywords.map(([k])=>k));

  // 조치 추가
  const addAction = (newsId) => {
    const inp = inputMap[newsId] || {};
    if (!inp.content?.trim()) return;
    const newEntry = {
      id: Date.now(),
      date: "2026-05-28",
      writer: inp.writer || "담당자",
      content: inp.content.trim(),
      status: inp.status || "검토중",
    };
    setActionMap(prev => ({ ...prev, [newsId]: [...(prev[newsId]||[]), newEntry] }));
    setInputMap(prev => ({ ...prev, [newsId]: { writer:"", content:"", status:"검토중" } }));
  };

  // 조치 상태 변경
  const changeStatus = (newsId, actionId, newStatus) => {
    setActionMap(prev => ({
      ...prev,
      [newsId]: prev[newsId].map(a => a.id===actionId ? {...a, status:newStatus} : a)
    }));
  };

  // 뉴스별 최신 조치 상태
  const getLatestStatus = (newsId) => {
    const list = actionMap[newsId];
    if (!list || list.length===0) return null;
    return list[list.length-1].status;
  };

  return (
    <div>
      {/* 필터 */}
      <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap", alignItems:"center" }}>
        <span style={{ fontSize:12, color:"#6b7280", fontWeight:600 }}>기간</span>
        {["1주","1개월","3개월","전체"].map(p=>(
          <Btn key={p} active={period===p} onClick={()=>setPeriod(p)}>{p}</Btn>
        ))}
        <div style={{ width:1, height:20, background:"#e5e7eb", margin:"0 4px" }} />
        <span style={{ fontSize:12, color:"#6b7280", fontWeight:600 }}>등급</span>
        {["전체","3","4","5"].map(g=>(
          <Btn key={g} active={gradeFilter===g} onClick={()=>setGradeFilter(g)}>{g==="전체"?"전체":g+"등급 이상"}</Btn>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 240px", gap:16 }}>
        {/* 뉴스 목록 */}
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {displayed.length===0
            ? <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:12, padding:32, textAlign:"center", color:"#9ca3af" }}>
                해당 기간·조건에 맞는 뉴스가 없습니다
              </div>
            : displayed.map(news => {
                const latestStatus = getLatestStatus(news.id);
                const actions = actionMap[news.id] || [];
                const isExpanded = expandedAction[news.id];
                const inp = inputMap[news.id] || { writer:"", content:"", status:"검토중" };
                const needAction = news.grade >= 4;

                return (
                  <div key={news.id} style={{
                    background:"#fff", borderRadius:12,
                    border:"1px solid", borderColor:news.grade>=4?"#fca5a5":"#e5e7eb",
                    borderLeft:`4px solid ${GRADE_COLOR[news.grade]}`,
                    overflow:"hidden"
                  }}>
                    {/* 뉴스 본문 영역 */}
                    <div style={{ padding:"14px 18px" }}>
                      <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:8, flexWrap:"wrap" }}>
                        <Badge grade={news.grade} />
                        <span style={{ fontSize:12, color:"#6b7280" }}>{news.date}</span>
                        <Tag color="#eff6ff" text="#1d4ed8">{news.foodType}</Tag>
                        {/* 조치 상태 뱃지 */}
                        {needAction && latestStatus && (
                          <span style={{
                            padding:"2px 10px", borderRadius:20, fontSize:11, fontWeight:600,
                            background:ACTION_STATUS_STYLE[latestStatus].bg,
                            color:ACTION_STATUS_STYLE[latestStatus].text,
                            border:`1px solid ${ACTION_STATUS_STYLE[latestStatus].border}`
                          }}>{latestStatus}</span>
                        )}
                        {needAction && !latestStatus && (
                          <span style={{ padding:"2px 10px", borderRadius:20, fontSize:11, fontWeight:600,
                            background:"#fef2f2", color:"#dc2626", border:"1px solid #fca5a5" }}>조치 필요</span>
                        )}
                      </div>
                      <div style={{ fontSize:14, fontWeight:600, color:"#111", marginBottom:8 }}>{news.title}</div>
                      <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginBottom: needAction?8:0 }}>
                        {news.keyword.map(kw=>(
                          <Tag key={kw} color={hotSet.has(kw)?"#fef9c3":"#f3f4f6"} text={hotSet.has(kw)?"#92400e":"#374151"}>
                            #{kw}{hotSet.has(kw)?" 🔥":""}
                          </Tag>
                        ))}
                      </div>
                      {news.grade>=4 && (
                        <div style={{ fontSize:11, color:"#6b7280", background:"#fef2f2", borderRadius:6, padding:"4px 8px" }}>
                          LLM 판정 근거: 회수·리콜 조치 또는 인명 영향 관련 키워드 감지됨
                        </div>
                      )}
                    </div>

                    {/* 조치사항 영역 — 4~5등급만 */}
                    {needAction && (
                      <div style={{ borderTop:"1px solid #f3f4f6", background:"#fafafa" }}>
                        {/* 헤더 토글 */}
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                          padding:"10px 18px", cursor:"pointer" }}
                          onClick={()=>setExpandedAction(prev=>({...prev,[news.id]:!prev[news.id]}))}>
                          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                            <span style={{ fontSize:12, fontWeight:700, color:"#374151" }}>조치사항</span>
                            {actions.length>0 && (
                              <span style={{ fontSize:11, background:"#e5e7eb", color:"#6b7280",
                                borderRadius:20, padding:"1px 8px", fontWeight:600 }}>
                                {actions.length}건
                              </span>
                            )}
                            {actions.length>0 && (
                              <button onClick={e=>{e.stopPropagation();setHistoryModal(news.id);}}
                                style={{ fontSize:11, color:"#2563eb", background:"none", border:"none",
                                  cursor:"pointer", textDecoration:"underline", padding:0 }}>
                                전체이력
                              </button>
                            )}
                          </div>
                          <span style={{ fontSize:12, color:"#9ca3af" }}>{isExpanded?"▲":"▼"}</span>
                        </div>

                        {isExpanded && (
                          <div style={{ padding:"0 18px 14px" }}>
                            {/* 최근 조치 1건 미리보기 */}
                            {actions.length>0 && (
                              <div style={{ marginBottom:12 }}>
                                {actions.slice(-1).map(a=>(
                                  <div key={a.id} style={{ background:"#fff", border:"1px solid #e5e7eb",
                                    borderRadius:8, padding:"10px 12px", marginBottom:4 }}>
                                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                                      <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                                        <span style={{ fontSize:12, fontWeight:600, color:"#111" }}>{a.writer}</span>
                                        <span style={{ fontSize:11, color:"#9ca3af" }}>{a.date}</span>
                                      </div>
                                      {/* 상태 변경 드롭다운 */}
                                      <select value={a.status}
                                        onChange={e=>changeStatus(news.id, a.id, e.target.value)}
                                        style={{ fontSize:11, border:"1px solid #e5e7eb", borderRadius:6,
                                          padding:"2px 6px",
                                          background:ACTION_STATUS_STYLE[a.status].bg,
                                          color:ACTION_STATUS_STYLE[a.status].text,
                                          fontWeight:600, cursor:"pointer" }}>
                                        {["검토중","조치완료","해당없음"].map(s=><option key={s}>{s}</option>)}
                                      </select>
                                    </div>
                                    <div style={{ fontSize:13, color:"#374151", lineHeight:1.5 }}>{a.content}</div>
                                  </div>
                                ))}
                                {actions.length>1 && (
                                  <div style={{ fontSize:11, color:"#6b7280", textAlign:"center", padding:"4px 0" }}>
                                    이전 {actions.length-1}건 · <span style={{ color:"#2563eb", cursor:"pointer", textDecoration:"underline" }}
                                      onClick={()=>setHistoryModal(news.id)}>전체 이력 보기</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* 조치 입력 폼 */}
                            <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:8, padding:12 }}>
                              <div style={{ fontSize:11, fontWeight:700, color:"#6b7280", marginBottom:8,
                                textTransform:"uppercase", letterSpacing:"0.06em" }}>새 조치사항 입력</div>
                              <div style={{ display:"flex", gap:8, marginBottom:8 }}>
                                <input placeholder="담당자"
                                  value={inp.writer}
                                  onChange={e=>setInputMap(prev=>({...prev,[news.id]:{...inp,writer:e.target.value}}))}
                                  style={{ width:90, border:"1px solid #e5e7eb", borderRadius:6, padding:"5px 8px", fontSize:12 }} />
                                <select value={inp.status||"검토중"}
                                  onChange={e=>setInputMap(prev=>({...prev,[news.id]:{...inp,status:e.target.value}}))}
                                  style={{ border:"1px solid #e5e7eb", borderRadius:6, padding:"5px 8px", fontSize:12,
                                    background:ACTION_STATUS_STYLE[inp.status||"검토중"].bg,
                                    color:ACTION_STATUS_STYLE[inp.status||"검토중"].text, fontWeight:600 }}>
                                  {["검토중","조치완료","해당없음"].map(s=><option key={s}>{s}</option>)}
                                </select>
                              </div>
                              <div style={{ display:"flex", gap:8 }}>
                                <textarea placeholder="조치 내용 입력 (예: 자사 취급 제품 확인 완료, 협력사에 시정 요청 등)"
                                  value={inp.content||""}
                                  onChange={e=>setInputMap(prev=>({...prev,[news.id]:{...inp,content:e.target.value}}))}
                                  rows={2}
                                  style={{ flex:1, border:"1px solid #e5e7eb", borderRadius:6, padding:"6px 8px",
                                    fontSize:12, resize:"none", fontFamily:"inherit" }} />
                                <button onClick={()=>addAction(news.id)}
                                  style={{ padding:"0 16px", background:"#111", color:"#fff", border:"none",
                                    borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer", whiteSpace:"nowrap" }}>
                                  저장
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
          }
        </div>

        {/* 위험 키워드 패널 */}
        <div>
          <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:12, padding:16,
            position:"sticky", top:0, marginBottom:12 }}>
            <div style={{ fontSize:13, fontWeight:700, color:"#111", marginBottom:2 }}>위험 키워드</div>
            <div style={{ fontSize:11, color:"#6b7280", marginBottom:14 }}>{period} 내 2회 이상 반복 등장</div>
            {hotKeywords.length===0
              ? <div style={{ color:"#9ca3af", fontSize:12, textAlign:"center", padding:16 }}>반복 키워드 없음</div>
              : hotKeywords.map(([kw,cnt],i)=>(
                  <div key={kw} style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                    padding:"8px 12px", borderRadius:8, marginBottom:6,
                    background:i===0?"#fef9c3":i===1?"#fef2f2":"#f9fafb",
                    border:i<2?"1px solid #fde68a":"1px solid #f3f4f6" }}>
                    <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                      <span style={{ fontSize:13 }}>{i===0?"🔥":i===1?"⚠️":"•"}</span>
                      <span style={{ fontSize:13, fontWeight:i<2?700:500, color:"#111" }}>#{kw}</span>
                    </div>
                    <span style={{ fontSize:12, fontWeight:600, color:i===0?"#92400e":i===1?"#dc2626":"#6b7280" }}>{cnt}회</span>
                  </div>
                ))
            }
            <div style={{ marginTop:12, fontSize:11, color:"#9ca3af", borderTop:"1px solid #f3f4f6", paddingTop:10 }}>
              🔥 뉴스 카드의 노란 태그 = 반복 키워드
            </div>
          </div>

          {/* 조치 필요 요약 */}
          <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:12, padding:16 }}>
            <div style={{ fontSize:13, fontWeight:700, color:"#111", marginBottom:12 }}>조치 현황 요약</div>
            {(() => {
              const highNews = SAMPLE.news.filter(n=>n.grade>=4);
              const pending = highNews.filter(n=>!getLatestStatus(n.id)||(getLatestStatus(n.id)==="검토중"));
              const done = highNews.filter(n=>getLatestStatus(n.id)==="조치완료");
              const na = highNews.filter(n=>getLatestStatus(n.id)==="해당없음");
              return (
                <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                  {[
                    {label:"조치 필요", cnt:pending.length, bg:"#fef2f2", text:"#dc2626"},
                    {label:"조치완료", cnt:done.length, bg:"#f0fdf4", text:"#15803d"},
                    {label:"해당없음", cnt:na.length, bg:"#f3f4f6", text:"#6b7280"},
                  ].map(s=>(
                    <div key={s.label} style={{ display:"flex", justifyContent:"space-between",
                      padding:"6px 10px", borderRadius:8, background:s.bg }}>
                      <span style={{ fontSize:12, color:s.text, fontWeight:600 }}>{s.label}</span>
                      <span style={{ fontSize:14, fontWeight:800, color:s.text }}>{s.cnt}건</span>
                    </div>
                  ))}
                  <div style={{ fontSize:11, color:"#9ca3af", marginTop:4 }}>4~5등급 뉴스 기준</div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── ⑥ 수입식품 ───────────────────────────────────────────
function ImportScreen() {
  return (
    <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:12, padding:20 }}>
      <div style={{ fontSize:14, fontWeight:700, color:"#111", marginBottom:16 }}>국가별 부적합 건수 상위 (최근 30일)</div>
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {SAMPLE.importRisk.map((r,i)=>(
          <div key={i} style={{ display:"flex", gap:12, alignItems:"center" }}>
            <span style={{ width:60, fontWeight:600, fontSize:13, color:"#111" }}>{r.country}</span>
            <Tag color="#eff6ff" text="#1d4ed8">{r.foodType}</Tag>
            <Tag color="#fef9c3" text="#92400e">{r.item}</Tag>
            <div style={{ flex:1, background:"#f3f4f6", borderRadius:4, height:18 }}>
              <div style={{ width:`${(r.count/14)*100}%`, background:"#dc2626", height:18, borderRadius:4,
                display:"flex", alignItems:"center", paddingLeft:8 }}>
                <span style={{ fontSize:11, color:"#fff", fontWeight:600 }}>{r.count}건</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 메인 앱 ──────────────────────────────────────────────
const MENUS = [
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
const SCREEN_TITLE = {
  home:"④ 종합 현황", calendar:"① 기획검사 캘린더", lsafe:"② L.safe 현황 (부적합)",
  comparison:"③ 부적합률 비교 (내부 vs 식약처)", noncompliant:"⑤ 부적합·회수 현황",
  import:"⑥ 수입식품 리스크", news:"⑦ 뉴스 모니터링", report:"⑧ 알림 & 리포트"
};

export default function App() {
  const [screen, setScreen] = useState("home");
  const [noncompliant, setNoncompliant] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    supabase
      .from("noncompliant")
      .select("*")
      .order("date", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          setFetchError(error.message);
        } else {
          setNoncompliant(
            (data ?? []).map(r => ({
              id: r.id,
              date: r.date,
              foodType: r.food_type,
              product: r.product,
              vendor: r.vendor,
              item: r.item,
              standard: r.standard,
              result: r.result,
              recall: r.recall,
            }))
          );
        }
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ fontFamily:"'Pretendard','Apple SD Gothic Neo',sans-serif", minHeight:"100vh", background:"#f4f5f7", display:"flex" }}>
      <div style={{ width:200, background:"#111", flexShrink:0, display:"flex", flexDirection:"column", minHeight:"100vh" }}>
        <div style={{ padding:"20px 16px 16px", borderBottom:"1px solid #222" }}>
          <div style={{ fontSize:13, fontWeight:800, color:"#fff", lineHeight:1.3 }}>식품안전<br/>모니터링</div>
          <div style={{ fontSize:10, color:"#6b7280", marginTop:4 }}>외부 갱신: 오늘</div>
        </div>
        <nav style={{ flex:1, padding:"12px 0", overflowY:"auto" }}>
          {MENUS.map(group=>(
            <div key={group.group} style={{ marginBottom:4 }}>
              <div style={{ fontSize:10, fontWeight:700, color:"#4b5563", padding:"8px 16px 4px",
                letterSpacing:"0.06em", textTransform:"uppercase" }}>{group.group}</div>
              {group.items.map(item=>(
                <button key={item.key} onClick={()=>setScreen(item.key)} style={{
                  width:"100%", textAlign:"left", padding:"8px 16px",
                  background:screen===item.key?"#1f2937":"transparent",
                  color:screen===item.key?"#fff":"#9ca3af", border:"none", cursor:"pointer",
                  fontSize:12, fontWeight:screen===item.key?600:400,
                  borderLeft:screen===item.key?"3px solid #3b82f6":"3px solid transparent",
                  transition:"all 0.1s"
                }}>{item.label}</button>
              ))}
            </div>
          ))}
        </nav>
        <div style={{ padding:"12px 16px", borderTop:"1px solid #222", fontSize:11, color:"#4b5563" }}>내부 갱신: 2026-05-26</div>
      </div>

      <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0 }}>
        <div style={{ background:"#fff", borderBottom:"1px solid #e5e7eb", padding:"14px 28px",
          display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ fontSize:16, fontWeight:700, color:"#111" }}>{SCREEN_TITLE[screen]}</div>
          <div style={{ fontSize:12, color:"#9ca3af" }}>식품안전팀 · 2026-05-28</div>
        </div>
        <div style={{ flex:1, padding:24, overflowY:"auto" }}>
          {loading && (
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:200, color:"#6b7280", fontSize:14 }}>
              데이터 불러오는 중…
            </div>
          )}
          {fetchError && (
            <div style={{ background:"#fef2f2", border:"1px solid #fca5a5", borderRadius:8, padding:"12px 16px", marginBottom:16, fontSize:13, color:"#dc2626" }}>
              Supabase 연결 오류: {fetchError}
            </div>
          )}
          {!loading && screen==="home"&&<HomeScreen onNav={setScreen} noncompliant={noncompliant}/>}
          {!loading && screen==="calendar"&&<CalendarScreen/>}
          {!loading && screen==="lsafe"&&<LSafeScreen/>}
          {!loading && screen==="comparison"&&<ComparisonScreen/>}
          {!loading && screen==="noncompliant"&&<NoncompliantScreen noncompliant={noncompliant}/>}
          {screen==="import"&&<ImportScreen/>}
          {screen==="news"&&<NewsScreen/>}
          {screen==="report"&&(
            <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:12, padding:32,
              textAlign:"center", color:"#9ca3af" }}>알림 & 리포트 화면은 2단계 구현 예정입니다.</div>
          )}
        </div>
      </div>
    </div>
  );
}
