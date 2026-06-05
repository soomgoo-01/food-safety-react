export default function Tag({ children, color = "var(--gray-100)", text = "var(--fg2)" }) {
  return (
    <span style={{
      display: "inline-block", padding: "2px 8px",
      borderRadius: "var(--radius-pill)", fontSize: 11, fontWeight: 500,
      background: color, color: text, marginRight: 4, marginTop: 2,
    }}>
      {children}
    </span>
  );
}
