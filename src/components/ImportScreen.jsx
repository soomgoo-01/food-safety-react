import Tag from "./Tag.jsx";

export default function ImportScreen({ importRisk }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#111", marginBottom: 16 }}>국가별 부적합 건수 상위 (최근 30일)</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {importRisk.map((r, i) => (
          <div key={i} style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <span style={{ width: 60, fontWeight: 600, fontSize: 13, color: "#111" }}>{r.country}</span>
            <Tag color="#eff6ff" text="#1d4ed8">{r.foodType}</Tag>
            <Tag color="#fef9c3" text="#92400e">{r.item}</Tag>
            <div style={{ flex: 1, background: "#f3f4f6", borderRadius: 4, height: 18 }}>
              <div style={{ width: `${(r.count / 14) * 100}%`, background: "#dc2626", height: 18, borderRadius: 4, display: "flex", alignItems: "center", paddingLeft: 8 }}>
                <span style={{ fontSize: 11, color: "#fff", fontWeight: 600 }}>{r.count}건</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
