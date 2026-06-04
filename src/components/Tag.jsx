export default function Tag({ children, color = "#e5e7eb", text = "#374151" }) {
  return (
    <span style={{
      display: "inline-block", padding: "2px 8px", borderRadius: 12, fontSize: 11,
      background: color, color: text, marginRight: 4, marginTop: 2,
    }}>
      {children}
    </span>
  );
}
