import { useState, useRef, useEffect, useCallback } from "react";

const MAX_LENGTH = 2000;

/* ── 분석 결과 설정 ── */
const SENTIMENT = {
  positive: { label: "긍정", bg: "var(--color-success-bg)", color: "var(--color-success-text)" },
  negative: { label: "부정", bg: "var(--color-error-bg)",   color: "var(--color-error-text)" },
  neutral:  { label: "중립", bg: "var(--gray-100)",         color: "var(--fg2)" },
};
const URGENCY = {
  high:   { label: "높음", bg: "var(--color-error-bg)",   color: "var(--color-error-text)" },
  medium: { label: "보통", bg: "#FEF3C7",                  color: "#92400E" },
  low:    { label: "낮음", bg: "var(--color-success-bg)", color: "var(--color-success-text)" },
};
const CATEGORY = { quality: "품질", delivery: "배송", service: "서비스", price: "가격", other: "기타" };

/* ── 작은 헬퍼 컴포넌트 ── */
const Label = ({ children }) => (
  <span style={{ fontSize: 9, fontWeight: 700, color: "var(--fg3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6, display: "block" }}>
    {children}
  </span>
);

const Badge = ({ children, bg, color }) => (
  <span style={{ display: "inline-block", fontSize: 11, fontWeight: 600, background: bg, color, padding: "2px 8px", borderRadius: "var(--radius-pill)" }}>
    {children}
  </span>
);

const cardBase = {
  background: "var(--gray-50)", border: "1px solid var(--border)",
  borderRadius: "var(--radius-md)", padding: "10px 12px",
  display: "flex", flexDirection: "column",
};

/* ── 분석 결과 카드 ── */
function AnalysisCard({ result }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const s = SENTIMENT[result.sentiment.label];
  const u = URGENCY[result.urgency.level];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {/* 감정 + 요약 */}
      <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 6 }}>
        <div style={cardBase}>
          <Label>감정</Label>
          <Badge bg={s.bg} color={s.color}>{s.label}</Badge>
          <span style={{ fontSize: 10, color: "var(--fg3)", marginTop: 6 }}>강도 {result.sentiment.score}/5</span>
        </div>
        <div style={cardBase}>
          <Label>요약</Label>
          <p style={{ fontSize: 12, color: "var(--fg1)", lineHeight: 1.65, margin: 0 }}>{result.summary}</p>
        </div>
      </div>

      {/* 키워드 + 카테고리 + 긴급도 */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 80px 2fr", gap: 6 }}>
        <div style={cardBase}>
          <Label>키워드</Label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 2 }}>
            {result.keywords.map(kw => (
              <span key={kw} style={{
                fontSize: 10, background: "var(--primary-50)", color: "var(--primary-700)",
                padding: "2px 8px", borderRadius: "var(--radius-pill)", border: "1px solid var(--primary-100)",
              }}>{kw}</span>
            ))}
          </div>
        </div>
        <div style={cardBase}>
          <Label>카테고리</Label>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--fg1)" }}>{CATEGORY[result.category] ?? result.category}</span>
        </div>
        <div style={cardBase}>
          <Label>긴급도</Label>
          <Badge bg={u.bg} color={u.color}>{u.label}</Badge>
          <p style={{ fontSize: 10, color: "var(--fg3)", lineHeight: 1.5, margin: "6px 0 0" }}>{result.urgency.reason}</p>
        </div>
      </div>

      {/* JSON 복사 */}
      <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 2 }}>
        <button onClick={handleCopy} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: "var(--fg3)", padding: 0 }}>
          {copied ? "✓ 복사됨!" : "JSON 복사"}
        </button>
      </div>
    </div>
  );
}

/* ── 아이콘 아바타 ── */
const AiAvatar = () => (
  <div style={{
    width: 28, height: 28, borderRadius: "50%", background: "var(--primary-500)",
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2,
  }}>
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  </div>
);

/* ── 메시지 버블 ── */
function UserBubble({ text }) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
      <div style={{
        maxWidth: "65%", background: "var(--primary-500)", color: "#fff",
        padding: "10px 14px", borderRadius: "var(--radius-lg)", borderBottomRightRadius: 4,
        fontSize: 13, lineHeight: 1.65, whiteSpace: "pre-wrap", wordBreak: "break-word",
      }}>{text}</div>
    </div>
  );
}

function AiBubble({ result, error }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 14 }}>
      <AiAvatar />
      <div style={{ flex: 1, minWidth: 0 }}>
        {error ? (
          <div style={{
            background: "var(--color-error-bg)", border: "1px solid var(--red-200)",
            borderRadius: "var(--radius-lg)", borderTopLeftRadius: 4, padding: "10px 14px",
          }}>
            <p style={{ fontSize: 13, color: "var(--color-error-text)", margin: 0 }}>{error}</p>
            <p style={{ fontSize: 11, color: "var(--fg3)", margin: "4px 0 0" }}>다시 입력하여 재시도해주세요.</p>
          </div>
        ) : result ? (
          <div style={{
            background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)", borderTopLeftRadius: 4, padding: "12px 14px",
          }}>
            <AnalysisCard result={result} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function TypingBubble() {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 14 }}>
      <AiAvatar />
      <div style={{
        background: "var(--bg-card)", border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)", borderTopLeftRadius: 4,
        padding: "12px 14px", display: "flex", gap: 5, alignItems: "center",
      }}>
        {[0, 0.2, 0.4].map((delay, i) => (
          <span key={i} style={{
            width: 6, height: 6, background: "var(--gray-300)", borderRadius: "50%",
            display: "inline-block",
            animation: `voc-typing 1.2s ease-in-out ${delay}s infinite`,
          }} />
        ))}
      </div>
    </div>
  );
}

/* ── 초기 화면 ── */
function EmptyState() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center", padding: "0 24px" }}>
      <div style={{
        width: 44, height: 44, borderRadius: "var(--radius-lg)",
        background: "var(--primary-50)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14,
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary-500)" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </div>
      <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--fg1)", margin: "0 0 8px" }}>VOC 분석을 시작하세요</h3>
      <p style={{ fontSize: 12, color: "var(--fg3)", lineHeight: 1.7, margin: 0, maxWidth: 320 }}>
        고객 피드백 텍스트를 입력하면<br />
        감정 · 요약 · 키워드 · 카테고리 · 긴급도를 자동 분석합니다.
      </p>
      <div style={{
        marginTop: 18, background: "var(--bg-card)", border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)", padding: "14px 18px", maxWidth: 340, textAlign: "left",
      }}>
        <p style={{ fontSize: 9, fontWeight: 700, color: "var(--fg3)", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 8px" }}>예시 VOC</p>
        <p style={{ fontSize: 12, color: "var(--fg2)", lineHeight: 1.65, margin: 0 }}>
          배송이 너무 늦어서 실망했어요. 3일 기다렸는데 아직도 안 왔습니다. 빠른 처리 부탁드립니다.
        </p>
      </div>
    </div>
  );
}

/* ── 메인 컴포넌트 ── */
export default function VocScreen() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef(null);
  const bottomRef = useRef(null);

  const isOverLimit = input.length > MAX_LENGTH;
  const canSend = input.trim().length > 0 && !isLoading && !isOverLimit;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [input]);

  const handleSend = useCallback(async () => {
    if (!canSend) return;
    const text = input.trim();
    setInput("");
    setMessages(prev => [...prev, { id: crypto.randomUUID(), role: "user", text }]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessages(prev => [...prev, { id: crypto.randomUUID(), role: "assistant", error: data.message ?? "분석 중 오류가 발생했습니다." }]);
      } else {
        setMessages(prev => [...prev, { id: crypto.randomUUID(), role: "assistant", result: data }]);
      }
    } catch {
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: "assistant", error: "네트워크 오류가 발생했습니다." }]);
    } finally {
      setIsLoading(false);
    }
  }, [canSend, input]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* 타이핑 애니메이션 */}
      <style>{`
        @keyframes voc-typing {
          0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
          30% { opacity: 1; transform: translateY(-3px); }
        }
      `}</style>

      {/* 메시지 영역 */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 0" }}>
        {messages.length === 0 && !isLoading ? (
          <EmptyState />
        ) : (
          <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 4px" }}>
            {messages.map(msg => (
              msg.role === "user"
                ? <UserBubble key={msg.id} text={msg.text} />
                : <AiBubble key={msg.id} result={msg.result} error={msg.error} />
            ))}
            {isLoading && <TypingBubble />}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* 헤더 우측 초기화 버튼 — 메시지 있을 때만 */}
      {messages.length > 0 && (
        <div style={{
          position: "absolute", top: 14, right: 28,
          fontSize: 11, color: "var(--fg3)", cursor: "pointer",
        }}
          onClick={() => setMessages([])}
        >
          대화 초기화
        </div>
      )}

      {/* 입력 영역 */}
      <div style={{ flexShrink: 0, borderTop: "1px solid var(--border)", padding: "10px 0 12px", background: "var(--bg-card)" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{
            display: "flex", alignItems: "flex-end", gap: 10,
            border: `1px solid ${isOverLimit ? "var(--red-500)" : "var(--border-strong)"}`,
            borderRadius: "var(--radius-lg)", padding: "10px 12px",
            background: isOverLimit ? "var(--color-error-bg)" : "var(--gray-50)",
            transition: "border-color 0.15s",
          }}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="VOC를 붙여넣거나 입력하세요… (Enter 전송, Shift+Enter 줄바꿈)"
              disabled={isLoading}
              rows={1}
              style={{
                flex: 1, resize: "none", border: "none", background: "transparent",
                fontSize: 13, color: "var(--fg1)", outline: "none",
                fontFamily: "inherit", lineHeight: 1.6,
                opacity: isLoading ? 0.5 : 1,
              }}
            />
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
              <span style={{
                fontSize: 10, fontVariantNumeric: "tabular-nums",
                color: isOverLimit ? "var(--color-error-text)" : input.length >= 1800 ? "var(--red-500)" : "var(--fg3)",
                fontWeight: isOverLimit ? 600 : 400,
              }}>{input.length}/{MAX_LENGTH}</span>
              <button
                onClick={handleSend}
                disabled={!canSend}
                style={{
                  width: 30, height: 30, borderRadius: "var(--radius-md)",
                  background: canSend ? "var(--primary-500)" : "var(--gray-100)",
                  border: "none", cursor: canSend ? "pointer" : "not-allowed",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "background 0.15s",
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={canSend ? "white" : "var(--fg3)"} strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
