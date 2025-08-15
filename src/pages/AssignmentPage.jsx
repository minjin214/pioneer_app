import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./AssignmentPage.css";


export function AssignmentPage({ isAdmin = true, currentUser }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // 현재 로그인 사용자 (없으면 예시)
  const user = currentUser ?? { id: "u-0001", name: "홍길동" };

  // URL -> 카테고리
  const category = (() => {
    if (pathname.startsWith("/programming")) return "programming";
    if (pathname.startsWith("/study")) return "study";
    if (pathname.startsWith("/project")) return "project";
    return "programming";
  })();

  const TITLE = {
    programming: "프로그래밍 과제",
    study: "스터디 과제",
    project: "프로젝트 과제",
  }[category];

  const STORAGE_KEY = `assign_${category}_v1`;
  const SELECTED_KEY = `${STORAGE_KEY}__selected`;

  // 초기 더미 과제
  const seed = {
    programming: [
      { id: "p-1", title: "프로그래밍 #1", dueDate: "2025-08-27", submissions: [] },
    ],
    study: [
      { id: "s-1", title: "스터디 #1", dueDate: "2025-08-27", submissions: [] },
    ],
    project: [
      { id: "pr-1", title: "프로젝트 #1", dueDate: "2025-08-27", submissions: [] },
    ],
  }[category];

  // 목록 로드/저장
  const [list, setList] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : seed;
    } catch {
      return seed;
    }
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const next = raw ? JSON.parse(raw) : seed;
      setList(next);

      const savedSel = localStorage.getItem(SELECTED_KEY);
      if (savedSel && next.some(a => a.id === savedSel)) {
        setSelectedId(savedSel);
      } else {
        setSelectedId(next[0]?.id ?? null);
      }
    } catch {
      setList(seed);
      setSelectedId(seed[0]?.id ?? null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]); // category만 감시 (STORAGE_KEY/seed는 category로부터 파생)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }, [list, STORAGE_KEY]);

  // 선택/입력 상태
  const [selectedId, setSelectedId] = useState(list[0]?.id ?? null);
  const [newTitle, setNewTitle] = useState("");
  const [newDue, setNewDue] = useState("");
  const [submitUrl, setSubmitUrl] = useState("");

  useEffect(() => {
    if (selectedId && !list.find(a => a.id === selectedId)) {
      setSelectedId(list[0]?.id ?? null);
    }
  }, [list, selectedId]);

  useEffect(() => {
    if (selectedId) localStorage.setItem(SELECTED_KEY, selectedId);
  }, [selectedId, SELECTED_KEY]);

  const selected = useMemo(
    () => list.find((a) => a.id === selectedId) || null,
    [list, selectedId]
  );

  // URL 유효성
  const isValidUrl = (u) => {
    try {
      const x = new URL(u);
      return ["http:", "https:"].includes(x.protocol);
    } catch {
      return false;
    }
  };

  // 과제 추가(관리자)
  const addAssignment = (e) => {
    e.preventDefault();
    if (!newTitle || !newDue) return;
    setList((prev) => [
      { id: `${Date.now()}`, title: newTitle.trim(), dueDate: newDue, submissions: [] },
      ...prev,
    ]);
    setNewTitle("");
    setNewDue("");
  };

  // 제출(사용자) — 재제출 시 내 제출 덮어쓰기
  const submitLink = (e) => {
    e.preventDefault();
    if (!selected) return;
    if (!isValidUrl(submitUrl)) {
      alert("http/https 링크를 입력하세요.");
      return;
    }
    setList((prev) =>
      prev.map((a) => {
        if (a.id !== selected.id) return a;
        const next = [...a.submissions];
        const idx = next.findIndex((s) => s.userId === user.id);
        const payload = {
          userId: user.id,
          userName: user.name,
          url: submitUrl.trim(),
          submittedAt: new Date().toISOString(),
          status: "제출됨", // 기본 상태
          score: null,
          note: "",
        };
        if (idx >= 0) next[idx] = payload;
        else next.unshift(payload);
        return { ...a, submissions: next };
      })
    );
    setSubmitUrl("");
  };

  // 관리자: 상태/점수/메모 수정
  const updateSubmission = (userId, patch) => {
    setList((prev) =>
      prev.map((a) =>
        a.id !== selected?.id
          ? a
          : {
              ...a,
              submissions: a.submissions.map((s) =>
                s.userId === userId ? { ...s, ...patch } : s
              ),
            }
      )
    );
  };

  return (
    <div className="assign-container">
      <button className="back-btn" onClick={() => navigate("/main")}>
        ← 메인으로
      </button>
      <h2>📋 {TITLE}</h2>

      <div className="assign-grid">
        {/* 왼쪽: 과제 목록 + 추가 */}
        <aside className="panel">
          <h3>과제 목록</h3>
          <ul className="assn-list">
            {list.map((a) => (
              <li key={a.id}>
                <button
                  className={`assn-item ${selectedId === a.id ? "selected" : ""}`}
                  onClick={() => setSelectedId(a.id)}
                >
                  <span className="title">{a.title}</span>
                  <span className="due">마감: {a.dueDate}</span>
                </button>
              </li>
            ))}
            {list.length === 0 && <li className="muted">과제가 없습니다.</li>}
          </ul>

          {isAdmin && (
            <>
              <h4 className="mt12">새 과제 추가</h4>
              <form className="row" onSubmit={addAssignment}>
                <input
                  type="text"
                  placeholder="과제 제목"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />
                <input
                  type="date"
                  value={newDue}
                  onChange={(e) => setNewDue(e.target.value)}
                  required
                />
                <button className="primary">추가</button>
              </form>
            </>
          )}
        </aside>

        {/* 오른쪽: 상세/제출/현황 */}
        <main className="panel">
          {!selected ? (
            <p className="muted">왼쪽에서 과제를 선택하세요.</p>
          ) : (
            <>
              <h3>{selected.title}</h3>
              <p className="muted">마감일: {selected.dueDate}</p>

              <h4 className="mt12">과제 링크 제출</h4>
              <form className="row" onSubmit={submitLink}>
                <input
                  type="url"
                  placeholder="https:// 제출 링크"
                  value={submitUrl}
                  onChange={(e) => setSubmitUrl(e.target.value)}
                  required
                />
                <button className="primary">제출</button>
              </form>

              {/* 내 제출 요약 */}
              {selected.submissions.some((s) => s.userId === user.id) && (
                <div className="mine-box">
                  {selected.submissions
                    .filter((s) => s.userId === user.id)
                    .slice(0, 1)
                    .map((s) => (
                      <div key={s.userId} className="mine">
                        <a href={s.url} target="_blank" rel="noreferrer">
                          {s.url}
                        </a>
                        <span className="badge">{s.status}</span>
                        <span className="muted">
                          {new Date(s.submittedAt).toLocaleString()}
                        </span>
                        <div className="muted">
                          채점: {s.score != null ? `${s.score}점` : "없음"}{" "}
                          {s.note && `(${s.note})`}
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {isAdmin && (
                <>
                  <h4 className="mt12">제출 현황 / 채점</h4>
                  {selected.submissions.length === 0 ? (
                    <p className="muted">제출이 없습니다.</p>
                  ) : (
                    <table className="assn-table">
                      <thead>
                        <tr>
                          <th>이름</th>
                          <th>링크</th>
                          <th>제출 시각</th>
                          <th>상태</th>
                          <th>점수</th>
                          <th>메모</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selected.submissions.map((s) => (
                          <tr key={s.userId}>
                            <td>{s.userName}</td>
                            <td className="url">
                              <a href={s.url} target="_blank" rel="noreferrer">
                                {s.url}
                              </a>
                            </td>
                            <td>{new Date(s.submittedAt).toLocaleString()}</td>
                            <td>
                              <select
                                value={s.status}
                                onChange={(e) =>
                                  updateSubmission(s.userId, {
                                    status: e.target.value,
                                  })
                                }
                              >
                                <option>제출됨</option>
                                <option>검토중</option>
                                <option>확인됨</option>
                                <option>반려</option>
                              </select>
                            </td>
                            <td>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                placeholder="-"
                                value={s.score ?? ""}
                                onChange={(e) =>
                                  updateSubmission(s.userId, {
                                    score:
                                      e.target.value === ""
                                        ? null
                                        : Number(e.target.value),
                                  })
                                }
                                className="score"
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                placeholder="메모"
                                value={s.note || ""}
                                onChange={(e) =>
                                  updateSubmission(s.userId, {
                                    note: e.target.value,
                                  })
                                }
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default AssignmentPage;
