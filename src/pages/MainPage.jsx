import React from 'react';
import './MainPage.css';
import { useNavigate } from 'react-router-dom';

function MainPage() {
    const navigate = useNavigate();

    const hangleLogout =() => {
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('authToken');
        navigate('/');
    };

    return(
        <div className="main-container">
            <button onClick={hangleLogout} className='logout-btn'>로그아웃</button>
            
            <div className='welcome-message'>
                <h2>환영합니다!</h2>
                <p>ooo님,</p>
                <p>오늘도 좋은 하루되세요</p>
            </div>
            <div className='right-section'>
                <div className='lab-manage'>
                    <h2>연구실 관리</h2>
                    <button onClick={() => navigate('/schedule')}>📅 일정 공지</button>
                    <button onClick={() => navigate('/members')}>👥 사용자 목록</button>
                    <button onClick={() => navigate('/attendance')}>✅ 팀원 참석 여부</button>
                </div>
                
                <div className='task-check'>
                    <h2>연구실 과제확인</h2>
                    <button onClick={() => navigate('/programming')}>💻 프로그래밍</button>
                    <button onClick={() => navigate('/study')}>📚 스터디</button>
                    <button onClick={() => navigate('/project')}>🛠 프로젝트</button>
                </div>
            </div>
        </div>
    );
}

export default MainPage;