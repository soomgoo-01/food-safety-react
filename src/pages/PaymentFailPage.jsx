import { useNavigate } from "react-router-dom";

export default function PaymentFailPage() {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const message = params.get("message") ?? "결제가 취소되었거나 오류가 발생했습니다.";

  return (
    <div style={{
      minHeight: "100vh", background: "var(--bg-page)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        background: "var(--bg-card)", border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)", padding: 40,
        textAlign: "center", maxWidth: 400, width: "90%",
      }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>❌</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "var(--fg1)", marginBottom: 8 }}>
          결제 실패
        </div>
        <div style={{ fontSize: 13, color: "var(--fg3)", marginBottom: 24 }}>
          {decodeURIComponent(message)}
        </div>
        <button
          onClick={() => navigate("/")}
          style={{
            padding: "10px 24px", borderRadius: "var(--radius-md)",
            background: "var(--primary-500)", color: "#fff",
            border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600,
          }}
        >
          다시 시도하기
        </button>
      </div>
    </div>
  );
}
