const BADGE = {
  5: { bg: "var(--color-error-bg)",   text: "var(--color-error-text)",   label: "긴급" },
  4: { bg: "var(--color-warning-bg)", text: "var(--color-warning-text)", label: "높음" },
  3: { bg: "#FEF3C7",                 text: "#92400E",                   label: "보통" },
  2: { bg: "var(--color-success-bg)", text: "var(--color-success-text)", label: "낮음" },
  1: { bg: "var(--gray-100)",         text: "var(--gray-700)",           label: "정보" },
};

export default function Badge({ grade }) {
  const s = BADGE[grade] ?? BADGE[1];
  return (
    <span style={{
      display: "inline-block", padding: "2px 8px",
      borderRadius: "var(--radius-pill)", fontSize: 11, fontWeight: 600,
      background: s.bg, color: s.text,
    }}>
      {s.label}
    </span>
  );
}
