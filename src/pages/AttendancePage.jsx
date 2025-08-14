import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './AttendancePage.css';

function AttendancePage() {
    const navigate = useNavigate();
    const [absentList, setAbsentList] = useState({});
    const [selectedDate, setSelectedDate]= useState(null);
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        const savedAbsent = localStorage.getItem('labAttendance');
        if (savedAbsent) {
          setAbsentList(JSON.parse(savedAbsent));
        }
    }, []);

    const handleDateClick = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // 0~11
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        setSelectedDate(dateStr);
        setInputValue(absentList[dateStr] || ''); 
    };

    const saveAbsent = () => {
        const newAbsentList = { ...absentList, [selectedDate]: inputValue };
        setAbsentList(newAbsentList);
        localStorage.setItem('labAttendance', JSON.stringify(newAbsentList));
        setSelectedDate(null);
    };

    return (
        <div className='attendance-container'>
            <button className="back-btn" onClick={() => navigate('/main')}>← 메인으로</button>
            <h2>✅ 팀원 참석 여부</h2>
            <Calendar onClickDay={handleDateClick} />

            {selectedDate && (
                <div className='popup'>
                    <h3>{selectedDate}</h3>
                    <textarea
                        placeholder='미참석 인원 입력'
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                    />
                    <button onClick={saveAbsent}>저장</button>
                    <button onClick={() => setSelectedDate(null)}>취소</button>
                </div>
            )}
        </div>
    );
}

export default AttendancePage;