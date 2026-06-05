import { useState } from "react";
import Btn from "./Btn.jsx";
import Tag from "./Tag.jsx";

const foodKeys = ["유지류", "냉동식품", "수산물", "음료류", "과자류"];

const card = {
  background: "var(--bg-card)", border: "1px solid var(--border)",
  borderRadius: "var(--radius-lg)", padding: 20,
};

export default function HomeScreen({ onNav, noncompliant, news, comparison, trendData }) {
  const [trendTab, setTrendTab] = useState("월별");
  const todayFails = noncompliant.filter(d => d.date === "2026-05-28");
  const recallActive = noncompliant.filter(d => d.recall && d.date !== "2026-05-28");
  const allActive = [...todayFails, ...recallActive];
  const byType = {};
  allActive.forEach(d => { byType[d.foodType] = (byType[d.foodType] || 0) + 1; });
  const typeEntries = Object.entries(byType).sort((a, b) => b[1] - a[1]);
  const highNews = news.filter(n => n.grade >= 3 && (new Date("2026-05-28") - new Date(n.date)) / 86400000 <= 7);
  const topNews = highNews.find(n => n.grade >= 4);
  const { internal, mfds } = comparison;
  const trendRows = trendData[trendTab] ?? [];
  const maxTrend = trendRows.length > 0 ? Math.max(...trendRows.flatMap(r => foodKeys.map(k => r.data[k] || 0))) : 1;
  const hasAlert = allActive.length > 0;
  const rateHi = internal.rate > mfds.rate;

  return (
    <div>
      {/* KPI 카드 3개 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 20 }}>

        {/* 부적합·회수 */}
        <div style={{ ...card, cursor: "pointer", borderColor: hasAlert ? "var(--color-warning)" : "var(--border)" }}
          onClick={() => onNav("noncompliant")}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--fg3)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>오늘 부적합 · 진행 중 회수</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 10 }}>
            <span style={{ fontSize: 36, fontWeight: 700, color: hasAlert ? "var(--color-warning)" : "var(--fg1)", fontVariantNumeric: "tabular-nums" }}>
              {todayFails.length + recallActive.length}
            </span>
            <span style={{ fontSize: 13, color: "var(--fg3)" }}>건</span>
            <span style={{ fontSize: 11, color: "var(--fg3)" }}>부적합 {todayFails.length} · 회수 {recallActive.length}</span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {typeEntries.map(([type, cnt]) => (
              <Tag key={type} color="var(--color-warning-bg)" text="var(--color-warning-text)">{type} {cnt}건</Tag>
            ))}
            {typeEntries.length === 0 && <span style={{ fontSize: 12, color: "var(--fg3)" }}>이상 없음</span>}
          </div>
        </div>

        {/* 이번주 주의 기사 */}
        <div style={{ ...card, cursor: "pointer" }} onClick={() => onNav("news")}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--fg3)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>이번주 주의 기사</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 10 }}>
            <span style={{ fontSize: 36, fontWeight: 700, color: highNews.length >= 1 ? "var(--color-warning)" : "var(--fg1)", fontVariantNumeric: "tabular-nums" }}>{highNews.length}</span>
            <span style={{ fontSize: 13, color: "var(--fg3)" }}>건 (3등급 이상)</span>
          </div>
          {topNews ? (
            <div style={{ fontSize: 12, color: "var(--fg2)", background: "var(--color-error-bg)", borderRadius: "var(--radius-sm)", padding: "6px 10px", borderLeft: "3px solid var(--color-error)", lineHeight: 1.5 }}>{topNews.title}</div>
          ) : (
            <span style={{ fontSize: 12, color: "var(--fg3)" }}>이번 주 4등급 이상 없음</span>
          )}
        </div>

        {/* 부적합률 비교 */}
        <div style={{ ...card, cursor: "pointer", borderColor: rateHi ? "var(--color-warning)" : "var(--border)" }}
          onClick={() => onNav("comparison")}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--fg3)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>내부 vs 식약처 부적합률</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              { label: "내부", rate: internal.rate, prev: internal.prev, hi: rateHi },
              { label: "식약처", rate: mfds.rate, prev: mfds.prev, hi: false },
            ].map(c => (
              <div key={c.label}>
                <div style={{ fontSize: 11, color: "var(--fg3)", marginBottom: 2 }}>{c.label}</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: c.hi ? "var(--color-error)" : "var(--fg1)", fontVariantNumeric: "tabular-nums" }}>{c.rate}<span style={{ fontSize: 14, fontWeight: 500 }}>%</span></div>
                <div style={{ fontSize: 11, color: "var(--fg3)" }}>전년 {c.prev}%</div>
              </div>
            ))}
          </div>
          {rateHi && (
            <div style={{ marginTop: 10, fontSize: 11, color: "var(--color-error-text)", background: "var(--color-error-bg)", borderRadius: "var(--radius-sm)", padding: "4px 8px" }}>
              ⚠ 내부 부적합률이 식약처보다 높음
            </div>
          )}
        </div>
      </div>

      {/* 트렌드 차트 */}
      <div style={{ ...card, marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--fg1)" }}>식품유형별 부적합 건수 비교</div>
          <div style={{ display: "flex", gap: 6 }}>
            {["월별", "분기별", "3개년평균"].map(tab => (
              <Btn key={tab} active={trendTab === tab} onClick={() => setTrendTab(tab)}>{tab}</Btn>
            ))}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12 }}>
          {trendRows.length > 0 && foodKeys.map(food => {
            const [r1, r2] = trendRows;
            const v1 = r1.data[food] || 0, v2 = r2.data[food] || 0;
            const hi = v2 > v1;
            return (
              <div key={food} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 12, color: "var(--fg2)", marginBottom: 8, fontWeight: 600 }}>{food}</div>
                <div style={{ display: "flex", gap: 4, justifyContent: "center", alignItems: "flex-end", height: 80 }}>
                  {[{ v: v1, c: "var(--gray-300)" }, { v: v2, c: hi ? "var(--color-error)" : "var(--primary-500)" }].map((b, i) => (
                    <div key={i} style={{
                      width: 24, borderRadius: "4px 4px 0 0",
                      height: `${Math.max((b.v / maxTrend) * 76, 4)}px`,
                      background: b.c, display: "flex", alignItems: "flex-end", justifyContent: "center",
                    }}>
                      <span style={{ fontSize: 10, color: i === 0 ? "var(--fg3)" : "#fff", paddingBottom: 2 }}>{b.v}</span>
                    </div>
                  ))}
                </div>
                {hi && <div style={{ fontSize: 10, color: "var(--color-error)", marginTop: 4 }}>↑ 증가</div>}
              </div>
            );
          })}
        </div>
        {trendRows.length > 1 && (
          <div style={{ display: "flex", gap: 16, marginTop: 14, fontSize: 11, color: "var(--fg3)" }}>
            {[
              { c: "var(--gray-300)", l: trendRows[0].label },
              { c: "var(--primary-500)", l: trendRows[1].label },
              { c: "var(--color-error)", l: "증가 항목" },
            ].map(l => (
              <span key={l.l} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ display: "inline-block", width: 10, height: 10, background: l.c, borderRadius: 2 }} />
                {l.l}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 최신 부적합 목록 */}
      <div style={card}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--fg1)", marginBottom: 14 }}>최신 부적합·회수 목록</div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {["날짜", "식품유형", "제품명", "업체명", "위반항목", "회수"].map(h => (
                <th key={h} style={{ padding: "6px 8px", textAlign: "left", color: "var(--fg3)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {noncompliant.slice(0, 6).map(row => (
              <tr key={row.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "10px 8px", color: "var(--fg3)", fontSize: 12 }}>{row.date}</td>
                <td style={{ padding: "10px 8px" }}><Tag color="var(--color-info-bg)" text="var(--color-info-text)">{row.foodType}</Tag></td>
                <td style={{ padding: "10px 8px", fontWeight: 500, color: "var(--fg1)" }}>{row.product}</td>
                <td style={{ padding: "10px 8px", color: "var(--fg2)" }}>{row.vendor}</td>
                <td style={{ padding: "10px 8px", color: "var(--color-error)", fontWeight: 600 }}>{row.item}</td>
                <td style={{ padding: "10px 8px" }}>
                  {row.recall
                    ? <Tag color="var(--color-error-bg)" text="var(--color-error-text)">회수</Tag>
                    : <Tag color="var(--gray-100)" text="var(--fg3)">없음</Tag>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
