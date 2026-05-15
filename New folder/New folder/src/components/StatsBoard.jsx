import React from 'react';

function StatsBoard({ grossWpm, netWpm, accuracy, errors }) {
  return (
    <div className="stats-board">
      <div className="stat-item">
        <span className="stat-value">{netWpm}</span>
        <span className="stat-label" title="Net Words Per Minute">Net WPM</span>
      </div>
      <div className="stat-item">
        <span className="stat-value" style={{ color: '#94a3b8' }}>{grossWpm}</span>
        <span className="stat-label" title="Gross Words Per Minute">Gross WPM</span>
      </div>
      <div className="stat-item">
        <span className="stat-value">{accuracy}%</span>
        <span className="stat-label">Accuracy</span>
      </div>
      <div className="stat-item">
        <span className="stat-value" style={{ color: 'var(--incorrect-color)' }}>{errors}</span>
        <span className="stat-label">Errors</span>
      </div>
    </div>
  );
}

export default StatsBoard;
