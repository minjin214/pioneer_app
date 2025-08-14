import React from 'react';
import './MembersPage.css';
import { useNavigate } from 'react-router-dom';
import Image from '../assets/pioneer-intro.png';

const members = [
    { name: "이민진", studentId: "202310786", lab: "지능데이터융합학부", img: "Image"}
];

function MembersPage() {
    const navigate = useNavigate();
    return (
        <div className='members-container'>
            <button className="back-btn" onClick={() => navigate('/main')}>← 메인으로</button>
            <h2>👥 사용자 목록</h2>
            <div className='members-list'>
                {members.map((m,i) => (
                    <div className='member-card' key={i}>
                        <img src={m.img} alt={m.name} />
                        <h4>{m.name}</h4>
                        <p>{m.studentId}</p>
                        <p>{m.lab}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default MembersPage;