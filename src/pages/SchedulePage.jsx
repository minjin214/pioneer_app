import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './SchedulePage.css';

function SchedulePage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [deletingIndex, setDeletingIndex] = useState(null);

  useEffect(() => {
    //서버에서 온 기본 일정 (임시 하드코딩)
    const serverData = { 
      '2025-08-20': ['회식']
    };
  
    //로컬스토리지에 저장된 일정 불러오기
    const savedEvents = localStorage.getItem('labSchedule');
    let finalEvents = { ...serverData }; // 서버 데이터로 시작
  
    if (savedEvents) {
      const parsed = JSON.parse(savedEvents);
  
      //배열 아닌 값은 배열로 변환
      for (const key in parsed) {
        if (Array.isArray(parsed[key])) {
          finalEvents[key] = parsed[key];
        } else if (typeof parsed[key] === 'string') {
          finalEvents[key] = [parsed[key]];
        }
      }
    }
  
    setEvents(finalEvents);
    localStorage.setItem('labSchedule', JSON.stringify(finalEvents));
  }, []);

  /* API 용?
  useEffect(() => {
    const fetchServerData = async () => {
      try {
        // 📡 API 요청 (예시)
        const res = await axios.get('/api/schedule');
        const serverData = res.data; // { '2025-08-20': ['MT'], ... }

        // 로컬 데이터랑 병합
        const savedEvents = localStorage.getItem('labSchedule');
        let finalEvents = { ...serverData };

        if (savedEvents) {
          const parsed = JSON.parse(savedEvents);
          for (const key in parsed) {
            if (Array.isArray(parsed[key])) {
              finalEvents[key] = parsed[key];
            } else if (typeof parsed[key] === 'string') {
              finalEvents[key] = [parsed[key]];
            }
          }
        }

        setEvents(finalEvents);
        localStorage.setItem('labSchedule', JSON.stringify(finalEvents));
      } catch (err) {
        console.error('서버 일정 불러오기 실패:', err);
      }
    };

    fetchServerData();
  }, []);
  */

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

  const saveEvent = () => {
    if (!selectedDate || !inputValue.trim()) return;
    const newEvents = {
      ...events,
      [selectedDate]: [
        ...(Array.isArray(events[selectedDate]) ? events[selectedDate] : []),
        inputValue
      ]
    };
    setEvents(newEvents);
    localStorage.setItem('labSchedule', JSON.stringify(newEvents));
    setInputValue('');
  };

  const deleteEvent = (dateStr, index) => {
    const dayEvents = Array.isArray(events[dateStr]) ? [...events[dateStr]] : [];
    dayEvents.splice(index, 1); // 선택된 일정 삭제
  
    const newEvents = { ...events, [dateStr]: dayEvents };
    if (dayEvents.length === 0) {
      delete newEvents[dateStr]; // 일정이 비면 해당 날짜 제거
    }
  
    setEvents(newEvents);
    localStorage.setItem('labSchedule', JSON.stringify(newEvents));
    setDeletingIndex(null);
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
              <button className="delete-btn" onClick={() => deleteEvent(selectedDate, deletingIndex)}>
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
