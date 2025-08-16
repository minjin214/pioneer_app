import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';
import introImage from '../assets/pioneer-intro.png';
import API from "../api";

function LoginPage() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [keepLogin, setKeepLogin] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await API.post("/login", { username, password });
            localStorage.setItem("token", res.data.token);
            alert("로그인 성공!");
            navigate("/main");
        } catch (err) {
            alert(err.response?.data?.message || "로그인 실패");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h2>로그인</h2>
                <input
                    type="text"
                    placeholder="아이디"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="비밀번호"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button onClick={handleLogin} disabled={loading}>
                    {loading ? "처리 중..." : "로그인"}
                </button>

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

/* 응답구조
{
  "success": true,
  "token": "abcdefg123456",  // 로그인 세션 토큰
  "user": {
    "id": 123,
    "name": "홍길동",
    "username": "hong123"
  }
}

{
  "success": false,
  "message": "아이디 또는 비밀번호가 잘못되었습니다."
}
*/