import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import { useNavigate } from "react-router-dom";
import "react-calendar/dist/Calendar.css";
import "./SchedulePage.css";

function SchedulePage() {
  const navigate = useNavigate();

  const [date, setDate] = useState(new Date());
  const [schedules, setSchedules] = useState([]);
  const [allSchedules, setAllSchedules] = useState([]);
  const [expandedId, setExpandedId] = useState(null); // 아코디언 열림 상태

  // 입력값
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [important, setImportant] = useState(false);

  // 전체 일정 조회
  const fetchAllSchedules = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/schedules", {
        credentials: "include",
      });
      const data = await res.json();
      if (data.status) setAllSchedules(data.data);
    } catch (err) {
      console.error("전체 일정 조회 실패:", err);
    }
  };

  // 날짜별 일정 조회
  const fetchSchedulesByDate = async (selectedDate) => {
    try {
      const formatted = selectedDate.toISOString().split("T")[0];
      const res = await fetch(
        `http://localhost:8080/api/schedules/date/${formatted}`,
        { credentials: "include" }
      );
      const data = await res.json();
      if (data.status) setSchedules(data.data);
    } catch (err) {
      console.error("날짜별 일정 조회 실패:", err);
    }
  };

  useEffect(() => {
    fetchAllSchedules();
    fetchSchedulesByDate(date);
  }, [date]);

  // 일정 등록
  const handleAdd = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title,
          date: date.toISOString().split("T")[0],
          location,
          description,
          important,
        }),
      });
      const data = await res.json();
      if (data.status) {
        alert("일정 등록 성공!");
        setTitle("");
        setLocation("");
        setDescription("");
        setImportant(false);
        fetchAllSchedules();
        fetchSchedulesByDate(date);
      } else {
        alert("등록 실패: " + data.message);
      }
    } catch (err) {
      console.error("등록 실패:", err);
    }
  };

  // 일정 삭제
  const handleDelete = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      const res = await fetch(`http://localhost:8080/api/schedules/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (data.status) {
        alert("삭제 성공!");
        fetchAllSchedules();
        fetchSchedulesByDate(date);
      } else {
        alert("삭제 실패: " + data.message);
      }
    } catch (err) {
      console.error("삭제 실패:", err);
    }
  };

  // 아코디언 토글
  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="schedule-container">
      <button onClick={() => navigate("/main")} className="back-btn">
        ⬅ 메인으로
      </button>

      <h2 className="page-title">📅 일정 관리</h2>

      <div className="content-layout">
        {/* 달력 */}
        <div className="calendar-section">
          <Calendar
            onChange={setDate}
            value={date}
            className="custom-calendar"
            tileClassName={({ date }) => {
              const d = date.toISOString().split("T")[0];
              if (allSchedules.some((s) => s.date === d && s.important)) {
                return "special-date"; // 중요 일정은 빨간색 칸
              }
              return null;
            }}
            tileContent={({ date }) => {
              const d = date.toISOString().split("T")[0];
              const hasEvent = allSchedules.some((s) => s.date === d);
              return hasEvent ? <div className="event-dot"></div> : null;
            }}
          />
        </div>

        {/* 일정 목록 + 등록폼 */}
        <div className="events-section">
          <h3>{date.toISOString().split("T")[0]} 일정</h3>

          {/* 등록 폼 */}
          <div className="schedule-form">
            <table className="form-table">
              <tbody>
                <tr>
                  <th>일시</th>
                  <td>
                    <input
                      type="date"
                      value={date.toISOString().split("T")[0]}
                      onChange={(e) => setDate(new Date(e.target.value))}
                    />
                  </td>
                </tr>
                <tr>
                  <th>제목</th>
                  <td>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="제목 입력"
                    />
                  </td>
                </tr>
                <tr>
                  <th>내용</th>
                  <td>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="설명 입력"
                    />
                  </td>
                </tr>
                <tr>
                  <th>장소</th>
                  <td>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="장소 입력"
                    />
                  </td>
                </tr>
                <tr>
                  <th>선택</th>
                  <td className="checkbox-cell">
                    <label>
                      <input
                        type="checkbox"
                        checked={important}
                        onChange={(e) => setImportant(e.target.checked)}
                      />
                      중요 일정
                    </label>
                  </td>
                </tr>
              </tbody>
            </table>
            <button className="submit-btn" onClick={handleAdd}>
              등록
            </button>
          </div>

          {/* 일정 목록 */}
          {schedules.length > 0 ? (
            <ul className="event-list">
              {schedules.map((event) => (
                <li key={event.scheduleId}>
                  <div
                    className="event-title"
                    onClick={() => toggleExpand(event.scheduleId)}
                  >
                    <b>{event.title}</b>
                    {event.important && (
                      <span style={{ color: "red", marginLeft: "6px" }}>
                        ⚠ 중요
                      </span>
                    )}
                  </div>

                  {expandedId === event.scheduleId && (
                    <div className="event-details">
                      <p>📅 일시: {event.date}</p>
                      <p>📍 장소: {event.location}</p>
                      <p>📝 내용: {event.description}</p>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(event.scheduleId)}
                      >
                        삭제
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="placeholder-text">이 날짜에는 일정이 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default SchedulePage;