export default function Modal({ title, onClose, children }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(28,28,26,0.45)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center",
    }} onClick={onClose}>
      <div style={{
        background: "var(--bg-card)", borderRadius: "var(--radius-lg)",
        padding: 28, width: 700, maxHeight: "82vh",
        overflowY: "auto", border: "1px solid var(--border)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "var(--fg1)" }}>{title}</h3>
          <button onClick={onClose} style={{
            border: "1px solid var(--border)", background: "var(--gray-50)",
            width: 28, height: 28, borderRadius: "var(--radius-md)",
            fontSize: 16, cursor: "pointer", color: "var(--fg3)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}
