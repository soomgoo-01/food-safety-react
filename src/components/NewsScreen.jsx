import { useState } from "react";
import { GRADE_COLOR } from "../constants.js";
import { filterByPeriod, getHotKeywords } from "../utils.js";
import Badge from "./Badge.jsx";
import Tag from "./Tag.jsx";
import Btn from "./Btn.jsx";
import Modal from "./Modal.jsx";

const ACTION_STATUS_STYLE = {
  "검토중": { bg: "#fef9c3", text: "#92400e", border: "#fde68a" },
  "조치완료": { bg: "#f0fdf4", text: "#15803d", border: "#bbf7d0" },
  "해당없음": { bg: "#f3f4f6", text: "#6b7280", border: "#e5e7eb" },
};

const INITIAL_ACTIONS = {
  2: [{ id: 1, date: "2026-05-27", writer: "김안전", content: "자사 취급 참기름 L.safe 시험의뢰 완료, 결과 대기 중", status: "검토중" }],
  5: [
    { id: 1, date: "2026-05-25", writer: "이검사", content: "협력사 동해수산 명태포 해당 로트 입고 보류 조치", status: "조치완료" },
    { id: 2, date: "2026-05-26", writer: "김안전", content: "재입고 기준 강화 협의 완료", status: "조치완료" },
  ],
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
    const newEntry = { id: Date.now(), date: "2026-05-28", writer: inp.writer || "담당자", content: inp.content.trim(), status: inp.status || "검토중" };
    setActionMap(prev => ({ ...prev, [newsId]: [...(prev[newsId] || []), newEntry] }));
    setInputMap(prev => ({ ...prev, [newsId]: { writer: "", content: "", status: "검토중" } }));
  };

  const changeStatus = (newsId, actionId, newStatus) => {
    setActionMap(prev => ({ ...prev, [newsId]: prev[newsId].map(a => a.id === actionId ? { ...a, status: newStatus } : a) }));
  };

  const getLatestStatus = (newsId) => {
    const list = actionMap[newsId];
    if (!list || list.length === 0) return null;
    return list[list.length - 1].status;
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 600 }}>기간</span>
        {["1주", "1개월", "3개월", "전체"].map(p => (
          <Btn key={p} active={period === p} onClick={() => setPeriod(p)}>{p}</Btn>
        ))}
        <div style={{ width: 1, height: 20, background: "#e5e7eb", margin: "0 4px" }} />
        <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 600 }}>등급</span>
        {["전체", "3", "4", "5"].map(g => (
          <Btn key={g} active={gradeFilter === g} onClick={() => setGradeFilter(g)}>{g === "전체" ? "전체" : g + "등급 이상"}</Btn>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 240px", gap: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {displayed.length === 0
            ? <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 32, textAlign: "center", color: "#9ca3af" }}>
                해당 기간·조건에 맞는 뉴스가 없습니다
              </div>
            : displayed.map(newsItem => {
                const latestStatus = getLatestStatus(newsItem.id);
                const actions = actionMap[newsItem.id] || [];
                const isExpanded = expandedAction[newsItem.id];
                const inp = inputMap[newsItem.id] || { writer: "", content: "", status: "검토중" };
                const needAction = newsItem.grade >= 4;

                return (
                  <div key={newsItem.id} style={{ background: "#fff", borderRadius: 12, border: "1px solid", borderColor: newsItem.grade >= 4 ? "#fca5a5" : "#e5e7eb", borderLeft: `4px solid ${GRADE_COLOR[newsItem.grade]}`, overflow: "hidden" }}>
                    <div style={{ padding: "14px 18px" }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
                        <Badge grade={newsItem.grade} />
                        <span style={{ fontSize: 12, color: "#6b7280" }}>{newsItem.date}</span>
                        <Tag color="#eff6ff" text="#1d4ed8">{newsItem.foodType}</Tag>
                        {needAction && latestStatus && (
                          <span style={{ padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: ACTION_STATUS_STYLE[latestStatus].bg, color: ACTION_STATUS_STYLE[latestStatus].text, border: `1px solid ${ACTION_STATUS_STYLE[latestStatus].border}` }}>{latestStatus}</span>
                        )}
                        {needAction && !latestStatus && (
                          <span style={{ padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: "#fef2f2", color: "#dc2626", border: "1px solid #fca5a5" }}>조치 필요</span>
                        )}
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#111", marginBottom: 8 }}>{newsItem.title}</div>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: needAction ? 8 : 0 }}>
                        {newsItem.keyword.map(kw => (
                          <Tag key={kw} color={hotSet.has(kw) ? "#fef9c3" : "#f3f4f6"} text={hotSet.has(kw) ? "#92400e" : "#374151"}>
                            #{kw}{hotSet.has(kw) ? " 🔥" : ""}
                          </Tag>
                        ))}
                      </div>
                      {newsItem.grade >= 4 && (
                        <div style={{ fontSize: 11, color: "#6b7280", background: "#fef2f2", borderRadius: 6, padding: "4px 8px" }}>
                          LLM 판정 근거: 회수·리콜 조치 또는 인명 영향 관련 키워드 감지됨
                        </div>
                      )}
                    </div>

                    {needAction && (
                      <div style={{ borderTop: "1px solid #f3f4f6", background: "#fafafa" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 18px", cursor: "pointer" }}
                          onClick={() => setExpandedAction(prev => ({ ...prev, [newsItem.id]: !prev[newsItem.id] }))}>
                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>조치사항</span>
                            {actions.length > 0 && (
                              <span style={{ fontSize: 11, background: "#e5e7eb", color: "#6b7280", borderRadius: 20, padding: "1px 8px", fontWeight: 600 }}>{actions.length}건</span>
                            )}
                            {actions.length > 0 && (
                              <button onClick={e => { e.stopPropagation(); setHistoryModal(newsItem.id); }}
                                style={{ fontSize: 11, color: "#2563eb", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", padding: 0 }}>
                                전체이력
                              </button>
                            )}
                          </div>
                          <span style={{ fontSize: 12, color: "#9ca3af" }}>{isExpanded ? "▲" : "▼"}</span>
                        </div>

                        {isExpanded && (
                          <div style={{ padding: "0 18px 14px" }}>
                            {actions.length > 0 && (
                              <div style={{ marginBottom: 12 }}>
                                {actions.slice(-1).map(a => (
                                  <div key={a.id} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 12px", marginBottom: 4 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                        <span style={{ fontSize: 12, fontWeight: 600, color: "#111" }}>{a.writer}</span>
                                        <span style={{ fontSize: 11, color: "#9ca3af" }}>{a.date}</span>
                                      </div>
                                      <select value={a.status} onChange={e => changeStatus(newsItem.id, a.id, e.target.value)}
                                        style={{ fontSize: 11, border: "1px solid #e5e7eb", borderRadius: 6, padding: "2px 6px", background: ACTION_STATUS_STYLE[a.status].bg, color: ACTION_STATUS_STYLE[a.status].text, fontWeight: 600, cursor: "pointer" }}>
                                        {["검토중", "조치완료", "해당없음"].map(s => <option key={s}>{s}</option>)}
                                      </select>
                                    </div>
                                    <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.5 }}>{a.content}</div>
                                  </div>
                                ))}
                                {actions.length > 1 && (
                                  <div style={{ fontSize: 11, color: "#6b7280", textAlign: "center", padding: "4px 0" }}>
                                    이전 {actions.length - 1}건 · <span style={{ color: "#2563eb", cursor: "pointer", textDecoration: "underline" }} onClick={() => setHistoryModal(newsItem.id)}>전체 이력 보기</span>
                                  </div>
                                )}
                              </div>
                            )}
                            <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: 12 }}>
                              <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>새 조치사항 입력</div>
                              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                                <input placeholder="담당자" value={inp.writer}
                                  onChange={e => setInputMap(prev => ({ ...prev, [newsItem.id]: { ...inp, writer: e.target.value } }))}
                                  style={{ width: 90, border: "1px solid #e5e7eb", borderRadius: 6, padding: "5px 8px", fontSize: 12 }} />
                                <select value={inp.status || "검토중"}
                                  onChange={e => setInputMap(prev => ({ ...prev, [newsItem.id]: { ...inp, status: e.target.value } }))}
                                  style={{ border: "1px solid #e5e7eb", borderRadius: 6, padding: "5px 8px", fontSize: 12, background: ACTION_STATUS_STYLE[inp.status || "검토중"].bg, color: ACTION_STATUS_STYLE[inp.status || "검토중"].text, fontWeight: 600 }}>
                                  {["검토중", "조치완료", "해당없음"].map(s => <option key={s}>{s}</option>)}
                                </select>
                              </div>
                              <div style={{ display: "flex", gap: 8 }}>
                                <textarea placeholder="조치 내용 입력 (예: 자사 취급 제품 확인 완료, 협력사에 시정 요청 등)"
                                  value={inp.content || ""}
                                  onChange={e => setInputMap(prev => ({ ...prev, [newsItem.id]: { ...inp, content: e.target.value } }))}
                                  rows={2}
                                  style={{ flex: 1, border: "1px solid #e5e7eb", borderRadius: 6, padding: "6px 8px", fontSize: 12, resize: "none", fontFamily: "inherit" }} />
                                <button onClick={() => addAction(newsItem.id)}
                                  style={{ padding: "0 16px", background: "#111", color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
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
              })
          }
        </div>

        <div>
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 16, position: "sticky", top: 0, marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#111", marginBottom: 2 }}>위험 키워드</div>
            <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 14 }}>{period} 내 2회 이상 반복 등장</div>
            {hotKeywords.length === 0
              ? <div style={{ color: "#9ca3af", fontSize: 12, textAlign: "center", padding: 16 }}>반복 키워드 없음</div>
              : hotKeywords.map(([kw, cnt], i) => (
                <div key={kw} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", borderRadius: 8, marginBottom: 6, background: i === 0 ? "#fef9c3" : i === 1 ? "#fef2f2" : "#f9fafb", border: i < 2 ? "1px solid #fde68a" : "1px solid #f3f4f6" }}>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <span style={{ fontSize: 13 }}>{i === 0 ? "🔥" : i === 1 ? "⚠️" : "•"}</span>
                    <span style={{ fontSize: 13, fontWeight: i < 2 ? 700 : 500, color: "#111" }}>#{kw}</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: i === 0 ? "#92400e" : i === 1 ? "#dc2626" : "#6b7280" }}>{cnt}회</span>
                </div>
              ))
            }
            <div style={{ marginTop: 12, fontSize: 11, color: "#9ca3af", borderTop: "1px solid #f3f4f6", paddingTop: 10 }}>
              🔥 뉴스 카드의 노란 태그 = 반복 키워드
            </div>
          </div>

          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#111", marginBottom: 12 }}>조치 현황 요약</div>
            {(() => {
              const highNews = news.filter(n => n.grade >= 4);
              const pending = highNews.filter(n => !getLatestStatus(n.id) || (getLatestStatus(n.id) === "검토중"));
              const done = highNews.filter(n => getLatestStatus(n.id) === "조치완료");
              const na = highNews.filter(n => getLatestStatus(n.id) === "해당없음");
              return (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {[
                    { label: "조치 필요", cnt: pending.length, bg: "#fef2f2", text: "#dc2626" },
                    { label: "조치완료", cnt: done.length, bg: "#f0fdf4", text: "#15803d" },
                    { label: "해당없음", cnt: na.length, bg: "#f3f4f6", text: "#6b7280" },
                  ].map(s => (
                    <div key={s.label} style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", borderRadius: 8, background: s.bg }}>
                      <span style={{ fontSize: 12, color: s.text, fontWeight: 600 }}>{s.label}</span>
                      <span style={{ fontSize: 14, fontWeight: 800, color: s.text }}>{s.cnt}건</span>
                    </div>
                  ))}
                  <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>4~5등급 뉴스 기준</div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {historyModal && (
        <Modal title={`뉴스 #${historyModal} 조치 전체 이력`} onClose={() => setHistoryModal(null)}>
          {(actionMap[historyModal] || []).map((a) => (
            <div key={a.id} style={{ background: "#f9fafb", borderRadius: 8, padding: "10px 14px", marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <div style={{ display: "flex", gap: 8 }}>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{a.writer}</span>
                  <span style={{ fontSize: 11, color: "#9ca3af" }}>{a.date}</span>
                </div>
                <span style={{ padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 600, background: ACTION_STATUS_STYLE[a.status].bg, color: ACTION_STATUS_STYLE[a.status].text }}>{a.status}</span>
              </div>
              <div style={{ fontSize: 13, color: "#374151" }}>{a.content}</div>
            </div>
          ))}
        </Modal>
      )}
    </div>
  );
}
