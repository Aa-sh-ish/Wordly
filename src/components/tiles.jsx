import { useEffect, useState, useRef } from 'react';
import './Tiles.css';

const WORD_LENGTH = 5;
const MAX_ATTEMPTS = 6;

function Tiles() {
  const [targetWord, setTargetWord] = useState('');
  const [guesses, setGuesses] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [currentRow, setCurrentRow] = useState(0);
  const inputRefs = useRef([]);

  const emptyRow = Array(WORD_LENGTH).fill('');

  useEffect(() => {
   fetch('https://raw.githubusercontent.com/dwyl/english-words/master/words.txt')
  .then(res => {
    if (!res.ok) throw new Error('Network response was not ok');
    return res.text();
  })
  .then(text => {
    const words = text
      .split('\n')
      .map(w => w.trim().toUpperCase())
      .filter(w => /^[A-Z]+$/.test(w) && w.length === WORD_LENGTH);
    const randomWord = words[Math.floor(Math.random() * words.length)];
    setTargetWord(randomWord);
    setGuesses(Array(MAX_ATTEMPTS).fill().map(() => [...emptyRow]));
    setFeedbacks(Array(MAX_ATTEMPTS).fill().map(() => [...emptyRow]));
    inputRefs.current = Array(MAX_ATTEMPTS).fill().map(() => Array(WORD_LENGTH).fill(null));
  })
  .catch(err => {
    console.error('Failed to fetch words:', err);
    setTargetWord('CHECK');
  });

  }, []);

  const handleChange = (e, row, col) => {
    const value = e.target.value.toUpperCase();
    if (/^[A-Z]?$/.test(value)) {
      const updatedGuesses = [...guesses];
      updatedGuesses[row][col] = value;
      setGuesses(updatedGuesses);

      if (value && col + 1 < WORD_LENGTH) {
        inputRefs.current[row][col + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (e, row, col) => {
    if (e.key === 'Backspace') {
      const updatedGuesses = [...guesses];
      if (updatedGuesses[row][col]) {
        updatedGuesses[row][col] = '';
        setGuesses(updatedGuesses);
      } else if (col > 0) {
        inputRefs.current[row][col - 1]?.focus();
        updatedGuesses[row][col - 1] = '';
        setGuesses(updatedGuesses);
      }
    }

    if (e.key === 'Enter') {
      checkWord(row);
    }
  };

  const checkWord = (row) => {
    const wordArr = guesses[row];
    if (wordArr.some((ch) => ch === '')) return;

    const result = Array(WORD_LENGTH).fill('grey');
    const targetArr = targetWord.split('');
    const usedIndices = [];

    wordArr.forEach((ch, i) => {
      if (ch === targetWord[i]) {
        result[i] = 'green';
        targetArr[i] = null;
        usedIndices.push(i);
      }
    });

    wordArr.forEach((ch, i) => {
      if (result[i] !== 'green') {
        const idx = targetArr.findIndex((t, j) => t === ch && !usedIndices.includes(j));
        if (idx !== -1) {
          result[i] = 'yellow';
          usedIndices.push(idx);
          targetArr[idx] = null;
        }
      }
    });

    const updatedFeedbacks = [...feedbacks];
    updatedFeedbacks[row] = result;
    setFeedbacks(updatedFeedbacks);

    if (wordArr.join('') === targetWord) {
      alert('🎉 Correct!');
    } else if (row + 1 >= MAX_ATTEMPTS) {
      alert(`💥 Out of attempts! The word was "${targetWord}"`);
    }

    if (row + 1 < MAX_ATTEMPTS && wordArr.join('') !== targetWord) {
      setCurrentRow(row + 1);
      setTimeout(() => {
        inputRefs.current[row + 1][0]?.focus();
      }, 50);
    }
  };

  if (!targetWord) return <div>Loading...</div>;

  return (
    <div className="tiles-grid">
      {guesses.map((row, rowIndex) => (
        <div className="tiles-container" key={rowIndex}>
          {row.map((letter, colIndex) => (
            <input
              key={colIndex}
              type="text"
              maxLength={1}
              value={letter}
              disabled={rowIndex !== currentRow}
              onChange={(e) => handleChange(e, rowIndex, colIndex)}
              onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
              className={`tile-input ${feedbacks[rowIndex][colIndex]}`}
              ref={(el) => {
                if (!inputRefs.current[rowIndex]) {
                  inputRefs.current[rowIndex] = [];
                }
                inputRefs.current[rowIndex][colIndex] = el;
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export default Tiles;
