import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthPages.css';
import API from "../api"

function SignupPage() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: '',
        email: '',
        username: '',
        password: '',
        grade: '',       // 학년
        position: '',     // 학위 과정
        role: 'USER',
        department: '',
        studentNumber: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // position 값 변환 (한글 → 영어)
    const handlePositionChange = (e) => {
        const mapping = {
            "학부": "UNDERGRADUATE",
            "석박사": "MASTER",
            "기타": "OTHER"
        };
        setForm({ ...form, position: mapping[e.target.value] });
    };

    // 체크박스 핸들러
    const handleRoleCheckbox = (e) => {
        setForm({ ...form, role: e.target.checked ? 'ADMIN' : 'USER' });
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await API.post("/api/auth/signup", form);
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
                <h2>회원가입</h2>
                <input name="name" placeholder='이름' onChange={handleChange} />
                <input name="email" placeholder='이메일' onChange={handleChange} />
                <input name="username" placeholder='아이디' onChange={handleChange} />
                <input name="password" type="password" placeholder='비밀번호' onChange={handleChange} />

                {/* grade 선택 */}
                <input
                    name="grade" 
                    type="number" 
                    min="1" 
                    max="4" 
                    placeholder="학년 (1~4)" 
                    onChange={handleChange} 
                />
                {/* position 선택 */}
                <select name="position" onChange={handlePositionChange}>
                    <option value="">구분 선택</option>
                    <option value="학부">학부</option>
                    <option value="석박사">석박사</option>
                    <option value="기타">기타</option>
                </select>

                {/* department 입력 */}
                <input
                    name="department"
                    placeholder="학과"
                    onChange={handleChange}
                />

                {/* studentNumber 입력 */}
                <input
                    name="studentNumber"
                    placeholder="학번"
                    onChange={handleChange}
                />

                {/* 관리자 체크박스 */}
                <label className="checkbox-label">
                    <input 
                        type="checkbox" 
                        name="role" 
                        checked={form.role === 'ADMIN'} 
                        onChange={handleRoleCheckbox} 
                    />
                    관리자
                </label>

                <button onClick={handleSignup} disabled={loading}>
                    {loading ? '처리 중...' : '회원가입'}
                </button>
                <p className='auth-link' onClick={() => navigate('/')}>로그인 페이지로</p>
            </div>
        </div>
    );
}

export default SignupPage;
