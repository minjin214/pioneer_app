import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";   // 달력 라이브러리
import "react-calendar/dist/Calendar.css";
import "./AttendancePage.css";
import { useNavigate } from 'react-router-dom';
import API from "../api";

function AttendancePage() {
  const navigate = useNavigate();
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterUserId, setFilterUserId] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [editReason, setEditReason] = useState({});
  const [calendarDate, setCalendarDate] = useState(new Date());

  // 출석 등록 입력 상태 추가
  const [newAttendance, setNewAttendance] = useState({
    userId: "",
    date: "",
    status: "ATTEND",
    reason: ""
  });

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await API.get("/api/attendances");
      setAttendances(res.data.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const fetchByUser = async () => {
    if (!filterUserId) return;
    setLoading(true);
    try {
      const res = await API.get(`/api/attendances/user/${filterUserId}`);
      setAttendances(res.data.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const fetchByDate = async (date) => {
    if (!date) return;
    setLoading(true);
    try {
      const res = await API.get(`/api/attendances/date/${date}`);
      setAttendances(res.data.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const updateStatus = async (id, status) => {
    try {
      await API.patch(`/api/attendances/${id}`, { status });
      fetchAll();
    } catch (err) {
      console.error(err);
    }
  };

  const saveReason = async (id) => {
    try {
      await API.post(`/api/attendances/${id}/reason`, {
        reason: editReason[id],
      });
      setEditReason((prev) => ({ ...prev, [id]: "" }));
      fetchAll();
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ 달력 날짜 선택 시 실행
  const onCalendarChange = (value) => {
    setCalendarDate(value);
    const isoDate = value.toISOString().split("T")[0]; // yyyy-MM-dd 변환
    setFilterDate(isoDate);
    fetchByDate(isoDate);
  };

  // ⭐ 출석 등록 API
  const createAttendance = async () => {
    if (!newAttendance.userId || !newAttendance.date) {
      alert("유저 ID와 날짜는 필수입니다.");
      return;
    }
    try {
      await API.post("/api/attendances", newAttendance);
      alert("출석 등록 성공");
      setNewAttendance({ userId: "", date: "", status: "ATTEND", reason: "" }); // 입력창 초기화
      fetchAll();
    } catch (err) {
      console.error(err);
      alert("출석 등록 실패");
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  return (
    <div className="attendance-container">
      <button className="back-btn" onClick={() => navigate('/main')}>⬅ 메인으로</button>

      <h1 className="attendance-title">출석 관리</h1>


      {/* 달력 */}
      <div className="calendar-box">
        <Calendar onChange={onCalendarChange} value={calendarDate} />
      </div>

      {/*  출석 등록 Form */}
      <div className="attendance-create">
        <h3>출석 등록</h3>
        <input
          type="text"
          placeholder="유저 ID"
          value={newAttendance.userId}
          onChange={(e) => setNewAttendance({ ...newAttendance, userId: e.target.value })}
        />
        <input
          type="date"
          value={newAttendance.date}
          onChange={(e) => setNewAttendance({ ...newAttendance, date: e.target.value })}
        />
        <select
          value={newAttendance.status}
          onChange={(e) => setNewAttendance({ ...newAttendance, status: e.target.value })}
        >
          <option value="ATTEND">참석</option>
          <option value="ABSENT">불참</option>
          <option value="UNKNOWN">미정</option>
        </select>
        <input
          type="text"
          placeholder="사유"
          value={newAttendance.reason}
          onChange={(e) => setNewAttendance({ ...newAttendance, reason: e.target.value })}
        />
        <button onClick={createAttendance}>등록</button>
      </div>

      {/* 검색 필터 */}
      <div className="attendance-filters">
        <input
          type="text"
          placeholder="유저 ID 검색"
          value={filterUserId}
          onChange={(e) => setFilterUserId(e.target.value)}
        />
        <button onClick={fetchByUser}>유저 검색</button>

        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        />
        <button onClick={() => fetchByDate(filterDate)}>날짜 검색</button>

        <button onClick={fetchAll}>전체 조회</button>
      </div>

      {/* 테이블 */}
      {loading ? (
        <p>불러오는 중...</p>
      ) : (
        <table className="attendance-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>이름</th>
              <th>날짜</th>
              <th>상태</th>
              <th>불참 사유</th>
              <th>수정</th>
            </tr>
          </thead>
          <tbody>
            {attendances.map((a) => (
              <tr key={a.attendanceId}>
                <td>{a.userId}</td>
                <td>{a.userName}</td>
                <td>{a.date}</td>
                <td>
                  <select
                    value={a.status}
                    onChange={(e) =>
                      updateStatus(
                        a.attendanceId,
                        e.target.value === "참석"
                          ? "ATTEND"
                          : e.target.value === "불참"
                            ? "ABSENT"
                            : "UNKNOWN"
                      )
                    }
                  >
                    <option>참석</option>
                    <option>불참</option>
                    <option>미정</option>
                  </select>
                </td>
                <td>
                  <input
                    type="text"
                    value={editReason[a.attendanceId] ?? a.reason ?? ""}
                    onChange={(e) =>
                      setEditReason((prev) => ({
                        ...prev,
                        [a.attendanceId]: e.target.value,
                      }))
                    }
                  />
                </td>
                <td>
                  <button
                    className="save-btn"
                    onClick={() => saveReason(a.attendanceId)}
                  >
                    저장
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AttendancePage;
