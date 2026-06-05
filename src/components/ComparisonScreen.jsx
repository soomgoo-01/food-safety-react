import { useState } from "react";
import Modal from "./Modal.jsx";

const drillData = {
  유지류: [{ item: "산가", internal: 4, mfds: 2 }, { item: "벤조피렌", internal: 2, mfds: 1 }, { item: "과산화물가", internal: 1, mfds: 0 }],
  수산물: [{ item: "히스타민", internal: 3, mfds: 2 }, { item: "납", internal: 2, mfds: 1 }, { item: "카드뮴", internal: 1, mfds: 1 }],
  냉동식품: [{ item: "대장균군", internal: 2, mfds: 3 }, { item: "세균수", internal: 1, mfds: 1 }],
  음료류: [{ item: "보존료", internal: 1, mfds: 1 }, { item: "산도", internal: 1, mfds: 2 }],
  과자류: [{ item: "타르색소", internal: 1, mfds: 1 }],
};

const card = {
  background: "var(--bg-card)", border: "1px solid var(--border)",
  borderRadius: "var(--radius-lg)", padding: 24,
};

export default function ComparisonScreen({ comparison }) {
  const [drillModal, setDrillModal] = useState(null);
  const { internal, mfds, byType } = comparison;

  return (
    <div>
      {/* KPI 2개 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
        {[
          { label: "내부 부적합률", sub: "기획검사 + L.safe", rate: internal.rate, prev: internal.prev, total: internal.total, fail: internal.fail, hi: internal.rate > mfds.rate },
          { label: "식약처 부적합률", sub: "수거검사 계획실적", rate: mfds.rate, prev: mfds.prev, total: mfds.total, fail: mfds.fail, hi: false },
        ].map(c => (
          <div key={c.label} style={{ ...card, borderColor: c.hi ? "var(--color-warning)" : "var(--border)" }}>
            <div style={{ fontSize: 12, color: "var(--fg3)", marginBottom: 2 }}>{c.label}</div>
            <div style={{ fontSize: 11, color: "var(--fg3)", marginBottom: 16 }}>{c.sub}</div>
            <div style={{ display: "flex", gap: 24, alignItems: "flex-end" }}>
              <div>
                <div style={{ fontSize: 11, color: "var(--fg3)", marginBottom: 4 }}>올해 누적</div>
                <div style={{ fontSize: 40, fontWeight: 700, color: c.hi ? "var(--color-error)" : "var(--fg1)", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
                  {c.rate}<span style={{ fontSize: 18, fontWeight: 500 }}>%</span>
                </div>
                <div style={{ fontSize: 12, color: "var(--fg3)", marginTop: 6 }}>{c.total}건 중 {c.fail}건</div>
              </div>
              <div style={{ paddingBottom: 8 }}>
                <div style={{ fontSize: 11, color: "var(--fg3)", marginBottom: 2 }}>전년</div>
                <div style={{ fontSize: 24, fontWeight: 600, color: "var(--fg3)", fontVariantNumeric: "tabular-nums" }}>{c.prev}%</div>
                <div style={{ fontSize: 12, color: c.rate < c.prev ? "var(--color-success)" : "var(--color-error)", fontWeight: 600 }}>
                  {c.rate < c.prev ? "▼ 개선" : "▲ 악화"}
                </div>
              </div>
            </div>
            {c.hi && (
              <div style={{ marginTop: 12, fontSize: 11, color: "var(--color-error-text)", background: "var(--color-error-bg)", borderRadius: "var(--radius-sm)", padding: "4px 10px" }}>
                ⚠ 내부 부적합률이 식약처보다 높습니다
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 유형별 비교 바 차트 */}
      <div style={{ ...card, padding: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--fg1)", marginBottom: 4 }}>식품유형별 부적합률 비교</div>
        <div style={{ fontSize: 12, color: "var(--fg3)", marginBottom: 16 }}>클릭 시 시험항목별 상세 확인</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {byType.map(row => {
            const hi = row.internal > row.mfds;
            const max = Math.max(row.internal, row.mfds, 10);
            return (
              <div key={row.type} onClick={() => setDrillModal(row.type)}
                style={{
                  cursor: "pointer", padding: "12px 16px", borderRadius: "var(--radius-md)",
                  background: hi ? "var(--color-error-bg)" : "var(--gray-50)",
                  border: `1px solid ${hi ? "var(--red-200)" : "var(--border)"}`,
                  transition: "opacity 0.1s",
                }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ fontWeight: 600, fontSize: 13, color: "var(--fg1)" }}>{row.type}</span>
                  <span style={{ fontSize: 12, color: hi ? "var(--color-error)" : "var(--color-success)", fontWeight: 600 }}>
                    {hi ? `▲ 내부 +${(row.internal - row.mfds).toFixed(1)}%p` : "◆ 양호"}
                  </span>
                </div>
                {[
                  { label: "내부", val: row.internal, color: hi ? "var(--color-error)" : "var(--primary-500)" },
                  { label: "식약처", val: row.mfds, color: "var(--gray-300)" },
                ].map(b => (
                  <div key={b.label} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: "var(--fg3)", width: 40 }}>{b.label}</span>
                    <div style={{ flex: 1, background: "var(--gray-100)", borderRadius: 4, height: 8 }}>
                      <div style={{ width: `${(b.val / max) * 100}%`, background: b.color, height: 8, borderRadius: 4, transition: "width 0.3s" }} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: b.color, width: 38, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{b.val}%</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 14, padding: "8px 12px", background: "var(--gray-50)", borderRadius: "var(--radius-md)", fontSize: 11, color: "var(--fg3)" }}>
          산출기준: 내부 = (기획검사+L.safe 부적합) ÷ 전체시험건수 × 100 / 식약처 = 수거검사부적합 ÷ 수거검사총건수 × 100 / 갱신: 월 1회
        </div>
      </div>

      {drillModal && (
        <Modal title={`[${drillModal}] 시험항목별 부적합 건수`} onClose={() => setDrillModal(null)}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["시험항목", "내부", "식약처", "비고"].map(h => (
                  <th key={h} style={{ padding: "8px 10px", textAlign: "left", color: "var(--fg3)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(drillData[drillModal] || []).map((row, i) => {
                const hi = row.internal > row.mfds;
                return (
                  <tr key={i} style={{ borderBottom: "1px solid var(--border)", background: hi ? "var(--color-error-bg)" : "transparent" }}>
                    <td style={{ padding: "10px", fontWeight: 600, color: "var(--fg1)" }}>{row.item}</td>
                    <td style={{ padding: "10px", color: hi ? "var(--color-error)" : "var(--fg2)", fontWeight: hi ? 700 : 400 }}>{row.internal}건</td>
                    <td style={{ padding: "10px", color: "var(--fg3)" }}>{row.mfds}건</td>
                    <td style={{ padding: "10px", fontSize: 12, color: hi ? "var(--color-error-text)" : "var(--fg3)" }}>{hi ? "내부 건수 높음 ⚠" : "—"}</td>
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
