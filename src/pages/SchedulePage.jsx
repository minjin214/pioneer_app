import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './SchedulePage.css';

/*const specialDates = {
    '2025-08-07' : 'MT',
    '2025-08-20' : '회식'
};*/

function SchedulePage() {
    const navigate = useNavigate();
    const [events, setEvents] = useState({});
    const [selectedDate, setSelectedDate] = useState(null);
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
      const savedEvents = localStorage.getItem('labSchedule');
      if (savedEvents) {
        setEvents(JSON.parse(savedEvents));
      } else {
        const testDate = { '2025-08-30' : '회식' };
        localStorage.setItem('labSchedule', JSON.stringify(testDate));
        setEvents(testDate);
      }
    }, []);

    const tileClassName = ({ date }) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        
        if (events[dateStr]) return 'special-date';
        return null;
    };

    const handleDateClick = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // 0~11
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        setSelectedDate(dateStr);
        setInputValue(events[dateStr] || ''); 
    };

    const saveEvent = () => {
        if (!selectedDate) return;
        const newEvents = { ...events, [selectedDate]: inputValue };
        setEvents(newEvents);
        localStorage.setItem('labSchedule', JSON.stringify(newEvents));
        setSelectedDate(null);
    };

    return (
        <div className="schedule-container">
          <button className="back-btn" onClick={() => navigate('/main')}>← 메인으로</button>
          <h2>📅 일정 공지</h2>
          <Calendar
            onClickDay={handleDateClick}
            tileClassName={tileClassName}
          />
    
          {selectedDate && (
            <div className="popup">
              <h3>{selectedDate}</h3>
              <textarea
                  placeholder="일정을 입력하세요"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
                <button onClick={saveEvent}>저장</button>
                <button onClick={() => setSelectedDate(null)}>닫기</button>
            </div>
          )}
        </div>
      );
}

export default SchedulePage;