import React, { useEffect } from 'react';

function Timer({ timeLimit, timeLeft, setTimeLeft, isRunning, onTimeUp }) {
  useEffect(() => {
    let timerId;
    if (isRunning && timeLeft > 0) {
      timerId = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      onTimeUp();
    }
    return () => clearInterval(timerId);
  }, [isRunning, timeLeft, onTimeUp, setTimeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="stat-item" style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
      <span className="stat-value">{formatTime(timeLeft)}</span>
      <span className="stat-label">Time Left</span>
    </div>
  );
}

export default Timer;
