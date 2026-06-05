export default function Btn({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      padding: "5px 14px", borderRadius: "var(--radius-pill)", fontSize: 12, fontWeight: 600,
      border: "1.5px solid",
      borderColor: active ? "var(--primary-500)" : "var(--border-strong)",
      background: active ? "var(--primary-50)" : "var(--bg-card)",
      color: active ? "var(--primary-700)" : "var(--fg2)",
      cursor: "pointer", transition: "all 0.12s",
    }}>
      {children}
    </button>
  );
}
