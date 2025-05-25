import { useRef, useState, useEffect } from 'react';
import './tiles.css';

const TARGET_WORD = 'CHECK';
const WORD_LENGTH = TARGET_WORD.length;
const MAX_ATTEMPTS = 6;

function Tiles() {
  const emptyRow = Array(WORD_LENGTH).fill('');
  const [guesses, setGuesses] = useState(Array(MAX_ATTEMPTS).fill().map(() => [...emptyRow]));
  const [feedbacks, setFeedbacks] = useState(Array(MAX_ATTEMPTS).fill().map(() => [...emptyRow]));
  const [currentRow, setCurrentRow] = useState(0);
  const inputRefs = useRef([]);

  useEffect(() => {
    inputRefs.current = Array(MAX_ATTEMPTS)
      .fill()
      .map(() => Array(WORD_LENGTH).fill(null));
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
        inputRefs.current[row][col - 1].focus();
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

    const word = wordArr.join('');
    const result = Array(WORD_LENGTH).fill('grey');
    const targetArr = TARGET_WORD.split('');
    const usedIndices = [];

    // Green pass
    wordArr.forEach((ch, i) => {
      if (ch === TARGET_WORD[i]) {
        result[i] = 'green';
        targetArr[i] = null;
        usedIndices.push(i);
      }
    });

    // Yellow pass
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

    if (word === TARGET_WORD) {
      alert('🎉 Correct!');
    } else if (row + 1 >= MAX_ATTEMPTS) {
      alert(`💥 Out of attempts! The word was "${TARGET_WORD}"`);
    }

    if (row + 1 < MAX_ATTEMPTS && word !== TARGET_WORD) {
      setCurrentRow(row + 1);
      setTimeout(() => {
        inputRefs.current[row + 1][0]?.focus();
      }, 50);
    }
  };

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
