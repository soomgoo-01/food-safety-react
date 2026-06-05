import { useState } from "react";
import { FOOD_TYPES } from "../constants.js";
import Tag from "./Tag.jsx";
import Btn from "./Btn.jsx";
import Modal from "./Modal.jsx";

const prevYear = { 유지류: 6, 냉동식품: 4, 수산물: 3, 음료류: 2, 과자류: 2 };

const card = {
  background: "var(--bg-card)", border: "1px solid var(--border)",
  borderRadius: "var(--radius-lg)", padding: 20,
};

const selectStyle = {
  border: "1px solid var(--border-strong)", borderRadius: "var(--radius-md)",
  padding: "7px 12px", fontSize: 13, background: "var(--bg-card)", color: "var(--fg1)",
};

export default function NoncompliantScreen({ noncompliant }) {
  const [ftFilter, setFtFilter] = useState("전체");
  const [recFilter, setRecFilter] = useState("전체");
  const [activeTab, setActiveTab] = useState("위험식품유형");
  const [typeModal, setTypeModal] = useState(null);
  const [heatModal, setHeatModal] = useState(null);

  const filtered = noncompliant.filter(d =>
    (ftFilter === "전체" || d.foodType === ftFilter) &&
    (recFilter === "전체" || (recFilter === "회수" ? d.recall : !d.recall))
  );

  const byFT = {};
  noncompliant.forEach(d => { byFT[d.foodType] = (byFT[d.foodType] || 0) + 1; });
  const ftList = Object.entries(byFT).sort((a, b) => b[1] - a[1]);
  const maxFT = ftList[0]?.[1] || 1;

  const getItemsForType = (type) => {
    const c = {};
    noncompliant.filter(d => d.foodType === type).forEach(d => { c[d.item] = (c[d.item] || 0) + 1; });
    return Object.entries(c).sort((a, b) => b[1] - a[1]);
  };

  const heatmap = {}, allItems = [], allTypes = [];
  noncompliant.forEach(d => {
    if (!heatmap[d.foodType]) heatmap[d.foodType] = {};
    heatmap[d.foodType][d.item] = (heatmap[d.foodType][d.item] || 0) + 1;
    if (!allTypes.includes(d.foodType)) allTypes.push(d.foodType);
    if (!allItems.includes(d.item)) allItems.push(d.item);
  });
  const maxHeat = Math.max(...Object.values(heatmap).flatMap(v => Object.values(v)));

  const currYear = {};
  noncompliant.forEach(d => { currYear[d.foodType] = (currYear[d.foodType] || 0) + 1; });

  const repeatVendors = {};
  noncompliant.forEach(d => { repeatVendors[d.vendor] = (repeatVendors[d.vendor] || []).concat(d); });
  const repeated = Object.entries(repeatVendors).filter(([, arr]) => arr.length >= 2).sort((a, b) => b[1].length - a[1].length);

  return (
    <div>
      {/* 필터 */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <select value={ftFilter} onChange={e => setFtFilter(e.target.value)} style={selectStyle}>
          {FOOD_TYPES.map(f => <option key={f}>{f}</option>)}
        </select>
        <select value={recFilter} onChange={e => setRecFilter(e.target.value)} style={selectStyle}>
          {["전체", "회수", "회수없음"].map(r => <option key={r}>{r}</option>)}
        </select>
      </div>

      {/* 목록 테이블 */}
      <div style={{ ...card, padding: 0, overflow: "hidden", marginBottom: 16 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead style={{ background: "var(--gray-50)" }}>
            <tr>
              {["날짜", "식품유형", "제품명", "업소명", "부적합항목", "검사결과", "기준규격", "회수여부"].map(h => (
                <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: 11, color: "var(--fg3)", fontWeight: 600, borderBottom: "1px solid var(--border)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(row => (
              <tr key={row.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "10px 12px", color: "var(--fg3)", fontSize: 12 }}>{row.date}</td>
                <td style={{ padding: "10px 12px" }}><Tag color="var(--color-info-bg)" text="var(--color-info-text)">{row.foodType}</Tag></td>
                <td style={{ padding: "10px 12px", fontWeight: 600, color: "var(--fg1)" }}>{row.product}</td>
                <td style={{ padding: "10px 12px", color: "var(--fg2)" }}>{row.vendor}</td>
                <td style={{ padding: "10px 12px", color: "var(--color-error)", fontWeight: 600 }}>{row.item}</td>
                <td style={{ padding: "10px 12px", color: "var(--color-error)" }}>{row.result}</td>
                <td style={{ padding: "10px 12px", color: "var(--fg3)" }}>{row.standard}</td>
                <td style={{ padding: "10px 12px" }}>
                  {row.recall
                    ? <Tag color="var(--color-error-bg)" text="var(--color-error-text)">회수</Tag>
                    : <Tag color="var(--gray-100)" text="var(--fg3)">없음</Tag>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 분석 탭 */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        {["위험식품유형", "전년대비증가", "위반항목히트맵", "반복위반업체"].map(tab => (
          <Btn key={tab} active={activeTab === tab} onClick={() => setActiveTab(tab)}>{tab}</Btn>
        ))}
      </div>

      {activeTab === "위험식품유형" && (
        <div style={card}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--fg1)", marginBottom: 4 }}>식품유형별 부적합 건수</div>
          <div style={{ fontSize: 12, color: "var(--fg3)", marginBottom: 14 }}>클릭 시 해당 식품유형의 시험항목별 건수 확인</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {ftList.map(([type, cnt], i) => (
              <div key={type} onClick={() => setTypeModal(type)}
                style={{ display: "flex", gap: 12, alignItems: "center", cursor: "pointer", padding: "8px 12px", borderRadius: "var(--radius-md)", background: i === 0 ? "var(--color-error-bg)" : "var(--gray-50)", border: `1px solid ${i === 0 ? "var(--red-200)" : "var(--border)"}` }}>
                <span style={{ width: 70, fontWeight: 600, fontSize: 13, color: "var(--fg1)" }}>{type}</span>
                <div style={{ flex: 1, background: "var(--gray-100)", borderRadius: 4, height: 20 }}>
                  <div style={{ width: `${(cnt / maxFT) * 100}%`, background: i === 0 ? "var(--color-error)" : i === 1 ? "var(--color-warning)" : "var(--primary-500)", height: 20, borderRadius: 4, display: "flex", alignItems: "center", paddingLeft: 8, transition: "width 0.3s" }}>
                    <span style={{ fontSize: 11, color: "#fff", fontWeight: 600 }}>{cnt}건</span>
                  </div>
                </div>
                <span style={{ fontSize: 12, color: "var(--primary-500)" }}>항목별 ▸</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "전년대비증가" && (
        <div style={card}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--fg1)", marginBottom: 16 }}>식품유형별 전년 동기 대비</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {Object.keys(prevYear).map(type => {
              const curr = currYear[type] || 0, prev = prevYear[type], inc = curr > prev;
              return (
                <div key={type} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: "var(--radius-md)", background: inc ? "var(--color-error-bg)" : "var(--gray-50)", border: `1px solid ${inc ? "var(--red-200)" : "var(--border)"}` }}>
                  <span style={{ width: 70, fontWeight: 600, fontSize: 13, color: "var(--fg1)" }}>{type}</span>
                  <span style={{ fontSize: 12, color: "var(--fg3)", width: 60 }}>전년 {prev}건</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: inc ? "var(--color-error)" : "var(--fg1)" }}>올해 {curr}건</span>
                  {inc
                    ? <Tag color="var(--color-error-bg)" text="var(--color-error-text)">↑ {curr - prev}건 증가</Tag>
                    : <Tag color="var(--color-success-bg)" text="var(--color-success-text)">양호</Tag>}
                </div>
              );
            })}
          </div>
          <div style={{ fontSize: 11, color: "var(--fg3)", marginTop: 10 }}>* 현재 월까지의 구간을 전년 동기와 비교</div>
        </div>
      )}

      {activeTab === "위반항목히트맵" && (
        <div style={card}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--fg1)", marginBottom: 16 }}>식품유형 × 시험항목 히트맵</div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr>
                  <th style={{ padding: "6px 12px", textAlign: "left", color: "var(--fg3)", minWidth: 80, fontWeight: 600 }}>유형 ╲ 항목</th>
                  {allItems.map(item => (
                    <th key={item} style={{ padding: "6px 10px", color: "var(--fg3)", fontWeight: 600, whiteSpace: "nowrap" }}>{item}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allTypes.map(type => (
                  <tr key={type}>
                    <td style={{ padding: "8px 12px", fontWeight: 600, color: "var(--fg1)" }}>{type}</td>
                    {allItems.map(item => {
                      const cnt = heatmap[type]?.[item] || 0;
                      const intensity = cnt / maxHeat;
                      return (
                        <td key={item} onClick={() => cnt > 0 && setHeatModal({ type, item })}
                          style={{
                            padding: "8px 10px", textAlign: "center", borderRadius: 4,
                            background: cnt > 0 ? `rgba(208,48,47,${0.15 + intensity * 0.75})` : "var(--gray-50)",
                            cursor: cnt > 0 ? "pointer" : "default",
                            color: cnt > 0 ? "#fff" : "var(--gray-300)", fontWeight: 700,
                          }}>
                          {cnt || ""}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "반복위반업체" && (
        <div style={card}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--fg1)", marginBottom: 16 }}>반복 위반 업체 (1년 내 2회 이상)</div>
          {repeated.length === 0
            ? <div style={{ color: "var(--fg3)", textAlign: "center", padding: 24 }}>해당 업체 없음</div>
            : repeated.map(([vendor, records]) => (
              <div key={vendor} style={{ border: "1px solid var(--red-200)", borderRadius: "var(--radius-md)", padding: "12px 16px", background: "var(--color-error-bg)", marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: "var(--fg1)" }}>{vendor}</span>
                  <div>
                    <Tag color="var(--color-error-bg)" text="var(--color-error-text)">부적합 {records.length}건</Tag>
                    {records.some(r => r.recall) && <Tag color="#FEF9C3" text="#92400E">회수 포함</Tag>}
                  </div>
                </div>
                {records.map(r => (
                  <div key={r.id} style={{ fontSize: 12, color: "var(--fg2)", marginBottom: 2 }}>
                    {r.date} · {r.foodType} · {r.product} · <span style={{ color: "var(--color-error)", fontWeight: 600 }}>{r.item}</span>
                  </div>
                ))}
              </div>
            ))
          }
        </div>
      )}

      {typeModal && (
        <Modal title={`[${typeModal}] 시험항목별 부적합 건수`} onClose={() => setTypeModal(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {getItemsForType(typeModal).map(([item, cnt], i) => {
              const max = getItemsForType(typeModal)[0][1];
              return (
                <div key={item} style={{ display: "flex", gap: 12, alignItems: "center", padding: "8px 10px", background: i === 0 ? "var(--color-error-bg)" : "var(--gray-50)", borderRadius: "var(--radius-md)" }}>
                  <span style={{ width: 100, fontWeight: i === 0 ? 700 : 400, fontSize: 13, color: "var(--fg1)" }}>{item}</span>
                  <div style={{ flex: 1, background: "var(--gray-100)", borderRadius: 4, height: 18 }}>
                    <div style={{ width: `${(cnt / max) * 100}%`, background: i === 0 ? "var(--color-error)" : "var(--primary-500)", height: 18, borderRadius: 4, display: "flex", alignItems: "center", paddingLeft: 8 }}>
                      <span style={{ fontSize: 11, color: "#fff", fontWeight: 600 }}>{cnt}건</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Modal>
      )}
      {heatModal && (
        <Modal title={`${heatModal.type} × ${heatModal.item}`} onClose={() => setHeatModal(null)}>
          {noncompliant.filter(d => d.foodType === heatModal.type && d.item === heatModal.item).map(d => (
            <div key={d.id} style={{ background: "var(--color-error-bg)", borderRadius: "var(--radius-md)", padding: "10px 14px", marginBottom: 6 }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: "var(--fg1)" }}>{d.product}</div>
              <div style={{ fontSize: 12, color: "var(--fg2)" }}>{d.vendor} · {d.date} · 검출 {d.result} (기준 {d.standard})</div>
            </div>
          ))}
        </Modal>
      )}
    </div>
  );
}
