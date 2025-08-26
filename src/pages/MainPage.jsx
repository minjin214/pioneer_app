import React, { useEffect, useState } from 'react';
import './MainPage.css';
import { useNavigate } from 'react-router-dom';
import API from '../api';

function MainPage() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState('');
  const [userDepartment, setUserDepartment] = useState('');
  const [userStudentNumber, setUserStudentNumber] = useState('');
  const [userRole, setUserRole] = useState('');
  const [userPosition, setUserPosition] = useState('');

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
    navigate('/');
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await API.get('/api/auth/me', { withCredentials: true });
        const data = res.data.data;

        setUserId(data.userId);
        setUserDepartment(data.department ?? '');
        setUserName(data.name ?? data.username);
        setUserPosition(data.position ?? '');
        setUserRole(data.role ?? '');
        setUserStudentNumber(data.studentNumber ?? '');
      } catch (err) {
        console.error('사용자 정보 불러오기 실패:', err);
        navigate('/');
      }
    };
    fetchUser();
  }, [navigate]);

return (
  <div className="main-container">
    <button onClick={handleLogout} className="logout-btn">로그아웃</button>

    {/* 왼쪽 컬럼 */}
    <div className="left-section">
      {/* 인사말 박스 */}
      <div className="welcome-message">
        <h2>{userName ? `${userName}님, 안녕하세요` : '환영합니다!'}</h2>
        <p>오늘도 좋은 하루 되세요</p>
      </div>

      {/* 내 정보 박스 */}
      {userId && (
        <div className="user-info">
          <h3>내 정보</h3>
          <p><strong>ID:</strong> {userId}</p>
          <p><strong>학번:</strong> {userStudentNumber}</p>
          <p><strong>학과:</strong> {userDepartment}</p>
          <p><strong>역할:</strong> {userRole}</p>
          <p><strong>구분:</strong> {userPosition}</p>
        </div>
      )}
    </div>

    {/* 오른쪽 섹션 */}
    <div className="right-section">
      <div className="lab-manage">
        <h2>연구실 관리</h2>
        <button onClick={() => navigate('/schedule')}>📅 일정 공지</button>
        <button onClick={() => navigate('/members')}>👥 사용자 목록</button>
        <button onClick={() => navigate('/attendance')}>✅ 팀원 참석 여부</button>
      </div>

      <div className="task-check">
        <h2>연구실 과제확인</h2>
        <button onClick={() => navigate('/assignment')}>📚 과제 확인</button>
      </div>
    </div>
  </div>
);
}

export default MainPage;
