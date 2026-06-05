const TOSS_CONFIRM_URL = "https://api.tosspayments.com/v1/payments/confirm";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { paymentKey, orderId, amount } = req.body ?? {};

  if (!paymentKey || !orderId || !amount) {
    return res.status(400).json({ error: "invalid_input", message: "필수 파라미터가 없습니다." });
  }

  const secretKey = process.env.TOSS_SECRET_KEY;
  if (!secretKey) {
    return res.status(500).json({ error: "server_error", message: "결제 서버 설정 오류입니다." });
  }

  const credentials = Buffer.from(`${secretKey}:`).toString("base64");

  try {
    const tossRes = await fetch(TOSS_CONFIRM_URL, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ paymentKey, orderId, amount }),
    });

    const data = await tossRes.json();

    if (!tossRes.ok) {
      return res.status(tossRes.status).json({
        error: data.code ?? "toss_error",
        message: data.message ?? "결제 승인에 실패했습니다.",
      });
    }

    return res.status(200).json({ success: true, payment: data });
  } catch (err) {
    console.error("[payment-confirm] error:", err.message);
    return res.status(502).json({ error: "upstream_error", message: "결제 서버 연결 오류입니다." });
  }
}
