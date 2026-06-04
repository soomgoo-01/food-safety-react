import { useState } from "react";
import Btn from "./Btn.jsx";
import Tag from "./Tag.jsx";

const foodKeys = ["유지류", "냉동식품", "수산물", "음료류", "과자류"];

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

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 24 }}>
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 20, cursor: "pointer" }}
          onClick={() => onNav("noncompliant")}>
          <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 600, marginBottom: 4 }}>오늘 부적합 · 진행 중 회수</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 32, fontWeight: 800, color: allActive.length > 0 ? "#ea580c" : "#111" }}>
              {todayFails.length + recallActive.length}
            </span>
            <span style={{ fontSize: 13, color: "#6b7280" }}>건</span>
            <span style={{ fontSize: 12, color: "#9ca3af" }}>부적합 {todayFails.length} · 회수 {recallActive.length}</span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {typeEntries.map(([type, cnt]) => (
              <Tag key={type} color="#fef3c7" text="#92400e">{type} {cnt}건</Tag>
            ))}
          </div>
        </div>

        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 20, cursor: "pointer" }}
          onClick={() => onNav("news")}>
          <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 600, marginBottom: 4 }}>이번주 주의 기사</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 32, fontWeight: 800, color: highNews.length >= 1 ? "#ea580c" : "#111" }}>{highNews.length}</span>
            <span style={{ fontSize: 13, color: "#6b7280" }}>건 (3등급 이상)</span>
          </div>
          {topNews && (
            <div style={{ fontSize: 12, color: "#374151", background: "#fef2f2", borderRadius: 8, padding: "6px 10px", borderLeft: "3px solid #dc2626", lineHeight: 1.4 }}>{topNews.title}</div>
          )}
        </div>

        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 20, cursor: "pointer" }}
          onClick={() => onNav("comparison")}>
          <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 600, marginBottom: 8 }}>내부 vs 식약처 부적합률 (올해 누적)</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[{ label: "내부", rate: internal.rate, prev: internal.prev, hi: internal.rate > mfds.rate },
              { label: "식약처", rate: mfds.rate, prev: mfds.prev, hi: false }].map(c => (
              <div key={c.label}>
                <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 2 }}>{c.label}</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: c.hi ? "#dc2626" : "#374151" }}>{c.rate}%</div>
                <div style={{ fontSize: 11, color: "#9ca3af" }}>전년 {c.prev}%</div>
              </div>
            ))}
          </div>
          {internal.rate > mfds.rate && <div style={{ marginTop: 8, fontSize: 11, color: "#dc2626", background: "#fef2f2", borderRadius: 6, padding: "4px 8px" }}>⚠ 내부가 식약처보다 높음</div>}
        </div>
      </div>

      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 20, marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>식품유형별 부적합 건수 비교</div>
          <div style={{ display: "flex", gap: 6 }}>
            {["월별", "분기별", "3개년평균"].map(tab => (
              <Btn key={tab} active={trendTab === tab} onClick={() => setTrendTab(tab)}>{tab}</Btn>
            ))}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12 }}>
          {trendRows.length > 0 && foodKeys.map(food => {
            const [r1, r2] = trendRows; const v1 = r1.data[food] || 0, v2 = r2.data[food] || 0; const hi = v2 > v1;
            return (
              <div key={food} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8, fontWeight: 600 }}>{food}</div>
                <div style={{ display: "flex", gap: 4, justifyContent: "center", alignItems: "flex-end", height: 80 }}>
                  {[{ v: v1, c: "#d1d5db" }, { v: v2, c: hi ? "#dc2626" : "#2563eb" }].map((b, i) => (
                    <div key={i} style={{ width: 24, borderRadius: "4px 4px 0 0", height: `${Math.max((b.v / maxTrend) * 76, 4)}px`, background: b.c, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
                      <span style={{ fontSize: 10, color: i === 0 ? "#6b7280" : "#fff", paddingBottom: 2 }}>{b.v}</span>
                    </div>
                  ))}
                </div>
                {hi && <div style={{ fontSize: 10, color: "#dc2626", marginTop: 4 }}>↑ 증가</div>}
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 12, fontSize: 11, color: "#6b7280" }}>
          {trendRows.length > 1 && [{ c: "#d1d5db", l: trendRows[0].label }, { c: "#2563eb", l: trendRows[1].label }, { c: "#dc2626", l: "증가 항목" }].map(l => (
            <span key={l.l}><span style={{ display: "inline-block", width: 10, height: 10, background: l.c, borderRadius: 2, marginRight: 4 }}></span>{l.l}</span>
          ))}
        </div>
      </div>

      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#111", marginBottom: 14 }}>최신 부적합·회수 목록</div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
              {["날짜", "식품유형", "제품명", "업체명", "위반항목", "회수"].map(h => (
                <th key={h} style={{ padding: "6px 8px", textAlign: "left", color: "#6b7280", fontWeight: 600, fontSize: 12 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {noncompliant.slice(0, 6).map(row => (
              <tr key={row.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ padding: "8px", color: "#6b7280", fontSize: 12 }}>{row.date}</td>
                <td style={{ padding: "8px" }}><Tag color="#eff6ff" text="#1d4ed8">{row.foodType}</Tag></td>
                <td style={{ padding: "8px", fontWeight: 500, color: "#111" }}>{row.product}</td>
                <td style={{ padding: "8px", color: "#374151" }}>{row.vendor}</td>
                <td style={{ padding: "8px", color: "#dc2626", fontWeight: 600 }}>{row.item}</td>
                <td style={{ padding: "8px" }}>{row.recall ? <Tag color="#fef2f2" text="#dc2626">회수</Tag> : <Tag color="#f9fafb" text="#9ca3af">없음</Tag>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
