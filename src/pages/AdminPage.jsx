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
      .select("id, role, approved, created_at")
      .order("approved")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setUsers(data ?? []);
        setLoading(false);
      });
  }, []);

  async function toggleApproved(userId, current) {
    await supabase.from("profiles").update({ approved: !current }).eq("id", userId);
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, approved: !current } : u));
  }

  async function toggleRole(userId, currentRole) {
    const next = currentRole === "admin" ? "user" : "admin";
    await supabase.from("profiles").update({ role: next }).eq("id", userId);
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: next } : u));
  }

  const pending = users.filter(u => !u.approved);
  const approved = users.filter(u => u.approved);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-page)" }}>
      <header style={{
        background: "var(--bg-card)", borderBottom: "1px solid var(--border)",
        padding: "0 32px", height: 52, display: "flex",
        alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <a href="/" style={{ fontSize: 13, color: "var(--fg3)", textDecoration: "none" }}>
            ← 대시보드
          </a>
          <span style={{ color: "var(--border-strong)" }}>|</span>
          <span style={{ fontSize: 15, fontWeight: 600, color: "var(--fg1)" }}>관리자 설정</span>
        </div>
        <div style={{ fontSize: 12, color: "var(--fg3)" }}>{user?.email}</div>
      </header>

      <main style={{ padding: 32, maxWidth: 800, display: "flex", flexDirection: "column", gap: 24 }}>

        {/* 승인 대기 */}
        {!loading && pending.length > 0 && (
          <section style={{
            background: "var(--bg-card)", border: "1px solid var(--red-200)",
            borderRadius: "var(--radius-lg)", overflow: "hidden",
          }}>
            <div style={{
              padding: "16px 24px", borderBottom: "1px solid var(--border)",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: "var(--color-error)" }}>승인 대기</span>
              <span style={{
                fontSize: 11, fontWeight: 600, padding: "2px 8px",
                background: "var(--color-error-bg)", color: "var(--color-error)",
                borderRadius: "var(--radius-pill)",
              }}>{pending.length}</span>
            </div>
            <UserTable
              users={pending}
              currentUserId={user?.id}
              onToggleApproved={toggleApproved}
              onToggleRole={toggleRole}
            />
          </section>
        )}

        {/* 승인된 계정 */}
        <section style={{
          background: "var(--bg-card)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)", overflow: "hidden",
        }}>
          <div style={{
            padding: "16px 24px", borderBottom: "1px solid var(--border)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--fg1)" }}>계정 권한 관리</div>
            <span style={{
              fontSize: 11, fontWeight: 500, padding: "3px 8px",
              background: "var(--primary-50)", color: "var(--primary-700)",
              borderRadius: "var(--radius-pill)",
            }}>{approved.length}명</span>
          </div>
          {loading ? (
            <div style={{ padding: 32, textAlign: "center", color: "var(--fg3)", fontSize: 13 }}>불러오는 중…</div>
          ) : approved.length === 0 ? (
            <div style={{ padding: 32, textAlign: "center", color: "var(--fg3)", fontSize: 13 }}>승인된 계정이 없습니다.</div>
          ) : (
            <UserTable
              users={approved}
              currentUserId={user?.id}
              onToggleApproved={toggleApproved}
              onToggleRole={toggleRole}
            />
          )}
        </section>
      </main>
    </div>
  );
}

function UserTable({ users, currentUserId, onToggleApproved, onToggleRole }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr style={{ background: "var(--gray-50)" }}>
          {["사용자 ID", "권한", "상태", "가입일", ""].map(h => (
            <th key={h} style={{
              padding: "10px 20px", textAlign: "left",
              fontSize: 11, fontWeight: 600, color: "var(--fg3)",
              letterSpacing: "0.04em", textTransform: "uppercase",
              borderBottom: "1px solid var(--border)",
            }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {users.map((u, i) => (
          <tr key={u.id} style={{ borderBottom: i < users.length - 1 ? "1px solid var(--border)" : "none" }}>
            <td style={{ padding: "12px 20px", fontSize: 12, color: "var(--fg3)", fontFamily: "monospace" }}>
              {u.id.slice(0, 8)}…
            </td>
            <td style={{ padding: "12px 20px" }}>
              <span style={{
                fontSize: 12, fontWeight: 500, padding: "3px 8px",
                borderRadius: "var(--radius-pill)",
                background: u.role === "admin" ? "var(--primary-50)" : "var(--gray-100)",
                color: u.role === "admin" ? "var(--primary-700)" : "var(--fg3)",
              }}>
                {u.role}
              </span>
            </td>
            <td style={{ padding: "12px 20px" }}>
              <span style={{
                fontSize: 12, fontWeight: 500, padding: "3px 8px",
                borderRadius: "var(--radius-pill)",
                background: u.approved ? "var(--color-success-bg)" : "var(--color-error-bg)",
                color: u.approved ? "var(--color-success-text)" : "var(--color-error-text)",
              }}>
                {u.approved ? "승인됨" : "대기 중"}
              </span>
            </td>
            <td style={{ padding: "12px 20px", fontSize: 12, color: "var(--fg3)" }}>
              {new Date(u.created_at).toLocaleDateString("ko-KR")}
            </td>
            <td style={{ padding: "12px 20px" }}>
              {u.id !== currentUserId && (
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => onToggleApproved(u.id, u.approved)} style={{
                    fontSize: 12, padding: "4px 10px", cursor: "pointer",
                    border: "1px solid var(--border-strong)", borderRadius: "var(--radius-sm)",
                    background: u.approved ? "var(--color-error-bg)" : "var(--color-success-bg)",
                    color: u.approved ? "var(--color-error-text)" : "var(--color-success-text)",
                  }}>
                    {u.approved ? "차단" : "승인"}
                  </button>
                  {u.approved && (
                    <button onClick={() => onToggleRole(u.id, u.role)} style={{
                      fontSize: 12, padding: "4px 10px", cursor: "pointer",
                      border: "1px solid var(--border-strong)", borderRadius: "var(--radius-sm)",
                      background: "transparent", color: "var(--fg2)",
                    }}>
                      {u.role === "admin" ? "일반으로" : "관리자로"}
                    </button>
                  )}
                </div>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
