import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import TypingArea from '../components/TypingArea';
import Timer from '../components/Timer';
import StatsBoard from '../components/StatsBoard';

function TypingPractice() {
  const navigate = useNavigate();
  const [level, setLevel] = useState(1);
  const [paragraph, setParagraph] = useState('');
  const [words, setWords] = useState([]);
  
  // Typing State
  const [typedWords, setTypedWords] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Timer State
  const [timeLimit, setTimeLimit] = useState(60);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Stats
  const [grossWpm, setGrossWpm] = useState(0);
  const [netWpm, setNetWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [errors, setErrors] = useState(0);

  const fetchParagraph = useCallback(async (selectedLevel) => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/.netlify/functions/getParagraph?level=${selectedLevel}`);
      if (response.data && response.data.text) {
        setParagraph(response.data.text);
        setWords(response.data.text.trim().split(/\s+/));
      }
    } catch (error) {
      console.error('Error fetching paragraph, using fallback.', error);
      const fallback = "اردو ہماری قومی زبان ہے۔ اس کی ترویج اور ترقی ہم سب کی ذمہ داری ہے۔";
      setParagraph(fallback);
      setWords(fallback.trim().split(/\s+/));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchParagraph(level);
  }, [level, fetchParagraph]);

  const calculateStats = useCallback(() => {
    let uncorrectedErrors = 0;
    let totalKeystrokes = 0;
    let correctKeystrokes = 0;

    // Calculate for submitted words
    typedWords.forEach((typed, i) => {
      const target = words[i];
      if (!target) return;
      
      const targetLen = target.length;
      const typedLen = typed.length;
      const maxLen = Math.max(targetLen, typedLen);
      
      // Each submitted word effectively includes a space, so +1 to keystrokes
      totalKeystrokes += typedLen + 1; 

      for (let j = 0; j < maxLen; j++) {
        if (typed[j] === target[j]) {
          correctKeystrokes++;
        } else {
          uncorrectedErrors++;
        }
      }
    });

    // Calculate for current active word
    if (currentInput.length > 0) {
      const target = words[activeIndex] || "";
      const maxLen = Math.max(target.length, currentInput.length);
      totalKeystrokes += currentInput.length;
      
      for (let j = 0; j < currentInput.length; j++) {
        if (currentInput[j] === target[j]) {
          correctKeystrokes++;
        } else {
          // Mistakes in current word are errors but user can still fix them.
          // In strict Net WPM, these count as errors until fixed.
          uncorrectedErrors++; 
        }
      }
    }

    setErrors(uncorrectedErrors);
    
    const timeSpentMinutes = ((timeLimit - timeLeft) || 1) / 60;
    
    // Standard Gross WPM
    const gross = Math.round((totalKeystrokes / 5) / timeSpentMinutes);
    setGrossWpm(Math.max(0, gross));
    
    // Standard Net WPM
    const net = Math.round(((totalKeystrokes - uncorrectedErrors) / 5) / timeSpentMinutes);
    setNetWpm(Math.max(0, net));
    
    // Accuracy
    const acc = totalKeystrokes > 0 
      ? Math.round((correctKeystrokes / totalKeystrokes) * 100) 
      : 100;
    setAccuracy(Math.max(0, acc));

  }, [typedWords, currentInput, words, activeIndex, timeLeft, timeLimit]);

  useEffect(() => {
    if (isRunning) {
      calculateStats();
    }
  }, [typedWords, currentInput, isRunning, calculateStats]);

  const handleTimeUp = useCallback(async () => {
    setIsRunning(false);
    setIsFinished(true);
    calculateStats();
    
    const sessionData = {
      date: new Date().toISOString(),
      wpm: netWpm, // Saving Net WPM as main WPM
      cpm: Math.round(netWpm * 5),
      accuracy,
      errors
    };

    try {
      await axios.post('/.netlify/functions/saveProgress', sessionData);
    } catch (err) {
      const localData = JSON.parse(localStorage.getItem('typingHistory') || '[]');
      localData.unshift(sessionData);
      localStorage.setItem('typingHistory', JSON.stringify(localData));
    }
  }, [calculateStats, netWpm, accuracy, errors]);

  const resetState = () => {
    setTypedWords([]);
    setCurrentInput('');
    setActiveIndex(0);
    setIsRunning(false);
    setIsFinished(false);
    setTimeLeft(timeLimit);
    setGrossWpm(0);
    setNetWpm(0);
    setAccuracy(100);
    setErrors(0);
  };

  const handleRestart = () => {
    resetState();
  };

  const handleNewTest = () => {
    resetState();
    fetchParagraph(level);
  };

  const handleLevelChange = (e) => {
    const newLevel = parseInt(e.target.value);
    setLevel(newLevel);
    resetState();
  };

  const handleTimeLimitChange = (e) => {
    const newLimit = parseInt(e.target.value);
    setTimeLimit(newLimit);
    setTimeLeft(newLimit);
    resetState();
  };

  return (
    <div className="glass-card" style={{ maxWidth: '1000px', width: '100%' }}>
      <div className="controls" style={{ marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 className="urdu-text" style={{ margin: 0, minWidth: '150px' }}>ٹائپنگ مشق</h2>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <select 
            className="timer-select urdu-text" 
            value={level} 
            onChange={handleLevelChange}
            disabled={isRunning}
            dir="rtl"
          >
            <option value={1}>لیول 1 (Basic Words)</option>
            <option value={2}>لیول 2 (Sentences)</option>
            <option value={3}>لیول 3 (Easy Paragraphs)</option>
            <option value={4}>لیول 4 (Paragraphs)</option>
            <option value={5}>لیول 5 (Medium Paragraphs)</option>
            <option value={6}>لیول 6 (Advanced Paragraphs)</option>
            <option value={7}>لیول 7 (Hard Paragraphs)</option>
            <option value={8}>لیول 8 (Complex Paragraphs)</option>
            <option value={9}>لیول 9 (Expert Paragraphs)</option>
            <option value={10}>لیول 10 (News Articles)</option>
          </select>

          <select 
            className="timer-select urdu-text" 
            value={timeLimit} 
            onChange={handleTimeLimitChange}
            disabled={isRunning}
            dir="rtl"
          >
            <option value={60}>1 منٹ</option>
            <option value={300}>5 منٹ</option>
            <option value={600}>10 منٹ</option>
          </select>
          <Timer 
            timeLimit={timeLimit} 
            timeLeft={timeLeft} 
            setTimeLeft={setTimeLeft} 
            isRunning={isRunning} 
            onTimeUp={handleTimeUp} 
          />
        </div>
      </div>

      <StatsBoard grossWpm={grossWpm} netWpm={netWpm} accuracy={accuracy} errors={errors} />

      <div style={{ marginTop: '2rem' }}>
        {isLoading ? (
          <p className="urdu-text" style={{ textAlign: 'center' }}>پیراگراف لوڈ ہو رہا ہے...</p>
        ) : isFinished ? (
          <div style={{ textAlign: 'center', padding: '2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
            <h2 className="urdu-text" style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--correct-color)' }}>زبردست! (Awesome!)</h2>
            <p className="urdu-text">آپ نے اپنی مشق مکمل کر لی ہے۔</p>
            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn urdu-text" onClick={handleRestart}>
                اسی پیراگراف کو دوبارہ کریں (Restart Test)
              </button>
              <button className="btn urdu-text" onClick={handleNewTest} style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                نیا ٹیسٹ (New Test)
              </button>
              <button className="btn urdu-text" onClick={() => navigate('/progress')} style={{ background: 'transparent', border: '2px solid var(--primary-color)' }}>
                پروگریس دیکھیں
              </button>
            </div>
          </div>
        ) : (
          <TypingArea 
            words={words}
            typedWords={typedWords}
            setTypedWords={setTypedWords}
            currentInput={currentInput}
            setCurrentInput={setCurrentInput}
            activeIndex={activeIndex}
            setActiveIndex={setActiveIndex}
            isRunning={isRunning}
            setIsRunning={setIsRunning}
            onComplete={handleTimeUp}
          />
        )}
      </div>
    </div>
  );
}

export default TypingPractice;
