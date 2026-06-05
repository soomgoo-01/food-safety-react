import { useEffect, useState } from "react";
import { loadTossPayments, ANONYMOUS } from "@tosspayments/tosspayments-sdk";
import { useAuth } from "../auth/AuthContext.jsx";

const CLIENT_KEY = import.meta.env.VITE_TOSS_CLIENT_KEY;
const AMOUNT = 29000;
const ORDER_NAME = "식품안전 알림 & 리포트 월정액";

const FEATURES = [
  "이메일 · 슬랙 알림 (부적합·리콜 발생 즉시)",
  "월간 식품안전 리포트 자동 생성 및 PDF 발송",
  "기획검사 일정 알림 (D-7, D-1)",
  "뉴스 키워드 긴급도 4~5등급 즉시 알림",
  "수입식품 리스크 주간 요약",
];

export default function PaymentScreen() {
  const { user } = useAuth();
  const [widgets, setWidgets] = useState(null);
  const [ready, setReady] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!CLIENT_KEY) return;

    let mounted = true;

    (async () => {
      try {
        const tossPayments = await loadTossPayments(CLIENT_KEY);
        const customerKey = user?.id ?? ANONYMOUS;
        const w = tossPayments.widgets({ customerKey });

        await w.setAmount({ currency: "KRW", value: AMOUNT });
        if (!mounted) return;
        setWidgets(w);

        await Promise.all([
          w.renderPaymentMethods({ selector: "#toss-payment-method", variantKey: "DEFAULT" }),
          w.renderAgreement({ selector: "#toss-agreement", variantKey: "AGREEMENT" }),
        ]);

        if (mounted) setReady(true);
      } catch (err) {
        if (mounted) setError(err.message);
      }
    })();

    return () => { mounted = false; };
  }, [user]);

  async function handlePay() {
    if (!widgets || !ready || paying) return;
    setPaying(true);
    setError(null);

    const orderId = `order-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    try {
      await widgets.requestPayment({
        orderId,
        orderName: ORDER_NAME,
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
        customerEmail: user?.email ?? undefined,
        customerName: user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? undefined,
      });
    } catch (err) {
      if (err.code !== "USER_CANCEL") setError(err.message);
      setPaying(false);
    }
  }

  if (!CLIENT_KEY) {
    return (
      <div style={{
        background: "var(--color-error-bg)", border: "1px solid var(--red-200)",
        borderRadius: "var(--radius-md)", padding: 20, fontSize: 13,
        color: "var(--color-error-text)",
      }}>
        <strong>설정 오류</strong>: <code>VITE_TOSS_CLIENT_KEY</code> 환경 변수가 없습니다.
        Vercel 대시보드와 <code>.env.local</code>에 추가해주세요.
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
      {/* 플랜 안내 카드 */}
      <div style={{
        background: "var(--bg-card)", border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)", padding: 24,
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--fg1)", marginBottom: 4 }}>
              알림 & 리포트 구독
            </div>
            <div style={{ fontSize: 13, color: "var(--fg3)" }}>식품안전 이벤트를 놓치지 마세요</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: "var(--primary-500)" }}>
              ₩{AMOUNT.toLocaleString()}
            </div>
            <div style={{ fontSize: 12, color: "var(--fg3)" }}>/ 월</div>
          </div>
        </div>

        <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
          {FEATURES.map(f => (
            <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "var(--fg2)" }}>
              <span style={{ color: "var(--primary-500)", flexShrink: 0, marginTop: 1 }}>✓</span>
              {f}
            </li>
          ))}
        </ul>
      </div>

      {/* 토스 위젯 영역 */}
      <div style={{
        background: "var(--bg-card)", border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)", padding: 24,
      }}>
        {!ready && !error && (
          <div style={{ textAlign: "center", color: "var(--fg3)", fontSize: 13, padding: "24px 0" }}>
            결제 수단 불러오는 중…
          </div>
        )}
        <div id="toss-payment-method" />
        <div id="toss-agreement" />
      </div>

      {error && (
        <div style={{
          background: "var(--color-error-bg)", border: "1px solid var(--red-200)",
          borderRadius: "var(--radius-md)", padding: "10px 14px",
          fontSize: 13, color: "var(--color-error-text)",
        }}>
          {error}
        </div>
      )}

      <button
        onClick={handlePay}
        disabled={!ready || paying}
        style={{
          width: "100%", padding: "14px 0", borderRadius: "var(--radius-md)",
          border: "none", cursor: ready && !paying ? "pointer" : "not-allowed",
          background: ready && !paying ? "var(--primary-500)" : "var(--border)",
          color: ready && !paying ? "#fff" : "var(--fg3)",
          fontSize: 15, fontWeight: 700, transition: "background 0.15s",
        }}
      >
        {paying ? "결제 처리 중…" : `₩${AMOUNT.toLocaleString()} 결제하기`}
      </button>

      <div style={{ textAlign: "center", fontSize: 11, color: "var(--fg3)" }}>
        토스페이먼츠를 통해 안전하게 결제됩니다 · 언제든지 해지 가능
      </div>
    </div>
  );
}
