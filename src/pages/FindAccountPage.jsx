import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthPages.css';

function FindAccountPage() {
    const navigate =  useNavigate();
    const [email, setEmail] = useState('');

    const handleFindId = () => {
        console.log('아이디 찾기 요청:', email); //API 호출 및 이메일로 아이디 전송
        alert('등록된 이메일로 아이디를 전송했습니다.');
    };

    const handleResetPassword = () => {
        console.log('비밀번호 재설정 요청:', email); //API 호출 및 비밀번호 재설정 링크 전송
        alert("등록된 이메일로 비밀번호 재설정 링크를 전송했습니다.");
    };

    return (
        <div className='auth-container'>
            <div className="auth-box">
                <h2>아이디 / 비밀번호 찾기</h2>
                <input
                    type="email"
                    placeholder="등록된 이메일 입력"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <button onClick={handleFindId}>아이디 찾기</button>
                <button onClick={handleResetPassword}>비밀번호 재설정</button>
            </div>
        </div>
    );
}

export default FindAccountPage;