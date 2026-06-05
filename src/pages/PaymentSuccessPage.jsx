import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentKey = params.get("paymentKey");
    const orderId = params.get("orderId");
    const amount = Number(params.get("amount"));

    if (!paymentKey || !orderId || !amount) {
      setStatus("error");
      setErrorMsg("결제 정보가 올바르지 않습니다.");
      return;
    }

    fetch("/api/payment-confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentKey, orderId, amount }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setStatus("error");
          setErrorMsg(data.message ?? "결제 승인에 실패했습니다.");
        } else {
          setStatus("success");
        }
      })
      .catch(() => {
        setStatus("error");
        setErrorMsg("네트워크 오류가 발생했습니다.");
      });
  }, []);

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
        {status === "loading" && (
          <>
            <div style={{ fontSize: 32, marginBottom: 16 }}>⏳</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "var(--fg1)", marginBottom: 8 }}>
              결제 승인 중…
            </div>
            <div style={{ fontSize: 13, color: "var(--fg3)" }}>잠시만 기다려 주세요.</div>
          </>
        )}

        {status === "success" && (
          <>
            <div style={{ fontSize: 40, marginBottom: 16 }}>✅</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--fg1)", marginBottom: 8 }}>
              결제 완료
            </div>
            <div style={{ fontSize: 13, color: "var(--fg3)", marginBottom: 24 }}>
              알림 & 리포트 구독이 시작되었습니다.
            </div>
            <button
              onClick={() => navigate("/")}
              style={{
                padding: "10px 24px", borderRadius: "var(--radius-md)",
                background: "var(--primary-500)", color: "#fff",
                border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600,
              }}
            >
              대시보드로 돌아가기
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <div style={{ fontSize: 40, marginBottom: 16 }}>❌</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--fg1)", marginBottom: 8 }}>
              결제 실패
            </div>
            <div style={{ fontSize: 13, color: "var(--fg3)", marginBottom: 24 }}>
              {errorMsg}
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
          </>
        )}
      </div>
    </div>
  );
}
