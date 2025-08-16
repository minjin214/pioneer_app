import React, { useState, useEffect } from 'react';
import './MembersPage.css';
import { useNavigate } from 'react-router-dom';
import defaultImg from '../assets/pioneer-intro.png';

function MembersPage() {
    const navigate = useNavigate();
    const [members, setMembers] = useState([
        { name: "이민진", studentId: "202310786", lab: "지능데이터융합학부", img: defaultImg, isDefault: true }
    ]);
    const [showPopup, setShowPopup] = useState(false);
    const [newMember, setNewMember] = useState({ name: '', studentId: '', lab: '', img: null });
    const [selectedIndex, setSelectedIndex] = useState(null);

    const addMember = () => setShowPopup(true);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewMember({ ...newMember, [name]: value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setNewMember({ ...newMember, img: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const saveMember = () => {
        if (!newMember.name || !newMember.studentId || !newMember.lab) {
            alert('모든 항목을 입력하세요.');
            return;
        }
        const updated = [...members, { ...newMember, img: newMember.img || defaultImg }];
        //updated.sort((a,b) => a.name.localeCompare(b.name));
        setMembers(updated);
        localStorage.setItem('membersData', JSON.stringify(updated)); // 로컬 스토리지 저장
        setNewMember({ name:'', studentId:'', lab:'', img:null });
        setShowPopup(false);
    };

    const removeSelectedMember = () => {
        if (selectedIndex === null) return;

        if (members[selectedIndex].isDefault) {
            alert('기본 멤버는 삭제할 수 없습니다.');
            return;
        }
        const confirmed = window.confirm('선택한 멤버를 정말 삭제하시겠습니까?');
        if (!confirmed) return;

        const updated = [...members];
        updated.splice(selectedIndex, 1);
        setMembers(updated);
        localStorage.setItem('membersData', JSON.stringify(updated)); // 로컬 스토리지 저장
        setSelectedIndex(null);
    };

    useEffect(() => {
        const saved = localStorage.getItem('membersData');
        if (saved) setMembers(JSON.parse(saved));
    }, []);

    return (
        <div className='members-container'>
            <button className="back-btn" onClick={() => navigate('/main')}>← 메인으로</button>

            <h2 className="page-title">👥 사용자 목록</h2>

            <div className="action-buttons">
                <button onClick={addMember}>추가</button>
                <button onClick={removeSelectedMember} disabled={selectedIndex === null}>삭제</button>
            </div>

            <div className='members-list'>
                {members.map((m, i) => (
                    <div 
                        className={`member-card ${selectedIndex === i ? 'selected-member' : ''}`} 
                        key={i} 
                        onClick={() => setSelectedIndex(i)}
                    >
                        <img src={m.img} alt={m.name} />
                        <h4>{m.name}</h4>
                        <p>{m.studentId}</p>
                        <p>{m.lab}</p>
                    </div>
                ))}
            </div>

            {showPopup && (
                <div className='popup'>
                    <h3>새 멤버 추가</h3>
                    <input name="name" placeholder="이름" value={newMember.name} onChange={handleInputChange}/>
                    <input name="studentId" placeholder="학번" value={newMember.studentId} onChange={handleInputChange}/>
                    <input name="lab" placeholder="학과" value={newMember.lab} onChange={handleInputChange}/>
                    <input type="file" accept="image/*" onChange={handleImageChange}/>
                    <div className='popup-buttons'>
                        <button onClick={saveMember}>저장</button>
                        <button onClick={() => setShowPopup(false)}>취소</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MembersPage;
