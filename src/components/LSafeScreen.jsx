import { useState } from "react";
import { FOOD_TYPES } from "../constants.js";
import Tag from "./Tag.jsx";
import Modal from "./Modal.jsx";

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
      <div style={{
        background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 12, padding: "10px 16px",
        display: "flex", alignItems: "center", gap: 10, marginBottom: 16,
      }}>
        <span style={{ fontSize: 12, color: "#dc2626", fontWeight: 600 }}>부적합 건만 표시 중</span>
        <span style={{ fontSize: 12, color: "#6b7280" }}>이력 버튼 클릭 시 적합 이력까지 전체 확인 가능</span>
        <div style={{ marginLeft: "auto" }}>
          <button style={{ padding: "5px 14px", background: "#16a34a", color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>CSV 업로드</button>
          <span style={{ fontSize: 11, color: "#6b7280", marginLeft: 10 }}>마지막 업로드: 2026-05-26</span>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <input value={filter.product} onChange={e => setFilter({ ...filter, product: e.target.value })}
          placeholder="제품명 검색..."
          style={{ flex: 1, border: "1px solid #e5e7eb", borderRadius: 8, padding: "7px 12px", fontSize: 13 }} />
        <select value={filter.foodType} onChange={e => setFilter({ ...filter, foodType: e.target.value })}
          style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "7px 12px", fontSize: 13 }}>
          {FOOD_TYPES.map(f => <option key={f}>{f}</option>)}
        </select>
        <div style={{ padding: "7px 14px", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 8, fontSize: 12, color: "#dc2626", fontWeight: 600, display: "flex", alignItems: "center" }}>
          부적합 {filtered.length}건
        </div>
      </div>

      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead style={{ background: "#fef2f2" }}>
            <tr>
              {["제품명", "식품유형", "시험항목", "검출값", "기준값", "시험일", "전체이력", "조치내역"].map(h => (
                <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 12, color: "#6b7280", fontWeight: 600, borderBottom: "1px solid #fca5a5" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(row => (
              <tr key={row.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ padding: "10px 14px", fontWeight: 600, color: "#111" }}>{row.product}</td>
                <td style={{ padding: "10px 14px" }}><Tag color="#eff6ff" text="#1d4ed8">{row.foodType}</Tag></td>
                <td style={{ padding: "10px 14px", color: "#dc2626", fontWeight: 600 }}>{row.item}</td>
                <td style={{ padding: "10px 14px", color: "#dc2626", fontWeight: 700 }}>{row.detected}</td>
                <td style={{ padding: "10px 14px", color: "#6b7280" }}>{row.standard}</td>
                <td style={{ padding: "10px 14px", color: "#6b7280" }}>{row.date}</td>
                <td style={{ padding: "10px 14px" }}>
                  <button onClick={() => setHistoryModal(row.product)} style={{
                    padding: "3px 10px", border: "1px solid #2563eb", borderRadius: 8,
                    background: "#eff6ff", fontSize: 12, cursor: "pointer", color: "#2563eb", fontWeight: 600,
                  }}>
                    {getHistory(row.product).length}건 ▸
                  </button>
                </td>
                <td style={{ padding: "10px 14px" }}>
                  <input defaultValue={measures[row.id] || row.measure || ""} placeholder="조치내역 입력..."
                    style={{ width: 160, border: "1px solid #fca5a5", borderRadius: 6, padding: "4px 8px", fontSize: 12 }}
                    onBlur={e => setMeasures({ ...measures, [row.id]: e.target.value })} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {historyModal && (
        <Modal title={`${historyModal} — 시험 이력 전체 (적합+부적합)`} onClose={() => setHistoryModal(null)}>
          <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 14 }}>
            최신순 정렬 · 조치내역은 부적합 건에만 표시
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                {["시험일", "시험항목", "검출값", "기준값", "결과", "조치사항"].map(h => (
                  <th key={h} style={{ padding: "7px 10px", textAlign: "left", color: "#6b7280", fontWeight: 600, fontSize: 12 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {getHistory(historyModal).map((h, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #f3f4f6", background: h.result === "부적합" ? "#fef9f9" : i === 0 ? "#f9fafb" : "#fff" }}>
                  <td style={{ padding: "9px 10px", color: "#374151" }}>{h.date}{i === 0 ? " ← 최신" : ""}</td>
                  <td style={{ padding: "9px 10px", color: "#374151" }}>{h.item}</td>
                  <td style={{ padding: "9px 10px", color: h.result === "부적합" ? "#dc2626" : "#374151", fontWeight: h.result === "부적합" ? 700 : 400 }}>{h.detected}</td>
                  <td style={{ padding: "9px 10px", color: "#6b7280" }}>{h.standard}</td>
                  <td style={{ padding: "9px 10px" }}>
                    <span style={{ padding: "2px 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, background: h.result === "부적합" ? "#fef2f2" : "#f0fdf4", color: h.result === "부적합" ? "#dc2626" : "#16a34a" }}>{h.result}</span>
                  </td>
                  <td style={{ padding: "9px 10px", fontSize: 12, color: "#6b7280" }}>
                    {h.result === "부적합"
                      ? (h.measure || <span style={{ color: "#fca5a5" }}>미입력</span>)
                      : <span style={{ color: "#d1d5db" }}>—</span>}
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
