import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
//import axios from 'axios';
import './AuthPages.css';
import API from "../api"

function SignupPage() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: '',
        email: '',
        username: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await API.post("/signup", form);
            alert("회원가입 성공!");
            navigate("/");
            } catch (err) {
            alert(err.response?.data?.message || "회원가입 실패");
            } finally {
                setLoading(false);
            }
        };

    return (
        <div className='auth-container'>
            <div className='auth-box'>
                <h2>회원갸입</h2>
                <input name="name" placeholder='이름' onChange={handleChange} />
                <input name="email" placeholder='이메일' onChange={handleChange} />
                <input name="username" placeholder='아이디' onChange={handleChange} />
                <input name="password" type="password" placeholder='비밀번호' onChange={handleChange} />
                <button onClick={handleSignup} disabled={loading}>
                    {loading ? '처리 중...' : '회원가입'}
                </button>
                <p className='auth-link' onClick={() => navigate('/')}>로그인 페이지로</p>
            </div>
        </div>
    );
}

export default SignupPage;

/* 응답구조
{
  "success": true,
  "message": "회원가입 성공",
  "user": {
    "id": 123,
    "name": "홍길동",
    "email": "test@test.com",
    "username": "hong123"
  }
}
*/