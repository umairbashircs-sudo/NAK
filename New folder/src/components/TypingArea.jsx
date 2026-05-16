import React, { useRef, useEffect } from 'react';

function TypingArea({ 
  words, 
  typedWords, 
  setTypedWords, 
  currentInput, 
  setCurrentInput, 
  activeIndex, 
  setActiveIndex, 
  isRunning, 
  setIsRunning,
  onComplete
}) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (isRunning && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isRunning]);

  const handleKeyDown = (e) => {
    if (!isRunning && e.key !== 'Tab') {
      setIsRunning(true);
    }

    if (e.key === ' ' || e.code === 'Space') {
      e.preventDefault();
      
      // Prevent empty space submissions if they haven't typed anything for this word
      if (currentInput.trim().length === 0) return;

      const newTypedWords = [...typedWords, currentInput.trim()];
      setTypedWords(newTypedWords);
      setCurrentInput('');
      
      const newIndex = activeIndex + 1;
      setActiveIndex(newIndex);

      if (newIndex >= words.length) {
        onComplete();
      }
    } else if (e.key === 'Backspace') {
      // Allow backspace only within current input
      // If currentInput is empty, they cannot go back to the previous word
      if (currentInput.length === 0) {
        e.preventDefault();
      }
    }
  };

  const handleInputChange = (e) => {
    // Only accept input if we haven't finished all words
    if (activeIndex < words.length) {
      // Remove spaces from input since space is the submit key
      const val = e.target.value.replace(/\s/g, '');
      setCurrentInput(val);
    }
  };

  const renderWords = () => {
    return words.map((word, wordIndex) => {
      let wordClass = 'word urdu-text';
      
      if (wordIndex < activeIndex) {
        // Submitted words
        const typedWord = typedWords[wordIndex] || '';
        if (typedWord === word) {
          wordClass += ' correct-word';
        } else {
          wordClass += ' error-word';
        }
      } else if (wordIndex === activeIndex) {
        // Active word
        wordClass += ' active-word';
      }

      // Render individual characters for the active or submitted word
      const renderChars = () => {
        const targetChars = word.split('');
        const typedWordToCompare = wordIndex === activeIndex ? currentInput : (typedWords[wordIndex] || '');
        
        // Handle extra typed characters
        const extraChars = typedWordToCompare.slice(targetChars.length).split('');

        return (
          <>
            {targetChars.map((char, charIndex) => {
              let charClass = 'char';
              if (charIndex < typedWordToCompare.length) {
                charClass += char === typedWordToCompare[charIndex] ? ' correct' : ' incorrect';
              }
              return <span key={`char-${charIndex}`} className={charClass}>{char}</span>;
            })}
            {extraChars.map((char, extraIndex) => (
              <span key={`extra-${extraIndex}`} className="char extra incorrect">{char}</span>
            ))}
          </>
        );
      };

      return (
        <span key={wordIndex} className={wordClass}>
          {renderChars()}
        </span>
      );
    });
  };

  return (
    <div className="typing-container">
      <div 
        className="text-display" 
        onClick={() => inputRef.current && inputRef.current.focus()}
        dir="rtl"
        style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem 1rem', padding: '2rem' }}
      >
        {renderWords()}
      </div>
      <input
        ref={inputRef}
        type="text"
        className="typing-input urdu-text"
        value={currentInput}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onPaste={(e) => e.preventDefault()}
        placeholder={!isRunning ? "یہاں ٹائپ کرنا شروع کریں..." : ""}
        dir="rtl"
        autoComplete="off"
        spellCheck="false"
      />
      <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem', marginTop: '1rem' }}>
        Space دبانے پر لفظ مکمل ہو جائے گا اور آپ پچھلے لفظ پر واپس نہیں جا سکیں گے۔
      </div>
    </div>
  );
}

export default TypingArea;
