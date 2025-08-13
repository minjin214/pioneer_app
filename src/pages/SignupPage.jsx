import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
//import axios from 'axios';
import './AuthPages.css';

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
            //const res = await axios.post('https://reqres.in/api/users', form); //서버만 바꾸기
            console.log(form); //입력값 확인용
            alert(/*res.data.message ||*/'회원가입 성공!');
            navigate('/');
        } catch(err) {
            console.error('회원가입 요청 오류:', err);
            if (err.response) {
                alert(err.response.data.message || '회원가입 실패');
            } else {
                alert('서버 연결 실패');
            }
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