import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import MainPage from './pages/MainPage';
import SignupPage from './pages/SignupPage';
import FindAccountPage from './pages/FindAccountPage';
import SchedulePage from './pages/SchedulePage';
import MembersPage from './pages/MembersPage';
import AttendancePage from './pages/AttendancePage';
import AssignmentPage from './pages/AssignmentPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/main" element={<MainPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/find" element={<FindAccountPage />} />
      <Route path="/schedule" element={<SchedulePage />} />
      <Route path="/members" element={<MembersPage />} />
      <Route path="/attendance" element={<AttendancePage />} />
      <Route path="/assignment" element={<AssignmentPage />} />
      {/* <Route path="/study"       element={<AssignmentPage />} />
      <Route path="/project"     element={<AssignmentPage />} /> */}
    </Routes>
  );
}

export default App;

/*
import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
*/
