   export default function  checkWord (letters,TARGET_WORD,setFeedback) {
    const userWord = letters.join('');
    if (userWord.length < 5) return;

    const newFeedback = Array(5).fill('grey');
    const targetArr = TARGET_WORD.split('');
    const usedIndices = [];

    // First pass: check correct position (green)
    letters.forEach((letter, i) => {
      if (letter === TARGET_WORD[i]) {
        newFeedback[i] = 'green';
        usedIndices.push(i);
        targetArr[i] = null; // Mark as used
      }
    });

    // Second pass: check if letter exists elsewhere (yellow)
    letters.forEach((letter, i) => {
      if (newFeedback[i] !== 'green') {
        const foundIndex = targetArr.indexOf(letter);
        if (foundIndex !== -1 && !usedIndices.includes(foundIndex)) {
          newFeedback[i] = 'yellow';
          targetArr[foundIndex] = null; // Mark as used
        }
      }
    });

    setFeedback(newFeedback);
  };