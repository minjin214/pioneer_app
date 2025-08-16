import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './SchedulePage.css';
import API from "../api";

function SchedulePage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [deletingIndex, setDeletingIndex] = useState(null);

  const fetchEvents = async () => {
    try {
      const res = await API.get("/schedules");
      // 서버 응답이 [{date:"2025-08-20", events:["MT"]}, ...] 라고 가정
      const obj = {};
      res.data.forEach(item => {
        obj[item.date] = item.events;
      });
      setEvents(obj);
    } catch (err) {
      console.error("일정 불러오기 실패", err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // 날짜를 문자열(YYYY-MM-DD)로 변환하는 함수
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // month는 0부터 시작
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const tileClassName = ({ date }) => {
    const dateStr = formatDate(date);  // UTC 대신 직접 변환
    if (events[dateStr]) return 'special-date';
    return null;
  };

  const handleDateClick = (date) => {
    const dateStr = formatDate(date);  // UTC 대신 직접 변환
    setSelectedDate(dateStr);
    setInputValue('');
  };

  const saveEvent = async () => {
    if (!selectedDate || !inputValue) return;
    try {
      await API.post("/schedules", { date: selectedDate, event: inputValue });
      fetchEvents();
      setInputValue("");
    } catch (err) {
      console.error("일정 저장 실패", err);
    }
  };

  // 일정 삭제
  const deleteEvent = async (eventText) => {
    try {
      await API.delete(`/schedules/${selectedDate}`, { data: { event: eventText } });
      fetchEvents();
    } catch (err) {
      console.error("일정 삭제 실패", err);
    }
  };

  return (
    <div className="schedule-container">
      <button className="back-btn" onClick={() => navigate('/main')}>← 메인으로</button>

      <h2 className="page-title">📅 PIONEER 일정</h2>

      <div className="content-layout">
        {/* 왼쪽: 달력 */}
        <div className="calendar-section">
          <Calendar
            onClickDay={handleDateClick}
            tileClassName={tileClassName}
          />
        </div>

        {/* 오른쪽: 일정 관리 */}
        <div className="events-section">
        {selectedDate ? (
          <>
            <h3>{selectedDate} 일정</h3>
            <input
              type="text"
              placeholder="일정을 입력하세요"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button onClick={saveEvent}>추가</button>

            {/* 일정 목록 */}
            <ul className="event-list">
              {(Array.isArray(events[selectedDate]) ? events[selectedDate] : []).map((ev, idx) => (
                <li 
                  key={idx} 
                  onClick={() => setDeletingIndex(idx)} 
                  className={deletingIndex === idx ? "selected-event" : ""}
                >
                  {ev}
                </li>
              ))}
            </ul>

            {/* 삭제 버튼 (선택된 일정이 있을 때만) */}
            {deletingIndex !== null && (
              <button 
                className="delete-btn" 
                onClick={() => deleteEvent(events[selectedDate][deletingIndex])}>
                삭제하기
              </button>
            )}
          </>
        ) : (
          <p className="placeholder-text">날짜를 선택하면 일정 추가가 가능합니다.</p>
        )}
        </div>
      </div>
    </div>
  );
}

export default SchedulePage;

/* 응답구조
[
  {
    "date": "2025-08-20",
    "events": ["회식", "MT"]
  },
  {
    "date": "2025-08-21",
    "events": ["스터디"]
  }
]

{
  "success": true,
  "message": "일정 추가 완료",
  "event": "회식",
  "date": "2025-08-20"
}

{
  "success": true,
  "message": "일정 삭제 완료",
  "event": "회식",
  "date": "2025-08-20"
}
*/