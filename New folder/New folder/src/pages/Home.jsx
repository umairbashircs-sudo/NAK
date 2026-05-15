import React from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="glass-card">
      <div className="hero">
        <h1 className="urdu-text">اردو ٹائپنگ کی مشق</h1>
        <p>Improve your Urdu typing speed and accuracy with our interactive practice tool. Track your progress over time and become a master of the Urdu keyboard.</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '2rem' }}>
        <button className="btn urdu-text" onClick={() => navigate('/practice')}>
          مشق شروع کریں (Start Practice)
        </button>
        <button className="btn urdu-text" onClick={() => navigate('/progress')} style={{ background: 'transparent', border: '2px solid var(--primary-color)' }}>
          پروگریس دیکھیں (View Progress)
        </button>
      </div>
    </div>
  );
}

export default Home;
