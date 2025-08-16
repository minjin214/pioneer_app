import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './AttendancePage.css';
import API from "../api";

function AttendancePage() {
  const navigate = useNavigate();
  const [absentList, setAbsentList] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [deletingIndex, setDeletingIndex] = useState(null);

  const fetchAttendance = async () => {
    try {
      const res = await API.get("/attendance");
      const obj = {};
      res.data.forEach(item => {
        obj[item.date] = item.absent;
      });
      setAbsentList(obj);
    } catch (err) {
      console.error("출석 불러오기 실패", err);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateClick = (date) => {
    const dateStr = formatDate(date);
    setSelectedDate(dateStr);
    setInputValue('');
  };

  const saveAbsent = async () => {
    try {
      await API.post("/attendance", { date: selectedDate, absent: inputValue });
      fetchAttendance();
      setInputValue("");
    } catch (err) {
      console.error("출석 저장 실패", err);
    }
  };

  const deleteAbsent = (dateStr, index) => {
    const dayList = Array.isArray(absentList[dateStr]) ? [...absentList[dateStr]] : [];
    dayList.splice(index, 1);
    const newList = { ...absentList, [dateStr]: dayList };
    if (dayList.length === 0) delete newList[dateStr];
    setAbsentList(newList);
    localStorage.setItem('labAttendance', JSON.stringify(newList));
    setDeletingIndex(null);
  };

  return (
    <div className="attendance-container">
      <button className="back-btn" onClick={() => navigate('/main')}>← 메인으로</button>
      <h2 className="page-title">✅ 팀원 참석 여부</h2>

      <div className="content-layout">
        {/* 좌측 달력 */}
        <div className="calendar-section">
          <Calendar onClickDay={handleDateClick} />
        </div>

        {/* 우측 참석 관리 */}
        <div className="events-section">
          {selectedDate ? (
            <>
              <h3>{selectedDate} 미참석</h3>

              <div className="input-area">
                <input
                  type="text"
                  placeholder="미참석 인원 입력"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
                <button onClick={saveAbsent}>추가</button>
              </div>

              <ul className="event-list">
                {(Array.isArray(absentList[selectedDate]) ? absentList[selectedDate] : []).map((ev, idx) => (
                  <li
                    key={idx}
                    onClick={() => setDeletingIndex(idx)}
                    className={deletingIndex === idx ? "selected-event" : ""}
                  >
                    {ev}
                  </li>
                ))}
              </ul>

              {deletingIndex !== null && (
                <button className="delete-btn" onClick={() => deleteAbsent(selectedDate, deletingIndex)}>
                  삭제
                </button>
              )}
            </>
          ) : (
            <p className="placeholder-text">날짜를 선택하면 미참석자 입력이 가능합니다.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AttendancePage;

/* 응답구조
[
  {
    "date": "2025-08-20",
    "absent": ["홍길동", "김철수"]
  },
  {
    "date": "2025-08-21",
    "absent": ["이영희"]
  }
]

{
  "success": true,
  "message": "미참석자 등록 완료",
  "date": "2025-08-20",
  "absent": "홍길동"
}

{
  "success": true,
  "message": "미참석자 삭제 완료",
  "date": "2025-08-20",
  "absent": "홍길동"
}
*/