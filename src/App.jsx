import { useState, useEffect } from "react";
import { supabase } from "./supabase.js";
import { MENUS, SCREEN_TITLE } from "./constants.js";
import CalendarScreen from "./components/CalendarScreen.jsx";
import LSafeScreen from "./components/LSafeScreen.jsx";
import ComparisonScreen from "./components/ComparisonScreen.jsx";
import HomeScreen from "./components/HomeScreen.jsx";
import NoncompliantScreen from "./components/NoncompliantScreen.jsx";
import ImportScreen from "./components/ImportScreen.jsx";
import NewsScreen from "./components/NewsScreen.jsx";
import VocScreen from "./components/VocScreen.jsx";

export default function App() {
  const [screen, setScreen] = useState("home");
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [noncompliant, setNoncompliant] = useState([]);
  const [lsafeFail, setLsafeFail] = useState([]);
  const [lsafeAll, setLsafeAll] = useState([]);
  const [planned, setPlanned] = useState([]);
  const [planHistory, setPlanHistory] = useState({});
  const [planFailDetail, setPlanFailDetail] = useState({});
  const [news, setNews] = useState([]);
  const [importRisk, setImportRisk] = useState([]);
  const [comparison, setComparison] = useState({
    internal: { rate: 0, prev: 0, total: 0, fail: 0 },
    mfds: { rate: 0, prev: 0, total: 0, fail: 0 },
    byType: [],
  });
  const [trendData, setTrendData] = useState({});

  useEffect(() => {
    Promise.all([
      supabase.from("noncompliant").select("*").order("date", { ascending: false }),
      supabase.from("lsafe_fail").select("*").order("date", { ascending: false }),
      supabase.from("lsafe_all").select("*").order("date", { ascending: false }),
      supabase.from("planned").select("*").order("id"),
      supabase.from("plan_history").select("*").order("plan_id").order("year"),
      supabase.from("plan_fail_detail").select("*").order("plan_id"),
      supabase.from("news").select("*").order("date", { ascending: false }),
      supabase.from("import_risk").select("*").order("count", { ascending: false }),
      supabase.from("comparison_summary").select("*"),
      supabase.from("comparison_by_type").select("*"),
      supabase.from("trend_data").select("*").order("id"),
    ]).then(([nc, lf, la, pl, ph, pfd, nw, ir, cs, cbt, td]) => {
      const firstError = [nc, lf, la, pl, ph, pfd, nw, ir, cs, cbt, td].find(r => r.error);
      if (firstError) {
        setFetchError(firstError.error.message);
      } else {
        setNoncompliant((nc.data ?? []).map(r => ({
          id: r.id, date: r.date, foodType: r.food_type,
          product: r.product, vendor: r.vendor, item: r.item,
          standard: r.standard, result: r.result, recall: r.recall,
        })));
        setLsafeFail((lf.data ?? []).map(r => ({
          id: r.id, product: r.product, foodType: r.food_type,
          item: r.item, detected: r.detected, standard: r.standard,
          date: r.date, measure: r.measure,
        })));
        setLsafeAll((la.data ?? []).map(r => ({
          product: r.product, item: r.item, detected: r.detected,
          standard: r.standard, result: r.result, date: r.date, measure: r.measure,
        })));
        setPlanned((pl.data ?? []).map(r => ({
          id: r.id, title: r.title, date: r.date,
          expectedEnd: r.expected_end, status: r.status,
          total: r.total, fail: r.fail,
        })));
        const phObj = {};
        (ph.data ?? []).forEach(r => {
          if (!phObj[r.plan_id]) phObj[r.plan_id] = [];
          phObj[r.plan_id].push({ year: r.year, total: r.total, fail: r.fail });
        });
        setPlanHistory(phObj);
        const pfdObj = {};
        (pfd.data ?? []).forEach(r => {
          if (!pfdObj[r.plan_id]) pfdObj[r.plan_id] = [];
          pfdObj[r.plan_id].push({ product: r.product, item: r.item, detected: r.detected, standard: r.standard, measure: r.measure });
        });
        setPlanFailDetail(pfdObj);
        setNews((nw.data ?? []).map(r => ({
          id: r.id, grade: r.grade, title: r.title,
          keyword: r.keyword, foodType: r.food_type, date: r.date,
        })));
        setImportRisk((ir.data ?? []).map(r => ({
          country: r.country, foodType: r.food_type, item: r.item, count: r.count,
        })));
        const csData = cs.data ?? [];
        const internalRow = csData.find(r => r.source === "internal") ?? { rate: 0, prev: 0, total: 0, fail: 0 };
        const mfdsRow = csData.find(r => r.source === "mfds") ?? { rate: 0, prev: 0, total: 0, fail: 0 };
        setComparison({
          internal: { rate: Number(internalRow.rate), prev: Number(internalRow.prev), total: internalRow.total, fail: internalRow.fail },
          mfds: { rate: Number(mfdsRow.rate), prev: Number(mfdsRow.prev), total: mfdsRow.total, fail: mfdsRow.fail },
          byType: (cbt.data ?? []).map(r => ({ type: r.type, internal: Number(r.internal_rate), mfds: Number(r.mfds_rate) })),
        });
        const tdObj = {};
        (td.data ?? []).forEach(r => {
          if (!tdObj[r.period]) tdObj[r.period] = [];
          tdObj[r.period].push({
            label: r.label,
            data: { 유지류: r.oily, 냉동식품: r.frozen, 수산물: r.seafood, 음료류: r.beverage, 과자류: r.snack },
          });
        });
        setTrendData(tdObj);
      }
      setLoading(false);
    });
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-page)", display: "flex" }}>
      {/* ── 사이드바 ── */}
      <aside style={{
        width: 220, flexShrink: 0, background: "var(--bg-card)",
        borderRight: "1px solid var(--border)", display: "flex",
        flexDirection: "column", minHeight: "100vh",
      }}>
        {/* 로고 */}
        <div style={{ padding: "20px 16px 16px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: "var(--primary-500)", display: "flex",
              alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1L9.5 5.5H12.5L10 8.5L11 13L7 10.5L3 13L4 8.5L1.5 5.5H4.5L7 1Z" fill="white" fillOpacity="0.9"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--fg1)", lineHeight: 1.2 }}>식품안전</div>
              <div style={{ fontSize: 11, color: "var(--fg3)", lineHeight: 1.2 }}>모니터링</div>
            </div>
          </div>
        </div>

        {/* 네비게이션 */}
        <nav style={{ flex: 1, padding: "12px 10px", overflowY: "auto" }}>
          {MENUS.map(group => (
            <div key={group.group} style={{ marginBottom: 16 }}>
              <div style={{
                fontSize: 10, fontWeight: 700, color: "var(--fg3)",
                padding: "0 6px 6px", letterSpacing: "0.06em", textTransform: "uppercase",
              }}>{group.group}</div>
              {group.items.map(item => {
                const isActive = screen === item.key;
                return (
                  <button key={item.key} onClick={() => setScreen(item.key)} style={{
                    width: "100%", textAlign: "left", padding: "8px 10px",
                    background: isActive ? "var(--primary-50)" : "transparent",
                    color: isActive ? "var(--primary-700)" : "var(--fg2)",
                    border: "none", borderRadius: "var(--radius-md)", cursor: "pointer",
                    fontSize: 13, fontWeight: isActive ? 600 : 400,
                    display: "block", marginBottom: 2, transition: "all 0.1s",
                  }}>{item.label}</button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* 하단 갱신 정보 */}
        <div style={{
          padding: "12px 16px", borderTop: "1px solid var(--border)",
          fontSize: 11, color: "var(--fg3)",
        }}>내부 갱신: 2026-05-26</div>
      </aside>

      {/* ── 메인 영역 ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* 헤더 */}
        <header style={{
          background: "var(--bg-card)", borderBottom: "1px solid var(--border)",
          padding: "0 28px", height: 52, display: "flex",
          justifyContent: "space-between", alignItems: "center", flexShrink: 0,
        }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: "var(--fg1)" }}>{SCREEN_TITLE[screen]}</div>
          <div style={{ fontSize: 12, color: "var(--fg3)" }}>식품안전팀 · 2026-05-28</div>
        </header>

        {/* 콘텐츠 */}
        <main style={{
          flex: 1, overflowY: screen === "voc" ? "hidden" : "auto",
          padding: screen === "voc" ? 0 : 24,
          display: "flex", flexDirection: "column", position: "relative",
        }}>
          {screen !== "voc" && loading && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, color: "var(--fg3)", fontSize: 14 }}>
              데이터 불러오는 중…
            </div>
          )}
          {screen !== "voc" && fetchError && (
            <div style={{ background: "var(--color-error-bg)", border: "1px solid var(--red-200)", borderRadius: "var(--radius-md)", padding: "12px 16px", marginBottom: 16, fontSize: 13, color: "var(--color-error-text)" }}>
              Supabase 연결 오류: {fetchError}
            </div>
          )}
          {!loading && screen === "home" && <HomeScreen onNav={setScreen} noncompliant={noncompliant} news={news} comparison={comparison} trendData={trendData} />}
          {!loading && screen === "calendar" && <CalendarScreen planned={planned} planHistory={planHistory} planFailDetail={planFailDetail} />}
          {!loading && screen === "lsafe" && <LSafeScreen lsafeFail={lsafeFail} lsafeAll={lsafeAll} />}
          {!loading && screen === "comparison" && <ComparisonScreen comparison={comparison} />}
          {!loading && screen === "noncompliant" && <NoncompliantScreen noncompliant={noncompliant} />}
          {!loading && screen === "import" && <ImportScreen importRisk={importRisk} />}
          {!loading && screen === "news" && <NewsScreen news={news} />}
          {screen === "report" && (
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 32, textAlign: "center", color: "var(--fg3)" }}>
              알림 &amp; 리포트 화면은 2단계 구현 예정입니다.
            </div>
          )}
          {screen === "voc" && <VocScreen />}
        </main>
      </div>
    </div>
  );
}
