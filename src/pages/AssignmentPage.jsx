import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AssignPage.css';

const STORAGE_KEY = 'labAssignments_v1';
const defaultUser = { id: 'u-0001', name: '홍길동' };

function AssignPage({ isAdmin = false, currentUser = defaultUser }) {
  const navigate = useNavigate();

  // 초기 과제 더미
  const initial = [
    { id: 'a-1', title: '알고리즘 과제 #1', dueDate: '2025-08-25', submissions: [] },
    { id: 'a-2', title: '논문 리뷰 1주차',   dueDate: '2025-08-28', submissions: [] },
  ];

  // 로컬스토리지 연동
  const [list, setList] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : initial;
    } catch { return initial; }
  });
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }, [list]);

  // 선택/입력 상태
  const [selectedId, setSelectedId] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [newDue, setNewDue] = useState('');
  const [submitUrl, setSubmitUrl] = useState('');

  const selected = useMemo(() => list.find(a => a.id === selectedId) || null, [list, selectedId]);

  // 유틸
  const validUrl = (u) => {
    try { const x = new URL(u); return ['http:', 'https:'].includes(x.protocol); }
    catch { return false; }
  };

  // 과제 추가
  const addAssignment = (e) => {
    e.preventDefault();
    if (!newTitle || !newDue) return;
    setList(prev => [{ id: `a-${Date.now()}`, title: newTitle.trim(), dueDate: newDue, submissions: [] }, ...prev]);
    setNewTitle(''); setNewDue('');
  };

  // 링크 제출(재제출 시 덮어쓰기)
  const submitLink = (e) => {
    e.preventDefault();
    if (!selected) return;
    if (!validUrl(submitUrl)) { alert('http/https 링크를 입력하세요.'); return; }
    setList(prev => prev.map(a => {
      if (a.id !== selected.id) return a;
      const next = [...a.submissions];
      const idx = next.findIndex(s => s.userId === currentUser.id);
      const payload = {
        userId: currentUser.id,
        userName: currentUser.name,
        url: submitUrl.trim(),
        submittedAt: new Date().toISOString(),
        status: '제출됨',
        score: null,
        note: '',
      };
      if (idx >= 0) next[idx] = payload; else next.unshift(payload);
      return { ...a, submissions: next };
    }));
    setSubmitUrl('');
  };

  // 관리자 채점/상태 변경
  const updateSubmission = (userId, patch) => {
    setList(prev => prev.map(a => {
      if (a.id !== selected?.id) return a;
      return { ...a, submissions: a.submissions.map(s => s.userId === userId ? { ...s, ...patch } : s) };
    }));
  };

  return (
    <div className="assign-container">
      <button className="back-btn" onClick={() => navigate('/main')}>← 메인으로</button>
      <h2>📋 과제 관리</h2>

      <div className="assign-layout">
        {/* 왼쪽: 목록 + 추가 */}
        <aside className="list">
          <div className="card">
            <h3>과제 목록</h3>
            <ul className="assn-ul">
              {list.map(a => (
                <li key={a.id}>
                  <button
                    className={`assn-item ${selectedId === a.id ? 'selected' : ''}`}
                    onClick={() => setSelectedId(a.id)}
                  >
                    <span className="title">{a.title}</span>
                    <span className="due">마감: {a.dueDate}</span>
                  </button>
                </li>
              ))}
              {list.length === 0 && <li className="muted">과제가 없습니다.</li>}
            </ul>
          </div>

          <div className="card">
            <h3>새 과제 추가</h3>
            <form className="submit-form" onSubmit={addAssignment}>
              <input type="text" placeholder="과제 제목" value={newTitle} onChange={(e)=>setNewTitle(e.target.value)} required />
              <input type="date" value={newDue} onChange={(e)=>setNewDue(e.target.value)} required />
              <button className="primary">추가</button>
            </form>
          </div>
        </aside>

        {/* 오른쪽: 상세/제출/관리자 */}
        <main className="detail">
          {!selected ? (
            <div className="card">
              <h3>과제를 선택하세요</h3>
              <p className="muted">왼쪽 목록에서 하나를 선택하거나 새 과제를 추가하세요.</p>
            </div>
          ) : (
            <>
              <div className="card">
                <h3>{selected.title}</h3>
                <p className="muted">마감일: {selected.dueDate}</p>
              </div>

              <div className="card">
                <h4>과제 링크 제출</h4>
                <form className="submit-form" onSubmit={submitLink}>
                  <input
                    type="url"
                    placeholder="https:// 제출 링크"
                    value={submitUrl}
                    onChange={(e)=>setSubmitUrl(e.target.value)}
                    required
                  />
                  <button className="primary">제출</button>
                </form>

                {/* 내 제출 요약 */}
                {selected.submissions.some(s => s.userId === currentUser.id) && (
                  <div className="my-sub">
                    {selected.submissions.filter(s => s.userId === currentUser.id).slice(0,1).map(s => (
                      <div key={s.userId} className="mine">
                        <a href={s.url} target="_blank" rel="noreferrer">{s.url}</a>
                        <span className="badge">{s.status}</span>
                        <span className="muted">{new Date(s.submittedAt).toLocaleString()}</span>
                        <div className="muted">
                          채점: {s.score != null ? `${s.score}점` : '없음'} {s.note && `(${s.note})`}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {isAdmin && (
                <div className="card">
                  <h4>관리자: 제출 현황/채점</h4>
                  {selected.submissions.length === 0 ? (
                    <p className="muted">제출이 없습니다.</p>
                  ) : (
                    <table className="assn-table">
                      <thead>
                        <tr>
                          <th>이름</th><th>링크</th><th>시각</th><th>상태</th><th>점수</th><th>메모</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selected.submissions.map(s => (
                          <tr key={s.userId}>
                            <td>{s.userName}</td>
                            <td className="url"><a href={s.url} target="_blank" rel="noreferrer">{s.url}</a></td>
                            <td>{new Date(s.submittedAt).toLocaleString()}</td>
                            <td>
                              <select value={s.status} onChange={(e)=>updateSubmission(s.userId, { status: e.target.value })}>
                                <option>제출됨</option>
                                <option>검토중</option>
                                <option>완료</option>
                                <option>미제출</option>
                              </select>
                            </td>
                            <td>
                              <input
                                type="number" min="0" max="100" placeholder="-"
                                value={s.score ?? ''}
                                onChange={(e)=>updateSubmission(s.userId, { score: e.target.value === '' ? null : Number(e.target.value) })}
                                className="score"
                              />
                            </td>
                            <td>
                              <input
                                type="text" placeholder="메모"
                                value={s.note || ''}
                                onChange={(e)=>updateSubmission(s.userId, { note: e.target.value })}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default AssignPage;
