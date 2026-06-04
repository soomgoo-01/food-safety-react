import { useState } from "react";
import { STATUS_COLOR } from "../constants.js";

export default function CalendarScreen({ planned, planHistory, planFailDetail }) {
  const [selected, setSelected] = useState(null);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 16 }}>
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#111", marginBottom: 16 }}>2026년 기획검사 일정</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {planned.map(p => (
            <div key={p.id} onClick={() => setSelected(selected?.id === p.id ? null : p)}
              style={{
                border: selected?.id === p.id ? "2px solid #111" : "1px solid #e5e7eb",
                borderRadius: 10, padding: "14px 18px", cursor: "pointer",
                background: selected?.id === p.id ? "#f9fafb" : "#fff", transition: "border-color 0.15s",
              }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#111", marginBottom: 4 }}>{p.title}</div>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>예정완료일 {p.expectedEnd}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{
                    display: "inline-block", padding: "3px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                    background: STATUS_COLOR[p.status] + "22", color: STATUS_COLOR[p.status],
                  }}>{p.status}</div>
                  {p.status === "완료" && (
                    <div style={{ fontSize: 13, marginTop: 6, fontWeight: 700, color: p.fail > 0 ? "#dc2626" : "#16a34a" }}>
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
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#111", marginBottom: 16 }}>{selected.title} — 연도별 비교</div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, marginBottom: 20 }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                  {["연도", "전체", "부적합", "부적합률"].map(h => (
                    <th key={h} style={{ padding: "6px 8px", textAlign: h === "연도" ? "left" : "center", color: "#6b7280", fontWeight: 600, fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(planHistory[selected.id] || []).map((h, i, arr) => {
                  const avg3 = arr.reduce((s, r) => s + (r.total > 0 ? r.fail / r.total : 0), 0) / arr.length * 100;
                  const rate = h.total > 0 ? ((h.fail / h.total) * 100).toFixed(1) : "—";
                  const isCur = h.year === 2026;
                  const warn = h.total > 0 && parseFloat(rate) > avg3 * 1.2;
                  return (
                    <tr key={h.year} style={{ borderBottom: "1px solid #f3f4f6", background: isCur ? "#f9fafb" : "#fff" }}>
                      <td style={{ padding: "8px", fontWeight: isCur ? 700 : 400, color: "#111" }}>{h.year}{isCur ? " ← 현재" : ""}</td>
                      <td style={{ padding: "8px", textAlign: "center", color: "#374151" }}>{h.total || "—"}</td>
                      <td style={{ padding: "8px", textAlign: "center", color: h.fail > 0 ? "#dc2626" : "#16a34a", fontWeight: 600 }}>{h.total > 0 ? h.fail : "—"}</td>
                      <td style={{ padding: "8px", textAlign: "center", color: warn ? "#dc2626" : "#374151", fontWeight: 600 }}>
                        {rate}{rate !== "—" ? "%" : ""}{warn ? " ⚠" : ""}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {planFailDetail[selected.id] ? (
              <>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>부적합 내역</div>
                {planFailDetail[selected.id].map((d, i) => (
                  <div key={i} style={{ background: "#fef2f2", borderRadius: 8, padding: "10px 14px", borderLeft: "3px solid #dc2626", marginBottom: 6 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: "#111", marginBottom: 4 }}>{d.product}</div>
                    <div style={{ fontSize: 12, color: "#374151" }}>{d.item} · 검출 {d.detected} (기준 {d.standard})</div>
                    <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>조치: {d.measure}</div>
                  </div>
                ))}
              </>
            ) : selected.status === "완료" ? (
              <div style={{ background: "#f0fdf4", borderRadius: 8, padding: 14, textAlign: "center", fontSize: 13, color: "#16a34a" }}>
                이번 검사에서 부적합 없음
              </div>
            ) : (
              <div style={{ background: "#f9fafb", borderRadius: 8, padding: 14, textAlign: "center", fontSize: 13, color: "#9ca3af" }}>
                검사 진행 중 또는 예정
              </div>
            )}
          </div>
        ) : (
          <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 12, padding: 32, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>
            좌측 검사 항목을 클릭하면<br />연도별 결과 비교가 표시됩니다
          </div>
        )}
      </div>
    </div>
  );
}
