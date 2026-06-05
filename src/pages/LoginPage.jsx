import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase.js";
import { useAuth } from "../auth/AuthContext.jsx";

const REDIRECT = window.location.origin;

function Logo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center", marginBottom: 8 }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: "var(--primary-500)", display: "flex",
        alignItems: "center", justifyContent: "center",
      }}>
        <svg width="18" height="18" viewBox="0 0 14 14" fill="none">
          <path d="M7 1L9.5 5.5H12.5L10 8.5L11 13L7 10.5L3 13L4 8.5L1.5 5.5H4.5L7 1Z" fill="white" fillOpacity="0.9" />
        </svg>
      </div>
      <div>
        <div style={{ fontSize: 16, fontWeight: 700, color: "var(--fg1)", lineHeight: 1.2 }}>식품안전</div>
        <div style={{ fontSize: 12, color: "var(--fg3)", lineHeight: 1.2 }}>모니터링 대시보드</div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate("/", { replace: true });
  }, [user, loading, navigate]);

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: REDIRECT },
    });
  }


  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "var(--bg-page)",
    }}>
      <div style={{
        background: "var(--bg-card)", borderRadius: 16,
        boxShadow: "0 8px 40px rgba(0,0,0,0.10)", padding: "48px 40px",
        width: "100%", maxWidth: 360, textAlign: "center",
      }}>
        <Logo />

        <p style={{
          fontSize: 14, color: "var(--fg3)", marginTop: 16, marginBottom: 32, lineHeight: 1.6,
        }}>
          식품 안전 데이터를 한눈에.<br />팀 계정으로 바로 시작하세요.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button onClick={signInWithGoogle} style={{
            width: "100%", padding: "12px 16px", border: "1px solid var(--border-strong)",
            borderRadius: "var(--radius-md)", background: "#fff", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            fontSize: 14, fontWeight: 500, color: "var(--fg1)", transition: "background 0.15s",
          }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--gray-50)"}
            onMouseLeave={e => e.currentTarget.style.background = "#fff"}
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
            </svg>
            Google로 시작하기
          </button>

        </div>

        <p style={{ fontSize: 11, color: "var(--fg3)", marginTop: 28, lineHeight: 1.6 }}>
          로그인 시 서비스 이용약관 및 개인정보처리방침에 동의하는 것으로 간주됩니다.
        </p>
      </div>
    </div>
  );
}
