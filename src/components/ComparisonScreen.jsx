import { useState } from "react";
import Modal from "./Modal.jsx";

const drillData = {
  유지류: [{ item: "산가", internal: 4, mfds: 2 }, { item: "벤조피렌", internal: 2, mfds: 1 }, { item: "과산화물가", internal: 1, mfds: 0 }],
  수산물: [{ item: "히스타민", internal: 3, mfds: 2 }, { item: "납", internal: 2, mfds: 1 }, { item: "카드뮴", internal: 1, mfds: 1 }],
  냉동식품: [{ item: "대장균군", internal: 2, mfds: 3 }, { item: "세균수", internal: 1, mfds: 1 }],
  음료류: [{ item: "보존료", internal: 1, mfds: 1 }, { item: "산도", internal: 1, mfds: 2 }],
  과자류: [{ item: "타르색소", internal: 1, mfds: 1 }],
};

export default function ComparisonScreen({ comparison }) {
  const [drillModal, setDrillModal] = useState(null);
  const { internal, mfds, byType } = comparison;

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
        {[
          { label: "내부 부적합률", sub: "기획검사+L.safe", rate: internal.rate, prev: internal.prev, total: internal.total, fail: internal.fail, hi: internal.rate > mfds.rate },
          { label: "식약처 부적합률", sub: "수거검사 계획실적", rate: mfds.rate, prev: mfds.prev, total: mfds.total, fail: mfds.fail, hi: false },
        ].map(c => (
          <div key={c.label} style={{ background: "#fff", border: c.hi ? "2px solid #dc2626" : "1px solid #e5e7eb", borderRadius: 12, padding: 24 }}>
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 2 }}>{c.label}</div>
            <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 14 }}>{c.sub}</div>
            <div style={{ display: "flex", gap: 20, alignItems: "flex-end" }}>
              <div>
                <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 2 }}>올해 누적</div>
                <div style={{ fontSize: 38, fontWeight: 800, color: c.hi ? "#dc2626" : "#111", lineHeight: 1 }}>{c.rate}%</div>
                <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>{c.total}건 중 {c.fail}건</div>
              </div>
              <div style={{ paddingBottom: 6 }}>
                <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 2 }}>전년</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#9ca3af" }}>{c.prev}%</div>
                <div style={{ fontSize: 12, color: c.rate < c.prev ? "#16a34a" : "#dc2626" }}>
                  {c.rate < c.prev ? "▼ 개선" : "▲ 악화"}
                </div>
              </div>
            </div>
            {c.hi && <div style={{ marginTop: 10, fontSize: 11, color: "#dc2626", background: "#fef2f2", borderRadius: 6, padding: "4px 8px" }}>⚠ 내부 부적합률이 식약처보다 높습니다</div>}
          </div>
        ))}
      </div>

      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#111", marginBottom: 4 }}>식품유형별 부적합률 비교</div>
        <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 16 }}>클릭 시 시험항목별 상세 확인</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {byType.map(row => {
            const hi = row.internal > row.mfds, max = Math.max(row.internal, row.mfds, 10);
            return (
              <div key={row.type} onClick={() => setDrillModal(row.type)}
                style={{ cursor: "pointer", padding: "12px 16px", borderRadius: 8, background: hi ? "#fef2f2" : "#f9fafb", border: hi ? "1px solid #fca5a5" : "1px solid #f3f4f6" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: "#111" }}>{row.type}</span>
                  <span style={{ fontSize: 12, color: hi ? "#dc2626" : "#16a34a", fontWeight: 600 }}>
                    {hi ? `▲ 내부 +${(row.internal - row.mfds).toFixed(1)}%p` : "◆ 양호"}
                  </span>
                </div>
                {[{ label: "내부", val: row.internal, color: hi ? "#dc2626" : "#2563eb" }, { label: "식약처", val: row.mfds, color: "#9ca3af" }].map(b => (
                  <div key={b.label} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: "#6b7280", width: 40 }}>{b.label}</span>
                    <div style={{ flex: 1, background: "#e5e7eb", borderRadius: 4, height: 8 }}>
                      <div style={{ width: `${(b.val / max) * 100}%`, background: b.color, height: 8, borderRadius: 4 }} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: b.color, width: 36, textAlign: "right" }}>{b.val}%</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 12, padding: "8px 12px", background: "#f9fafb", borderRadius: 8, fontSize: 11, color: "#6b7280" }}>
          산출기준: 내부=(기획검사+L.safe 부적합)÷전체시험건수×100 / 식약처=수거검사부적합÷수거검사총건수×100 / 갱신: 내부·식약처 모두 월 1회
        </div>
      </div>

      {drillModal && (
        <Modal title={`[${drillModal}] 시험항목별 부적합 건수`} onClose={() => setDrillModal(null)}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                {["시험항목", "내부", "식약처", "비고"].map(h => (
                  <th key={h} style={{ padding: "8px 10px", textAlign: "left", color: "#6b7280", fontWeight: 600, fontSize: 12 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(drillData[drillModal] || []).map((row, i) => {
                const hi = row.internal > row.mfds;
                return (
                  <tr key={i} style={{ borderBottom: "1px solid #f3f4f6", background: hi ? "#fef2f2" : "#fff" }}>
                    <td style={{ padding: "10px", fontWeight: 600 }}>{row.item}</td>
                    <td style={{ padding: "10px", color: hi ? "#dc2626" : "#374151", fontWeight: hi ? 700 : 400 }}>{row.internal}건</td>
                    <td style={{ padding: "10px", color: "#6b7280" }}>{row.mfds}건</td>
                    <td style={{ padding: "10px", fontSize: 12, color: hi ? "#dc2626" : "#6b7280" }}>{hi ? "내부 건수 높음 ⚠" : "-"}</td>
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
