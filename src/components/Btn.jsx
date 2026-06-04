export default function Btn({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, border: "1px solid",
      borderColor: active ? "#111" : "#e5e7eb", background: active ? "#111" : "#fff",
      color: active ? "#fff" : "#374151", cursor: "pointer",
    }}>
      {children}
    </button>
  );
}
