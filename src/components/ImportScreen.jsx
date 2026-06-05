import Tag from "./Tag.jsx";

export default function ImportScreen({ importRisk }) {
  const maxCount = importRisk[0]?.count || 1;
  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 20 }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--fg1)", marginBottom: 4 }}>국가별 부적합 건수 상위</div>
      <div style={{ fontSize: 12, color: "var(--fg3)", marginBottom: 20 }}>최근 30일 기준</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {importRisk.map((r, i) => (
          <div key={i} style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: i === 0 ? "var(--color-error)" : i === 1 ? "var(--color-warning)" : "var(--gray-300)", flexShrink: 0 }} />
            <span style={{ width: 52, fontWeight: 600, fontSize: 13, color: "var(--fg1)" }}>{r.country}</span>
            <Tag color="var(--color-info-bg)" text="var(--color-info-text)">{r.foodType}</Tag>
            <Tag color="#FEF9C3" text="#92400E">{r.item}</Tag>
            <div style={{ flex: 1, background: "var(--gray-100)", borderRadius: 4, height: 18 }}>
              <div style={{ width: `${(r.count / maxCount) * 100}%`, background: i === 0 ? "var(--color-error)" : i === 1 ? "var(--color-warning)" : "var(--primary-300)", height: 18, borderRadius: 4, display: "flex", alignItems: "center", paddingLeft: 8, transition: "width 0.3s" }}>
                <span style={{ fontSize: 11, color: "#fff", fontWeight: 600 }}>{r.count}건</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
