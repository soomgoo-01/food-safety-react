import { useState } from "react";
import { filterByPeriod, getHotKeywords } from "../utils.js";
import Badge from "./Badge.jsx";
import Tag from "./Tag.jsx";
import Btn from "./Btn.jsx";
import Modal from "./Modal.jsx";

// grade별 왼쪽 보더 색상 (토큰 미지원 → 리터럴 유지)
const GRADE_LEFT = { 5: "#D0302F", 4: "#E05C3F", 3: "#E9A03B", 2: "#1A8754", 1: "#888680" };

const ACTION_STYLE = {
  "검토중":  { bg: "#FEF9C3", text: "#92400E", border: "#FDE68A" },
  "조치완료":{ bg: "var(--color-success-bg)", text: "var(--color-success-text)", border: "var(--primary-100)" },
  "해당없음":{ bg: "var(--gray-100)", text: "var(--fg3)", border: "var(--border)" },
};

const INITIAL_ACTIONS = {
  2: [{ id: 1, date: "2026-05-27", writer: "김안전", content: "자사 취급 참기름 L.safe 시험의뢰 완료, 결과 대기 중", status: "검토중" }],
  5: [
    { id: 1, date: "2026-05-25", writer: "이검사", content: "협력사 동해수산 명태포 해당 로트 입고 보류 조치", status: "조치완료" },
    { id: 2, date: "2026-05-26", writer: "김안전", content: "재입고 기준 강화 협의 완료", status: "조치완료" },
  ],
};

const inputStyle = {
  border: "1px solid var(--border-strong)", borderRadius: "var(--radius-sm)",
  padding: "5px 8px", fontSize: 12, background: "var(--bg-card)", color: "var(--fg1)",
};

export default function NewsScreen({ news }) {
  const [period, setPeriod] = useState("1주");
  const [gradeFilter, setGradeFilter] = useState("전체");
  const [actionMap, setActionMap] = useState(INITIAL_ACTIONS);
  const [expandedAction, setExpandedAction] = useState({});
  const [inputMap, setInputMap] = useState({});
  const [historyModal, setHistoryModal] = useState(null);

  const periodFiltered = filterByPeriod(news, period);
  const displayed = gradeFilter === "전체" ? periodFiltered : periodFiltered.filter(n => n.grade >= parseInt(gradeFilter));
  const hotKeywords = getHotKeywords(periodFiltered);
  const hotSet = new Set(hotKeywords.map(([k]) => k));

  const addAction = (newsId) => {
    const inp = inputMap[newsId] || {};
    if (!inp.content?.trim()) return;
    setActionMap(prev => ({ ...prev, [newsId]: [...(prev[newsId] || []), { id: Date.now(), date: "2026-05-28", writer: inp.writer || "담당자", content: inp.content.trim(), status: inp.status || "검토중" }] }));
    setInputMap(prev => ({ ...prev, [newsId]: { writer: "", content: "", status: "검토중" } }));
  };

  const changeStatus = (newsId, actionId, newStatus) =>
    setActionMap(prev => ({ ...prev, [newsId]: prev[newsId].map(a => a.id === actionId ? { ...a, status: newStatus } : a) }));

  const getLatestStatus = (newsId) => {
    const list = actionMap[newsId];
    return list?.length ? list[list.length - 1].status : null;
  };

  return (
    <div>
      {/* 필터 바 */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: 12, color: "var(--fg3)", fontWeight: 600 }}>기간</span>
        {["1주", "1개월", "3개월", "전체"].map(p => <Btn key={p} active={period === p} onClick={() => setPeriod(p)}>{p}</Btn>)}
        <div style={{ width: 1, height: 20, background: "var(--border)", margin: "0 4px" }} />
        <span style={{ fontSize: 12, color: "var(--fg3)", fontWeight: 600 }}>등급</span>
        {["전체", "3", "4", "5"].map(g => (
          <Btn key={g} active={gradeFilter === g} onClick={() => setGradeFilter(g)}>{g === "전체" ? "전체" : `${g}등급 이상`}</Btn>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 240px", gap: 16 }}>
        {/* 뉴스 목록 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {displayed.length === 0
            ? <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 32, textAlign: "center", color: "var(--fg3)" }}>
                해당 기간·조건에 맞는 뉴스가 없습니다
              </div>
            : displayed.map(newsItem => {
                const latestStatus = getLatestStatus(newsItem.id);
                const actions = actionMap[newsItem.id] || [];
                const isExpanded = expandedAction[newsItem.id];
                const inp = inputMap[newsItem.id] || { writer: "", content: "", status: "검토중" };
                const needAction = newsItem.grade >= 4;

                return (
                  <div key={newsItem.id} style={{
                    background: "var(--bg-card)", borderRadius: "var(--radius-lg)",
                    border: `1px solid ${newsItem.grade >= 4 ? "var(--red-200)" : "var(--border)"}`,
                    borderLeft: `4px solid ${GRADE_LEFT[newsItem.grade] ?? GRADE_LEFT[1]}`,
                    overflow: "hidden",
                  }}>
                    <div style={{ padding: "14px 18px" }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
                        <Badge grade={newsItem.grade} />
                        <span style={{ fontSize: 12, color: "var(--fg3)" }}>{newsItem.date}</span>
                        <Tag color="var(--color-info-bg)" text="var(--color-info-text)">{newsItem.foodType}</Tag>
                        {needAction && latestStatus && (
                          <span style={{ padding: "2px 10px", borderRadius: "var(--radius-pill)", fontSize: 11, fontWeight: 600, background: ACTION_STYLE[latestStatus].bg, color: ACTION_STYLE[latestStatus].text, border: `1px solid ${ACTION_STYLE[latestStatus].border}` }}>{latestStatus}</span>
                        )}
                        {needAction && !latestStatus && (
                          <span style={{ padding: "2px 10px", borderRadius: "var(--radius-pill)", fontSize: 11, fontWeight: 600, background: "var(--color-error-bg)", color: "var(--color-error-text)", border: "1px solid var(--red-200)" }}>조치 필요</span>
                        )}
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--fg1)", marginBottom: 8, lineHeight: 1.5 }}>{newsItem.title}</div>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: needAction ? 8 : 0 }}>
                        {newsItem.keyword.map(kw => (
                          <Tag key={kw} color={hotSet.has(kw) ? "#FEF9C3" : "var(--gray-100)"} text={hotSet.has(kw) ? "#92400E" : "var(--fg2)"}>
                            #{kw}{hotSet.has(kw) ? " 🔥" : ""}
                          </Tag>
                        ))}
                      </div>
                      {newsItem.grade >= 4 && (
                        <div style={{ fontSize: 11, color: "var(--fg3)", background: "var(--color-error-bg)", borderRadius: "var(--radius-sm)", padding: "4px 8px" }}>
                          LLM 판정 근거: 회수·리콜 조치 또는 인명 영향 관련 키워드 감지됨
                        </div>
                      )}
                    </div>

                    {needAction && (
                      <div style={{ borderTop: "1px solid var(--border)", background: "var(--gray-50)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 18px", cursor: "pointer" }}
                          onClick={() => setExpandedAction(prev => ({ ...prev, [newsItem.id]: !prev[newsItem.id] }))}>
                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--fg2)" }}>조치사항</span>
                            {actions.length > 0 && (
                              <span style={{ fontSize: 11, background: "var(--gray-100)", color: "var(--fg3)", borderRadius: "var(--radius-pill)", padding: "1px 8px", fontWeight: 600 }}>{actions.length}건</span>
                            )}
                            {actions.length > 0 && (
                              <button onClick={e => { e.stopPropagation(); setHistoryModal(newsItem.id); }}
                                style={{ fontSize: 11, color: "var(--primary-500)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", padding: 0 }}>
                                전체이력
                              </button>
                            )}
                          </div>
                          <span style={{ fontSize: 12, color: "var(--fg3)" }}>{isExpanded ? "▲" : "▼"}</span>
                        </div>

                        {isExpanded && (
                          <div style={{ padding: "0 18px 14px" }}>
                            {actions.length > 0 && (
                              <div style={{ marginBottom: 12 }}>
                                {actions.slice(-1).map(a => (
                                  <div key={a.id} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "10px 12px", marginBottom: 4 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--fg1)" }}>{a.writer}</span>
                                        <span style={{ fontSize: 11, color: "var(--fg3)" }}>{a.date}</span>
                                      </div>
                                      <select value={a.status} onChange={e => changeStatus(newsItem.id, a.id, e.target.value)}
                                        style={{ ...inputStyle, background: ACTION_STYLE[a.status].bg, color: ACTION_STYLE[a.status].text, fontWeight: 600, cursor: "pointer" }}>
                                        {["검토중", "조치완료", "해당없음"].map(s => <option key={s}>{s}</option>)}
                                      </select>
                                    </div>
                                    <div style={{ fontSize: 13, color: "var(--fg2)", lineHeight: 1.5 }}>{a.content}</div>
                                  </div>
                                ))}
                                {actions.length > 1 && (
                                  <div style={{ fontSize: 11, color: "var(--fg3)", textAlign: "center", padding: "4px 0" }}>
                                    이전 {actions.length - 1}건 · <span style={{ color: "var(--primary-500)", cursor: "pointer", textDecoration: "underline" }} onClick={() => setHistoryModal(newsItem.id)}>전체 이력 보기</span>
                                  </div>
                                )}
                              </div>
                            )}
                            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: 12 }}>
                              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--fg3)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>새 조치사항 입력</div>
                              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                                <input placeholder="담당자" value={inp.writer}
                                  onChange={e => setInputMap(prev => ({ ...prev, [newsItem.id]: { ...inp, writer: e.target.value } }))}
                                  style={{ ...inputStyle, width: 90 }} />
                                <select value={inp.status || "검토중"}
                                  onChange={e => setInputMap(prev => ({ ...prev, [newsItem.id]: { ...inp, status: e.target.value } }))}
                                  style={{ ...inputStyle, background: ACTION_STYLE[inp.status || "검토중"].bg, color: ACTION_STYLE[inp.status || "검토중"].text, fontWeight: 600 }}>
                                  {["검토중", "조치완료", "해당없음"].map(s => <option key={s}>{s}</option>)}
                                </select>
                              </div>
                              <div style={{ display: "flex", gap: 8 }}>
                                <textarea placeholder="조치 내용 입력"
                                  value={inp.content || ""}
                                  onChange={e => setInputMap(prev => ({ ...prev, [newsItem.id]: { ...inp, content: e.target.value } }))}
                                  rows={2}
                                  style={{ ...inputStyle, flex: 1, resize: "none" }} />
                                <button onClick={() => addAction(newsItem.id)}
                                  style={{ padding: "0 16px", background: "var(--primary-500)", color: "#fff", border: "none", borderRadius: "var(--radius-md)", fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
                                  저장
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
        </div>

        {/* 사이드 패널 */}
        <div>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 16, position: "sticky", top: 0, marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--fg1)", marginBottom: 2 }}>위험 키워드</div>
            <div style={{ fontSize: 11, color: "var(--fg3)", marginBottom: 14 }}>{period} 내 2회 이상 반복 등장</div>
            {hotKeywords.length === 0
              ? <div style={{ color: "var(--fg3)", fontSize: 12, textAlign: "center", padding: 16 }}>반복 키워드 없음</div>
              : hotKeywords.map(([kw, cnt], i) => (
                <div key={kw} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", borderRadius: "var(--radius-md)", marginBottom: 6, background: i === 0 ? "#FEF9C3" : i === 1 ? "var(--color-error-bg)" : "var(--gray-50)", border: `1px solid ${i < 2 ? "#FDE68A" : "var(--border)"}` }}>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <span style={{ fontSize: 13 }}>{i === 0 ? "🔥" : i === 1 ? "⚠️" : "•"}</span>
                    <span style={{ fontSize: 13, fontWeight: i < 2 ? 700 : 500, color: "var(--fg1)" }}>#{kw}</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: i === 0 ? "#92400E" : i === 1 ? "var(--color-error-text)" : "var(--fg3)" }}>{cnt}회</span>
                </div>
              ))
            }
            <div style={{ marginTop: 12, fontSize: 11, color: "var(--fg3)", borderTop: "1px solid var(--border)", paddingTop: 10 }}>
              🔥 뉴스 카드의 노란 태그 = 반복 키워드
            </div>
          </div>

          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--fg1)", marginBottom: 12 }}>조치 현황 요약</div>
            {(() => {
              const highNews = news.filter(n => n.grade >= 4);
              const pending = highNews.filter(n => !getLatestStatus(n.id) || getLatestStatus(n.id) === "검토중");
              const done = highNews.filter(n => getLatestStatus(n.id) === "조치완료");
              const na = highNews.filter(n => getLatestStatus(n.id) === "해당없음");
              return (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {[
                    { label: "조치 필요", cnt: pending.length, bg: "var(--color-error-bg)", text: "var(--color-error-text)" },
                    { label: "조치완료",  cnt: done.length,    bg: "var(--color-success-bg)", text: "var(--color-success-text)" },
                    { label: "해당없음",  cnt: na.length,      bg: "var(--gray-100)", text: "var(--fg3)" },
                  ].map(s => (
                    <div key={s.label} style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", borderRadius: "var(--radius-md)", background: s.bg }}>
                      <span style={{ fontSize: 12, color: s.text, fontWeight: 600 }}>{s.label}</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: s.text, fontVariantNumeric: "tabular-nums" }}>{s.cnt}건</span>
                    </div>
                  ))}
                  <div style={{ fontSize: 11, color: "var(--fg3)", marginTop: 4 }}>4~5등급 뉴스 기준</div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {historyModal && (
        <Modal title={`뉴스 #${historyModal} 조치 전체 이력`} onClose={() => setHistoryModal(null)}>
          {(actionMap[historyModal] || []).map(a => (
            <div key={a.id} style={{ background: "var(--gray-50)", borderRadius: "var(--radius-md)", padding: "10px 14px", marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <div style={{ display: "flex", gap: 8 }}>
                  <span style={{ fontWeight: 600, fontSize: 13, color: "var(--fg1)" }}>{a.writer}</span>
                  <span style={{ fontSize: 11, color: "var(--fg3)" }}>{a.date}</span>
                </div>
                <span style={{ padding: "2px 8px", borderRadius: "var(--radius-pill)", fontSize: 11, fontWeight: 600, background: ACTION_STYLE[a.status].bg, color: ACTION_STYLE[a.status].text }}>{a.status}</span>
              </div>
              <div style={{ fontSize: 13, color: "var(--fg2)" }}>{a.content}</div>
            </div>
          ))}
        </Modal>
      )}
    </div>
  );
}
