import { useState } from "react";

const STATUS = {
  예정:   { bg: "var(--gray-100)",         text: "var(--gray-700)" },
  진행중: { bg: "var(--color-info-bg)",    text: "var(--color-info-text)" },
  완료:   { bg: "var(--color-success-bg)", text: "var(--color-success-text)" },
};

const card = {
  background: "var(--bg-card)", border: "1px solid var(--border)",
  borderRadius: "var(--radius-lg)", padding: 20,
};

export default function CalendarScreen({ planned, planHistory, planFailDetail }) {
  const [selected, setSelected] = useState(null);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 16 }}>
      {/* 검사 목록 */}
      <div style={card}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--fg1)", marginBottom: 16 }}>2026년 기획검사 일정</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {planned.map(p => {
            const isActive = selected?.id === p.id;
            return (
              <div key={p.id} onClick={() => setSelected(isActive ? null : p)}
                style={{
                  border: isActive ? "1.5px solid var(--primary-500)" : "1px solid var(--border)",
                  borderRadius: "var(--radius-md)", padding: "14px 16px", cursor: "pointer",
                  background: isActive ? "var(--primary-50)" : "var(--bg-card)",
                  transition: "all 0.12s",
                }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: "var(--fg1)", marginBottom: 3 }}>{p.title}</div>
                    <div style={{ fontSize: 12, color: "var(--fg3)" }}>예정완료일 {p.expectedEnd}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{
                      display: "inline-block", padding: "3px 10px",
                      borderRadius: "var(--radius-pill)", fontSize: 12, fontWeight: 600,
                      background: STATUS[p.status]?.bg, color: STATUS[p.status]?.text,
                    }}>{p.status}</span>
                    {p.status === "완료" && (
                      <div style={{ fontSize: 13, marginTop: 6, fontWeight: 700, color: p.fail > 0 ? "var(--color-error)" : "var(--color-success)" }}>
                        부적합 {p.fail}건 / 전체 {p.total}건
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 상세 패널 */}
      <div>
        {selected ? (
          <div style={card}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--fg1)", marginBottom: 16 }}>{selected.title} — 연도별 비교</div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, marginBottom: 20 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["연도", "전체", "부적합", "부적합률"].map(h => (
                    <th key={h} style={{ padding: "6px 8px", textAlign: h === "연도" ? "left" : "center", color: "var(--fg3)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
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
                    <tr key={h.year} style={{ borderBottom: "1px solid var(--border)", background: isCur ? "var(--primary-50)" : "transparent" }}>
                      <td style={{ padding: "9px 8px", fontWeight: isCur ? 700 : 400, color: isCur ? "var(--primary-700)" : "var(--fg1)" }}>
                        {h.year}{isCur ? " ← 현재" : ""}
                      </td>
                      <td style={{ padding: "9px 8px", textAlign: "center", color: "var(--fg2)" }}>{h.total || "—"}</td>
                      <td style={{ padding: "9px 8px", textAlign: "center", color: h.fail > 0 ? "var(--color-error)" : "var(--color-success)", fontWeight: 600 }}>
                        {h.total > 0 ? h.fail : "—"}
                      </td>
                      <td style={{ padding: "9px 8px", textAlign: "center", color: warn ? "var(--color-error)" : "var(--fg1)", fontWeight: 600 }}>
                        {rate}{rate !== "—" ? "%" : ""}{warn ? " ⚠" : ""}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {planFailDetail[selected.id] ? (
              <>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--fg3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>부적합 내역</div>
                {planFailDetail[selected.id].map((d, i) => (
                  <div key={i} style={{ background: "var(--color-error-bg)", borderRadius: "var(--radius-md)", padding: "10px 14px", borderLeft: "3px solid var(--color-error)", marginBottom: 6 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: "var(--fg1)", marginBottom: 4 }}>{d.product}</div>
                    <div style={{ fontSize: 12, color: "var(--fg2)" }}>{d.item} · 검출 {d.detected} (기준 {d.standard})</div>
                    <div style={{ fontSize: 12, color: "var(--fg3)", marginTop: 4 }}>조치: {d.measure}</div>
                  </div>
                ))}
              </>
            ) : selected.status === "완료" ? (
              <div style={{ background: "var(--color-success-bg)", borderRadius: "var(--radius-md)", padding: 14, textAlign: "center", fontSize: 13, color: "var(--color-success-text)" }}>
                이번 검사에서 부적합 없음
              </div>
            ) : (
              <div style={{ background: "var(--gray-50)", borderRadius: "var(--radius-md)", padding: 14, textAlign: "center", fontSize: 13, color: "var(--fg3)" }}>
                검사 진행 중 또는 예정
              </div>
            )}
          </div>
        ) : (
          <div style={{ ...card, padding: 32, textAlign: "center", color: "var(--fg3)", fontSize: 13 }}>
            좌측 검사 항목을 클릭하면<br />연도별 결과 비교가 표시됩니다
          </div>
        )}
      </div>
    </div>
  );
}
