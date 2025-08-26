import React, { useEffect, useState, useCallback } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import "./AssignmentPage.css";

function AssignmentPage() {
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [mySubmission, setMySubmission] = useState(null);

  const [filterType, setFilterType] = useState("");
  const [newAssignment, setNewAssignment] = useState({
    title: "",
    description: "",
    type: "REPORT",
    dueDate: ""
  });
  const [newSubmission, setNewSubmission] = useState({
    assignmentId: "",
    userId: "",
    link: ""
  });

  // 과제 목록 불러오기
  const fetchAssignments = useCallback(async () => {
    try {
      let url = "/api/assignments";
      if (filterType) url += `?type=${filterType}`;
      const res = await API.get(url);
      setAssignments(res.data.data);
    } catch (err) {
      console.error("과제 목록 조회 실패:", err);
    }
  }, [filterType]);

  // 특정 과제 제출 목록 (관리자)
  const fetchSubmissions = async (assignmentId) => {
    try {
      const res = await API.get(`/api/assignments/${assignmentId}/submissions`);
      setSubmissions(res.data.data);
    } catch (err) {
      console.error("제출 목록 조회 실패:", err);
    }
  };

  // 내 제출 조회
  const fetchMySubmission = async () => {
    if (!newSubmission.assignmentId || !newSubmission.userId) {
      alert("assignmentId와 userId를 입력하세요.");
      return;
    }
    try {
      const res = await API.get(
        `/api/submissions/mine?assignmentId=${newSubmission.assignmentId}&userId=${newSubmission.userId}`
      );
      setMySubmission(res.data.data);
    } catch (err) {
      console.error("내 제출 조회 실패:", err);
      alert("내 제출 없음");
    }
  };

  // 과제 등록 (관리자)
  const createAssignment = async () => {
    try {
      await API.post("/api/assignments", newAssignment);
      alert("과제 등록 완료");
      setNewAssignment({ title: "", description: "", type: "REPORT", dueDate: "" });
      fetchAssignments();
    } catch (err) {
      console.error("과제 등록 실패:", err);
    }
  };

  // 과제 제출
  const submitAssignment = async () => {
    try {
      await API.post("/api/submissions", newSubmission);
      alert("과제 제출 완료");
      setNewSubmission({ assignmentId: "", userId: "", link: "" });
    } catch (err) {
      console.error("과제 제출 실패:", err);
    }
  };

  // 채점 (제출 목록에서 바로)
  const gradeSubmission = async (submissionId, assignmentId, score) => {
    if (!score || score < 1 || score > 100) {
      alert("점수는 1~100 사이여야 합니다.");
      return;
    }
    try {
      await API.post(`/api/submissions/${submissionId}/grade`, {
        score: parseInt(score)
      });
      alert("채점 완료");
      fetchSubmissions(assignmentId);
    } catch (err) {
      console.error("채점 실패:", err);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  return (
    <div className="assignment-container">
      <button className="back-btn" onClick={() => navigate("/main")}>
        ⬅ 메인으로
      </button>

      <h1 className="assignment-title">과제 관리</h1>

      {/* 과제 목록 필터 */}
      <div className="assignment-filters">
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="">전체</option>
          <option value="REPORT">보고서</option>
          <option value="HOMEWORK">과제</option>
          <option value="PROJECT">프로젝트</option>
        </select>
        <button onClick={fetchAssignments}>조회</button>
      </div>

      {/* 과제 목록 */}
      <table className="assignment-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>제목</th>
            <th>타입</th>
            <th>마감일</th>
            <th>조회</th>
          </tr>
        </thead>
        <tbody>
          {assignments.map((a) => (
            <tr key={a.assignmentId}>
              <td>{a.assignmentId}</td>
              <td>{a.title}</td>
              <td>{a.type}</td>
              <td>{a.deadline}</td>
              <td>
                <button onClick={() => fetchSubmissions(a.assignmentId)}>
                  제출 목록 보기
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 제출 목록 (관리자) */}
      {submissions.length > 0 && (
        <div className="submission-section">
          <h3>제출 목록</h3>
          <table className="assignment-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>유저</th>
                <th>링크</th>
                <th>점수</th>
                <th>상태</th>
                <th>채점</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((s) => (
                <tr key={s.submissionId}>
                  <td>{s.submissionId}</td>
                  <td>{s.user?.name}</td>
                  <td>
                    <a href={s.link} target="_blank" rel="noreferrer">
                      {s.link}
                    </a>
                  </td>
                  <td>{s.score ?? "-"}</td>
                  <td>{s.status}</td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      placeholder="점수"
                      style={{ width: "60px", marginRight: "5px" }}
                      value={s.tempScore ?? ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        setSubmissions((prev) =>
                          prev.map((sub) =>
                            sub.submissionId === s.submissionId
                              ? { ...sub, tempScore: value }
                              : sub
                          )
                        );
                      }}
                    />
                    <button
                      onClick={() =>
                        gradeSubmission(
                          s.submissionId,
                          s.assignment.assignmentId,
                          s.tempScore
                        )
                      }
                    >
                      채점
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 과제 제출 */}
      <div className="assignment-submit">
        <h3>과제 제출</h3>
        <input
          type="text"
          placeholder="과제 ID"
          value={newSubmission.assignmentId}
          onChange={(e) =>
            setNewSubmission({ ...newSubmission, assignmentId: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="유저 ID"
          value={newSubmission.userId}
          onChange={(e) =>
            setNewSubmission({ ...newSubmission, userId: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="제출 링크"
          value={newSubmission.link}
          onChange={(e) =>
            setNewSubmission({ ...newSubmission, link: e.target.value })
          }
        />
        <button onClick={submitAssignment}>제출</button>
        <button onClick={fetchMySubmission}>내 제출 조회</button>
      </div>

      {/* 내 제출 */}
      {mySubmission && (
        <div className="my-submission">
          <h3>내 제출</h3>
          <p>과제 ID: {mySubmission.assignment.assignmentId}</p>
          <p>
            링크:{" "}
            <a href={mySubmission.link} target="_blank" rel="noreferrer">
              {mySubmission.link}
            </a>
          </p>
          <p>점수: {mySubmission.score ?? "-"}</p>
          <p>상태: {mySubmission.status}</p>
        </div>
      )}

      {/* ✅ 과제 등록 (맨 아래로 이동) */}
      <div className="assignment-create">
        <h3>과제 등록 (관리자)</h3>
        <input
          type="text"
          placeholder="제목"
          value={newAssignment.title}
          onChange={(e) =>
            setNewAssignment({ ...newAssignment, title: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="설명"
          value={newAssignment.description}
          onChange={(e) =>
            setNewAssignment({ ...newAssignment, description: e.target.value })
          }
        />
        <select
          value={newAssignment.type}
          onChange={(e) =>
            setNewAssignment({ ...newAssignment, type: e.target.value })
          }
        >
          <option value="REPORT">보고서</option>
          <option value="HOMEWORK">과제</option>
          <option value="PROJECT">프로젝트</option>
        </select>
        <input
          type="date"
          value={newAssignment.dueDate}
          onChange={(e) =>
            setNewAssignment({ ...newAssignment, dueDate: e.target.value })
          }
        />
        <button onClick={createAssignment}>등록</button>
      </div>
    </div>
  );
}

export default AssignmentPage;
