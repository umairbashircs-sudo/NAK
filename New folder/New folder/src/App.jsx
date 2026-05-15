import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import TypingPractice from './pages/TypingPractice';
import Progress from './pages/Progress';
import './index.css';

function App() {
  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="logo">اردو ٹائپنگ</div>
        <ul className="nav-links">
          <li><Link to="/">ہوم (Home)</Link></li>
          <li><Link to="/practice">مشق (Practice)</Link></li>
          <li><Link to="/progress">پروگریس (Progress)</Link></li>
        </ul>
      </nav>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/practice" element={<TypingPractice />} />
          <Route path="/progress" element={<Progress />} />
        </Routes>
      </main>
      
      <footer className="footer">
        <p>© 2026 Urdu Typing Practice. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
