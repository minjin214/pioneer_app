import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthPages.css';

function SignupPage() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: '',
        email: '',
        username: '',
        password: ''
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        console.log('회원가입 데이터:', form); //여기에 서버로 회원가입 데이터 전송 API 호출
        alert('회원가입이 완료되었습니다.');
        navigate('/');
    };

    return (
        <div className='auth-container'>
            <div className='auth-box'>
                <h2>회원갸입</h2>
                <input name="name" placeholder='이름' onChange={handleChange} />
                <input name="email" placeholder='이메일' onChange={handleChange} />
                <input name="username" placeholder='아이디' onChange={handleChange} />
                <input name="password" type="password" placeholder='비밀번호' onChange={handleChange} />
                <button onClick={handleSignup}>회원가입</button>
                <p className='auth-link' onClick={() => navigate('/')}>로그인 페이지로</p>
            </div>
        </div>
    );
}

export default SignupPage;