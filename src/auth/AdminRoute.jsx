import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";
import { supabase } from "../supabase.js";

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  const [role, setRole] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setChecking(false);
      return;
    }
    supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        setRole(data?.role ?? "user");
        setChecking(false);
      });
  }, [user, loading]);

  if (loading || checking) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", background: "var(--bg-page)",
        fontSize: 14, color: "var(--fg3)",
      }}>
        확인 중…
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (role !== "admin") {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", background: "var(--bg-page)",
      }}>
        <div style={{
          background: "var(--bg-card)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)", padding: "40px 48px",
          textAlign: "center", maxWidth: 360,
        }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🔒</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: "var(--fg1)", marginBottom: 8 }}>
            접근 권한 없음
          </div>
          <div style={{ fontSize: 13, color: "var(--fg3)", marginBottom: 24 }}>
            이 페이지는 관리자만 접근할 수 있습니다.
          </div>
          <a href="/" style={{
            display: "inline-block", padding: "10px 24px",
            background: "var(--primary-500)", color: "#fff",
            borderRadius: "var(--radius-md)", fontSize: 13,
            fontWeight: 600, textDecoration: "none",
          }}>
            홈으로 돌아가기
          </a>
        </div>
      </div>
    );
  }

  return children;
}
