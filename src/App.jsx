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
    <div style={{ fontFamily: "'Pretendard','Apple SD Gothic Neo',sans-serif", minHeight: "100vh", background: "#f4f5f7", display: "flex" }}>
      <div style={{ width: 200, background: "#111", flexShrink: 0, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <div style={{ padding: "20px 16px 16px", borderBottom: "1px solid #222" }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", lineHeight: 1.3 }}>식품안전<br />모니터링</div>
          <div style={{ fontSize: 10, color: "#6b7280", marginTop: 4 }}>외부 갱신: 오늘</div>
        </div>
        <nav style={{ flex: 1, padding: "12px 0", overflowY: "auto" }}>
          {MENUS.map(group => (
            <div key={group.group} style={{ marginBottom: 4 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#4b5563", padding: "8px 16px 4px", letterSpacing: "0.06em", textTransform: "uppercase" }}>{group.group}</div>
              {group.items.map(item => (
                <button key={item.key} onClick={() => setScreen(item.key)} style={{
                  width: "100%", textAlign: "left", padding: "8px 16px",
                  background: screen === item.key ? "#1f2937" : "transparent",
                  color: screen === item.key ? "#fff" : "#9ca3af", border: "none", cursor: "pointer",
                  fontSize: 12, fontWeight: screen === item.key ? 600 : 400,
                  borderLeft: screen === item.key ? "3px solid #3b82f6" : "3px solid transparent",
                  transition: "all 0.1s",
                }}>{item.label}</button>
              ))}
            </div>
          ))}
        </nav>
        <div style={{ padding: "12px 16px", borderTop: "1px solid #222", fontSize: 11, color: "#4b5563" }}>내부 갱신: 2026-05-26</div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "14px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#111" }}>{SCREEN_TITLE[screen]}</div>
          <div style={{ fontSize: 12, color: "#9ca3af" }}>식품안전팀 · 2026-05-28</div>
        </div>
        <div style={{ flex: 1, padding: 24, overflowY: "auto" }}>
          {loading && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, color: "#6b7280", fontSize: 14 }}>
              데이터 불러오는 중…
            </div>
          )}
          {fetchError && (
            <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 8, padding: "12px 16px", marginBottom: 16, fontSize: 13, color: "#dc2626" }}>
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
            <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 32, textAlign: "center", color: "#9ca3af" }}>알림 & 리포트 화면은 2단계 구현 예정입니다.</div>
          )}
        </div>
      </div>
    </div>
  );
}
