import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";
import { supabase } from "../supabase.js";

export default function ProtectedRoute({ children }) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", background: "var(--bg-page)",
        fontSize: 14, color: "var(--fg3)",
      }}>
        불러오는 중…
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (!profile || !profile.approved) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", background: "var(--bg-page)",
      }}>
        <div style={{
          background: "var(--bg-card)", border: "1px solid var(--border)",
          borderRadius: 16, padding: "48px 40px",
          textAlign: "center", maxWidth: 360,
        }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: "var(--fg1)", marginBottom: 8 }}>
            승인 대기 중
          </div>
          <div style={{ fontSize: 13, color: "var(--fg3)", marginBottom: 24, lineHeight: 1.7 }}>
            관리자의 접근 승인을 기다리고 있습니다.<br />
            승인 후 다시 로그인해 주세요.
          </div>
          <button
            onClick={() => supabase.auth.signOut()}
            style={{
              padding: "10px 24px", background: "transparent",
              border: "1px solid var(--border-strong)", borderRadius: "var(--radius-md)",
              fontSize: 13, color: "var(--fg2)", cursor: "pointer",
            }}
          >
            로그아웃
          </button>
        </div>
      </div>
    );
  }

  return children;
}
