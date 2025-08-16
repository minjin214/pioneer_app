import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./AssignmentPage.css";
import API from "../api";

function AssignmentPage({ isAdmin = true, currentUser }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // 로그인 사용자 (없으면 예시)
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

  const [list, setList] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  // 입력 상태
  const [newTitle, setNewTitle] = useState("");
  const [newDue, setNewDue] = useState("");
  const [submitUrl, setSubmitUrl] = useState("");

  // 과제 불러오기
  const fetchAssignments = async () => {
    try {
      const res = await API.get(`/assignments?category=${category}`);
      setList(res.data);
      if (res.data.length > 0) {
        setSelectedId(res.data[0].id);
      }
    } catch (err) {
      console.error("과제 불러오기 실패", err);
    }
  };

  useEffect(() => {
    fetchAssignments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  const selected = list.find((a) => a.id === selectedId) || null;

  // 과제 추가
  const addAssignment = async (e) => {
    e.preventDefault();
    if (!newTitle || !newDue) return;
    try {
      await API.post("/assignments", {
        title: newTitle,
        dueDate: newDue,
        category,
      });
      setNewTitle("");
      setNewDue("");
      fetchAssignments();
    } catch (err) {
      console.error("과제 추가 실패", err);
    }
  };

  // 과제 제출
  const submitLink = async (e) => {
    e.preventDefault();
    if (!selected) return;
    try {
      await API.post(`/assignments/${selected.id}/submissions`, {
        userId: user.id,
        userName: user.name,
        url: submitUrl,
      });
      setSubmitUrl("");
      fetchAssignments();
    } catch (err) {
      console.error("제출 실패", err);
    }
  };

  // 관리자: 제출 상태/점수 수정
  const updateSubmission = async (userId, patch) => {
    try {
      await API.patch(`/assignments/${selected.id}/submissions/${userId}`, patch);
      fetchAssignments();
    } catch (err) {
      console.error("제출 수정 실패", err);
    }
  };

  return (
    <div className="assign-container">
      <button className="back-btn" onClick={() => navigate("/main")}>
        ← 메인으로
      </button>
      <h2>📋 {TITLE}</h2>

      <div className="assign-grid">
        {/* 왼쪽: 과제 목록 */}
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

        {/* 오른쪽: 상세 & 제출 */}
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

              {isAdmin && (
                <>
                  <h4 className="mt12">제출 현황 / 채점</h4>
                  {selected.submissions?.length === 0 ? (
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
                                  updateSubmission(s.userId, { status: e.target.value })
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

/* 백엔드 응답 구조
[
  {
    "id": "a-1",
    "title": "프로그래밍 #1",
    "dueDate": "2025-08-27",
    "submissions": [
      {
        "userId": "u-0001",
        "userName": "홍길동",
        "url": "https://github.com/test",
        "submittedAt": "2025-08-16T12:00:00Z",
        "status": "제출됨",
        "score": null,
        "note": ""
      }
    ]
  }
]
*/