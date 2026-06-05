import { useState } from "react";
import { FOOD_TYPES } from "../constants.js";
import Tag from "./Tag.jsx";
import Modal from "./Modal.jsx";

const inputStyle = {
  border: "1px solid var(--border-strong)", borderRadius: "var(--radius-md)",
  padding: "7px 12px", fontSize: 13, background: "var(--bg-card)",
  color: "var(--fg1)", outline: "none",
};

export default function LSafeScreen({ lsafeFail, lsafeAll }) {
  const [historyModal, setHistoryModal] = useState(null);
  const [measures, setMeasures] = useState({});
  const [filter, setFilter] = useState({ product: "", foodType: "전체" });

  const filtered = lsafeFail.filter(d =>
    (filter.product === "" || d.product.includes(filter.product)) &&
    (filter.foodType === "전체" || d.foodType === filter.foodType)
  );
  const getHistory = (product) =>
    lsafeAll.filter(d => d.product === product).sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div>
      {/* 상태 배너 */}
      <div style={{
        background: "var(--color-error-bg)", border: "1px solid var(--red-200)",
        borderRadius: "var(--radius-md)", padding: "10px 16px",
        display: "flex", alignItems: "center", gap: 10, marginBottom: 16,
      }}>
        <span style={{ fontSize: 12, color: "var(--color-error-text)", fontWeight: 600 }}>부적합 건만 표시 중</span>
        <span style={{ fontSize: 12, color: "var(--fg3)" }}>이력 버튼 클릭 시 적합 이력까지 전체 확인 가능</span>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
          <button style={{
            padding: "5px 14px", background: "var(--primary-500)", color: "#fff",
            border: "none", borderRadius: "var(--radius-md)", fontSize: 12, fontWeight: 600, cursor: "pointer",
          }}>CSV 업로드</button>
          <span style={{ fontSize: 11, color: "var(--fg3)" }}>마지막 업로드: 2026-05-26</span>
        </div>
      </div>

      {/* 필터 */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <input value={filter.product} onChange={e => setFilter({ ...filter, product: e.target.value })}
          placeholder="제품명 검색..."
          style={{ ...inputStyle, flex: 1 }} />
        <select value={filter.foodType} onChange={e => setFilter({ ...filter, foodType: e.target.value })}
          style={inputStyle}>
          {FOOD_TYPES.map(f => <option key={f}>{f}</option>)}
        </select>
        <div style={{
          padding: "7px 14px", background: "var(--color-error-bg)",
          border: "1px solid var(--red-200)", borderRadius: "var(--radius-md)",
          fontSize: 12, color: "var(--color-error-text)", fontWeight: 600,
          display: "flex", alignItems: "center",
        }}>
          부적합 {filtered.length}건
        </div>
      </div>

      {/* 테이블 */}
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead style={{ background: "var(--gray-50)" }}>
            <tr>
              {["제품명", "식품유형", "시험항목", "검출값", "기준값", "시험일", "전체이력", "조치내역"].map(h => (
                <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, color: "var(--fg3)", fontWeight: 600, borderBottom: "1px solid var(--border)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(row => (
              <tr key={row.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "11px 14px", fontWeight: 600, color: "var(--fg1)" }}>{row.product}</td>
                <td style={{ padding: "11px 14px" }}><Tag color="var(--color-info-bg)" text="var(--color-info-text)">{row.foodType}</Tag></td>
                <td style={{ padding: "11px 14px", color: "var(--color-error)", fontWeight: 600 }}>{row.item}</td>
                <td style={{ padding: "11px 14px", color: "var(--color-error)", fontWeight: 700 }}>{row.detected}</td>
                <td style={{ padding: "11px 14px", color: "var(--fg3)" }}>{row.standard}</td>
                <td style={{ padding: "11px 14px", color: "var(--fg3)" }}>{row.date}</td>
                <td style={{ padding: "11px 14px" }}>
                  <button onClick={() => setHistoryModal(row.product)} style={{
                    padding: "4px 10px", border: "1.5px solid var(--primary-500)",
                    borderRadius: "var(--radius-md)", background: "var(--primary-50)",
                    fontSize: 12, cursor: "pointer", color: "var(--primary-700)", fontWeight: 600,
                  }}>
                    {getHistory(row.product).length}건 ▸
                  </button>
                </td>
                <td style={{ padding: "11px 14px" }}>
                  <input defaultValue={measures[row.id] || row.measure || ""} placeholder="조치내역 입력..."
                    style={{ width: 160, border: "1px solid var(--border-strong)", borderRadius: "var(--radius-sm)", padding: "4px 8px", fontSize: 12, color: "var(--fg1)", background: "var(--bg-card)" }}
                    onBlur={e => setMeasures({ ...measures, [row.id]: e.target.value })} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {historyModal && (
        <Modal title={`${historyModal} — 시험 이력 전체`} onClose={() => setHistoryModal(null)}>
          <div style={{ fontSize: 12, color: "var(--fg3)", marginBottom: 14 }}>
            최신순 정렬 · 조치내역은 부적합 건에만 표시
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["시험일", "시험항목", "검출값", "기준값", "결과", "조치사항"].map(h => (
                  <th key={h} style={{ padding: "7px 10px", textAlign: "left", color: "var(--fg3)", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {getHistory(historyModal).map((h, i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--border)", background: h.result === "부적합" ? "var(--color-error-bg)" : i === 0 ? "var(--primary-50)" : "transparent" }}>
                  <td style={{ padding: "9px 10px", color: "var(--fg2)" }}>{h.date}{i === 0 ? " ← 최신" : ""}</td>
                  <td style={{ padding: "9px 10px", color: "var(--fg2)" }}>{h.item}</td>
                  <td style={{ padding: "9px 10px", color: h.result === "부적합" ? "var(--color-error)" : "var(--fg2)", fontWeight: h.result === "부적합" ? 700 : 400 }}>{h.detected}</td>
                  <td style={{ padding: "9px 10px", color: "var(--fg3)" }}>{h.standard}</td>
                  <td style={{ padding: "9px 10px" }}>
                    <span style={{
                      padding: "2px 10px", borderRadius: "var(--radius-pill)", fontSize: 12, fontWeight: 600,
                      background: h.result === "부적합" ? "var(--color-error-bg)" : "var(--color-success-bg)",
                      color: h.result === "부적합" ? "var(--color-error-text)" : "var(--color-success-text)",
                    }}>{h.result}</span>
                  </td>
                  <td style={{ padding: "9px 10px", fontSize: 12, color: "var(--fg3)" }}>
                    {h.result === "부적합"
                      ? (h.measure || <span style={{ color: "var(--red-200)" }}>미입력</span>)
                      : <span style={{ color: "var(--gray-300)" }}>—</span>}
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
