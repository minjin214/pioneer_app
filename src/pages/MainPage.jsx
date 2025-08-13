import React from 'react';
import './MainPage.css';

function MainPage() {
    return(
        <div className="main-container">
            <div className='welcome-message'>
                <h2>환영합니다!</h2>
                <p>ooo님,</p>
                <p>오늘도 좋은 하루되세요</p>
            </div>
            <div className='right-section'>
                <div className='lab-manage'>
                    <h2>연구실 관리</h2>
                    <ul>
                        <li>📅 일정 공지</li>
                        <li>👥 사용자 목록</li>
                        <li>✅ 팀원 참석 여부</li>
                    </ul>
                </div>
                
                <div className='task-check'>
                    <h2>연구실 과제확인</h2>
                        <ul>
                            <li>💻 프로그래밍</li>
                            <li>📚 스터디</li>
                            <li>🛠 프로젝트</li>
                        </ul>
                </div>
            </div>
        </div>
    );
}

export default MainPage;