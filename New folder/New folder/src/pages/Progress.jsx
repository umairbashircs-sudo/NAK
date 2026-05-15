import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Progress() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // In a real app with MongoDB, this would call /api/getProgress
    // For now, we fetch from localStorage as a fallback if API fails
    const fetchHistory = async () => {
      try {
        const response = await axios.get('/.netlify/functions/getProgress');
        if (response.data) {
          setHistory(response.data);
        }
      } catch (err) {
        console.log('Using local fallback for progress data.');
        const localData = JSON.parse(localStorage.getItem('typingHistory') || '[]');
        setHistory(localData);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="glass-card">
      <h2 className="urdu-text" style={{ textAlign: 'center', marginBottom: '2rem' }}>آپ کی پروگریس (Your Progress)</h2>
      
      {loading ? (
        <p style={{ textAlign: 'center' }}>Loading...</p>
      ) : history.length === 0 ? (
        <p style={{ textAlign: 'center' }}>No history found. Start practicing!</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="history-table urdu-text">
            <thead>
              <tr>
                <th>Date</th>
                <th>WPM</th>
                <th>CPM</th>
                <th>Accuracy</th>
                <th>Errors</th>
              </tr>
            </thead>
            <tbody>
              {history.map((session, index) => (
                <tr key={index}>
                  <td dir="ltr" style={{ textAlign: 'left' }}>{new Date(session.date).toLocaleString()}</td>
                  <td dir="ltr" style={{ textAlign: 'left' }}>{session.wpm}</td>
                  <td dir="ltr" style={{ textAlign: 'left' }}>{session.cpm}</td>
                  <td dir="ltr" style={{ textAlign: 'left' }}>{session.accuracy}%</td>
                  <td dir="ltr" style={{ textAlign: 'left' }}>{session.errors}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Progress;
