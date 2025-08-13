import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';
import introImage from '../assets/pioneer-intro.png';

function LoginPage() {
    const navigate = useNavigate();
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [keepLogin, setKeepLogin] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!id || !password) {
            alert('아이디와 비밀번호를 입력하시오.');
            return;
        }
        console.log('로그인 시도:', id, password, keepLogin);

        const token = 'authToken';

        if (keepLogin) {
            localStorage.setItem('authToken', token); // 로그인 유지
        } else {
            sessionStorage.setItem('authToken', token); // 세션만 유지
        }
        navigate('/main');
    };

    useEffect(() => {
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        if (token) {
          navigate('/main');
        }
    }, [navigate]);

    return (
        <div className="login-container">
            <div className="login-box">
                <h2>로그인</h2>
                    <input
                        type="text"
                        placeholder="아이디"
                        value={id}
                        onChange={(e) => setId(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="비밀번호"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button onClick={handleLogin}>로그인</button>

                    <div className="login-options">
                        <button type="button" onClick={() => navigate('/signup')}>
                            회원가입
                        </button>
                        <button type="button" onClick={() => navigate('/find')}>
                            아이디/비밀번호 찾기
                        </button>
                        <label>
                            <input
                                type="checkbox"
                                checked={keepLogin}
                                onChange={(e) => setKeepLogin(e.target.checked)}
                            />
                            로그인 유지
                        </label>
                        <button type="button" onClick={() => alert("관리자 로그인 인증 페이지 예정")}>
                            관리자 로그인
                        </button>
                    </div>
            </div>

            <div className="login-right">
                <img src={introImage} alt="동아리 소개" />
            </div>
        </div>
    );
}

export default LoginPage;