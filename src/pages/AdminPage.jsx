import { useState, useEffect } from "react";
import { supabase } from "../supabase.js";
import { useAuth } from "../auth/AuthContext.jsx";

export default function AdminPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("profiles")
      .select("id, role, created_at")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setUsers(data ?? []);
        setLoading(false);
      });
  }, []);

  async function toggleRole(userId, currentRole) {
    const nextRole = currentRole === "admin" ? "user" : "admin";
    await supabase.from("profiles").update({ role: nextRole }).eq("id", userId);
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: nextRole } : u));
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-page)" }}>
      {/* 헤더 */}
      <header style={{
        background: "var(--bg-card)", borderBottom: "1px solid var(--border)",
        padding: "0 32px", height: 52, display: "flex",
        alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <a href="/" style={{
            fontSize: 13, color: "var(--fg3)", textDecoration: "none",
            display: "flex", alignItems: "center", gap: 4,
          }}>
            ← 대시보드
          </a>
          <span style={{ color: "var(--border-strong)" }}>|</span>
          <span style={{ fontSize: 15, fontWeight: 600, color: "var(--fg1)" }}>관리자 설정</span>
        </div>
        <div style={{ fontSize: 12, color: "var(--fg3)" }}>
          {user?.email}
        </div>
      </header>

      <main style={{ padding: 32, maxWidth: 800 }}>
        {/* 계정 권한 관리 */}
        <section style={{
          background: "var(--bg-card)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)", overflow: "hidden",
        }}>
          <div style={{
            padding: "20px 24px", borderBottom: "1px solid var(--border)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--fg1)" }}>계정 권한 관리</div>
              <div style={{ fontSize: 12, color: "var(--fg3)", marginTop: 2 }}>
                사용자 권한을 admin / user 로 변경할 수 있습니다.
              </div>
            </div>
            <span style={{
              fontSize: 12, fontWeight: 500, padding: "4px 10px",
              background: "var(--primary-50)", color: "var(--primary-700)",
              borderRadius: "var(--radius-pill)",
            }}>
              {users.length}명
            </span>
          </div>

          {loading ? (
            <div style={{ padding: 32, textAlign: "center", color: "var(--fg3)", fontSize: 13 }}>
              불러오는 중…
            </div>
          ) : users.length === 0 ? (
            <div style={{ padding: 32, textAlign: "center", color: "var(--fg3)", fontSize: 13 }}>
              등록된 계정이 없습니다.
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--gray-50)" }}>
                  {["사용자 ID", "권한", "가입일", ""].map(h => (
                    <th key={h} style={{
                      padding: "10px 24px", textAlign: "left",
                      fontSize: 11, fontWeight: 600, color: "var(--fg3)",
                      letterSpacing: "0.04em", textTransform: "uppercase",
                      borderBottom: "1px solid var(--border)",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u.id} style={{
                    borderBottom: i < users.length - 1 ? "1px solid var(--border)" : "none",
                  }}>
                    <td style={{ padding: "12px 24px", fontSize: 12, color: "var(--fg3)", fontFamily: "monospace" }}>
                      {u.id.slice(0, 8)}…
                    </td>
                    <td style={{ padding: "12px 24px" }}>
                      <span style={{
                        fontSize: 12, fontWeight: 500, padding: "3px 8px", borderRadius: "var(--radius-pill)",
                        background: u.role === "admin" ? "var(--primary-50)" : "var(--gray-100)",
                        color: u.role === "admin" ? "var(--primary-700)" : "var(--fg3)",
                      }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: "12px 24px", fontSize: 12, color: "var(--fg3)" }}>
                      {new Date(u.created_at).toLocaleDateString("ko-KR")}
                    </td>
                    <td style={{ padding: "12px 24px" }}>
                      {u.id !== user?.id && (
                        <button
                          onClick={() => toggleRole(u.id, u.role)}
                          style={{
                            fontSize: 12, padding: "4px 12px", cursor: "pointer",
                            border: "1px solid var(--border-strong)", borderRadius: "var(--radius-sm)",
                            background: "transparent", color: "var(--fg2)",
                          }}
                        >
                          {u.role === "admin" ? "일반 사용자로" : "관리자로"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </div>
  );
}
