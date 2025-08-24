import React, { useState, useEffect } from 'react';
import './MembersPage.css';
import { useNavigate } from 'react-router-dom';
import defaultImg from '../assets/pioneer-intro.png';

function MembersPage() {
    const navigate = useNavigate();
    const [members, setMembers] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [newMember, setNewMember] = useState({
        name: '',
        studentNumber: '',
        department: '',
        role: 'USER'
    });
    const [selectedIndex, setSelectedIndex] = useState(null);

    // 🔹 백엔드에서 사용자 목록 불러오기
    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const res = await fetch("http://localhost:8080/api/members");
                const data = await res.json();
                if (Array.isArray(data.items)) {
                    setMembers(data.items); // items 배열 안에 DTO 목록
                } else {
                    setMembers([]);
                    console.error("백엔드 응답이 배열이 아님:", data);
                }
            } catch (err) {
                console.error("멤버 불러오기 실패:", err);
            }
        };
        fetchMembers();
    }, []);

    const addMember = () => setShowPopup(true);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewMember({
            ...newMember,
            [name]: type === "checkbox" ? (checked ? "ADMIN" : "USER") : value
        });
    };

    const saveMember = async () => {
        if (!newMember.name || !newMember.studentNumber || !newMember.department) {
            alert("모든 항목을 입력하세요.");
            return;
        }

        try {
            const res = await fetch("http://localhost:8080/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newMember)
            });
            if (!res.ok) throw new Error("회원가입 실패");

            const savedUser = await res.json();

            // DTO 형식에 맞춰 members 배열에 추가
            const memberDto = {
                name: savedUser.name,
                studentNumber: savedUser.studentNumber,
                department: savedUser.department,
                position: savedUser.role === "ADMIN" ? "관리자" : "사용자"
            };
            setMembers([...members, memberDto]);
            setNewMember({ name: '', studentNumber: '', department: '', role: 'USER' });
            setShowPopup(false);
        } catch (err) {
            console.error(err);
            alert("회원가입 실패");
        }
    };

    const removeSelectedMember = async () => {
        if (selectedIndex === null) return;

        const target = members[selectedIndex];
        if (!window.confirm(`${target.name}을(를) 삭제하시겠습니까?`)) return;

        try {
            // 백엔드에 삭제 요청
            await fetch(`http://localhost:8080/api/users/${target.id}`, { method: "DELETE" });
            const updated = members.filter((_, i) => i !== selectedIndex);
            setMembers(updated);
            setSelectedIndex(null);
        } catch (err) {
            console.error(err);
            alert("삭제 실패");
        }
    };

    return (
        <div className="members-container">
            <button className="back-btn" onClick={() => navigate('/main')}>← 메인으로</button>

            <h2 className="page-title">👥 사용자 목록</h2>

            <div className="action-buttons">
                <button onClick={addMember}>추가</button>
                <button onClick={removeSelectedMember} disabled={selectedIndex === null}>삭제</button>
            </div>

            <div className="members-list">
                {members.map((m, i) => (
                    <div
                        className={`member-card ${selectedIndex === i ? 'selected-member' : ''}`}
                        key={i}
                        onClick={() => setSelectedIndex(i)}
                    >
                        <img src={defaultImg} alt={m.name} />
                        <h4>{m.name}</h4>
                        <p>{m.studentNumber}</p>
                        <p>{m.department}</p>
                        <p>{m.position}</p>
                    </div>
                ))}
            </div>

            {showPopup && (
                <div className="popup">
                    <h3>새 멤버 추가</h3>
                    <input name="name" placeholder="이름" value={newMember.name} onChange={handleInputChange} />
                    <input name="studentNumber" placeholder="학번" value={newMember.studentNumber} onChange={handleInputChange} />
                    <input name="department" placeholder="학과" value={newMember.department} onChange={handleInputChange} />
                    
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            name="role"
                            checked={newMember.role === "ADMIN"}
                            onChange={handleInputChange}
                        />
                        관리자
                    </label>

                    <div className="popup-buttons">
                        <button onClick={saveMember}>저장</button>
                        <button onClick={() => setShowPopup(false)}>취소</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MembersPage;
