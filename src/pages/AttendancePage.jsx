import React, { useEffect, useState } from "react";
import axios from "axios";
import Calendar from "react-calendar";   // ✅ 달력 라이브러리
import "react-calendar/dist/Calendar.css";
import "./AttendancePage.css";

function AttendancePage() {
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterUserId, setFilterUserId] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [editReason, setEditReason] = useState({});
  const [calendarDate, setCalendarDate] = useState(new Date());

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/attendances");
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
      const res = await axios.get(`/api/attendances/user/${filterUserId}`);
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
      const res = await axios.get(`/api/attendances/date/${date}`);
      setAttendances(res.data.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`/api/attendances/${id}`, { status });
      fetchAll();
    } catch (err) {
      console.error(err);
    }
  };

  const saveReason = async (id) => {
    try {
      await axios.post(`/api/attendances/${id}/reason`, {
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

  useEffect(() => {
    fetchAll();
  }, []);

  return (
    <div className="attendance-container">
      <h1 className="attendance-title">출석 관리</h1>

      {/* 달력 */}
      <div className="calendar-box">
        <Calendar onChange={onCalendarChange} value={calendarDate} />
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
