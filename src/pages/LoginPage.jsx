import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";
import introImage from "../assets/pioneer-intro.png";
import API from "../api";

function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [keepLogin, setKeepLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data } = await API.post("/api/auth/login", {
        username,
        password,
      });

      if (data?.success) {
        const user = {
          id: data.userId,
          name: data.name,
          role: data.role,
          username,
        };

        // 로그인 유지 체크 시 localStorage, 아니면 sessionStorage
        const storage = keepLogin ? localStorage : sessionStorage;
        storage.setItem("user", JSON.stringify(user));

        // 서버가 세션쿠키를 내려줬다면(withCredentials=true) 이후 요청에 자동 포함
        alert("로그인 성공!");
        navigate("/main");
      } else {
        setError(data?.message || "아이디 또는 비밀번호가 잘못되었습니다.");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "로그인 실패");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>로그인</h2>

        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="아이디"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />

          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />

          {error && <div className="error-text">{error}</div>}

          <button type="submit" disabled={loading}>
            {loading ? "처리 중..." : "로그인"}
          </button>

          <div className="login-options">
            <button type="button" onClick={() => navigate("/signup")}>
              회원가입
            </button>
            <button type="button" onClick={() => navigate("/find")}>
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
            <button
              type="button"
              onClick={() => alert("관리자 로그인 인증 페이지 예정")}
            >
              관리자 로그인
            </button>
          </div>
        </form>
      </div>

      <div className="login-right">
        <img src={introImage} alt="동아리 소개" />
      </div>
    </div>
  );
}

export default LoginPage;