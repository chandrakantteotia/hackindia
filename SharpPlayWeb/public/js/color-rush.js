// Color Rush Game
const colors = [
  { name: 'RED', hex: '#EF4444' },
  { name: 'BLUE', hex: '#3B82F6' },
  { name: 'GREEN', hex: '#10B981' },
  { name: 'YELLOW', hex: '#F59E0B' },
  { name: 'PURPLE', hex: '#8B5CF6' },
  { name: 'ORANGE', hex: '#F97316' },
  { name: 'PINK', hex: '#EC4899' },
  { name: 'CYAN', hex: '#06B6D4' }
];

let score = 0;
let level = 1;
let streak = 0;
let bestStreak = 0;
let lives = 3;
let timeLeft = 30;
let currentCorrectColor = null;
let gameActive = false;
let timerInterval = null;
let startTime = null;

function startGame() {
  score = 0;
  level = 1;
  streak = 0;
  bestStreak = 0;
  lives = 3;
  timeLeft = 30;
  gameActive = true;
  startTime = Date.now();
  
  document.getElementById('startBtn').style.display = 'none';
  updateStats();
  updateLives();
  nextRound();
  startTimer();
}

function nextRound() {
  if (!gameActive) return;
  
  // Select random colors
  const textColor = colors[Math.floor(Math.random() * colors.length)];
  const displayColor = colors[Math.floor(Math.random() * colors.length)];
  
  // The correct answer is the text, not the display color
  currentCorrectColor = textColor.name;
  
  // Display the text in a different color
  const colorDisplay = document.getElementById('colorText');
  colorDisplay.textContent = textColor.name;
  colorDisplay.style.color = displayColor.hex;
  
  // Create 4 options
  const options = [textColor];
  while (options.length < 4) {
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    if (!options.find(c => c.name === randomColor.name)) {
      options.push(randomColor);
    }
  }
  
  // Shuffle options
  options.sort(() => Math.random() - 0.5);
  
  // Render options
  const optionsContainer = document.getElementById('colorOptions');
  optionsContainer.innerHTML = '';
  
  options.forEach(color => {
    const button = document.createElement('div');
    button.className = 'color-option';
    button.style.backgroundColor = color.hex;
    button.style.color = '#fff';
    button.textContent = color.name;
    button.onclick = () => selectColor(color.name, button);
    optionsContainer.appendChild(button);
  });
}

function selectColor(selectedColor, button) {
  if (!gameActive) return;
  
  const allButtons = document.querySelectorAll('.color-option');
  allButtons.forEach(btn => btn.style.pointerEvents = 'none');
  
  if (selectedColor === currentCorrectColor) {
    // Correct!
    button.classList.add('correct');
    streak++;
    bestStreak = Math.max(bestStreak, streak);
    
    const points = 100 + (streak * 10) + (level * 50);
    score += points;
    timeLeft += 2; // Bonus time
    
    // Show combo
    if (streak > 2) {
      const comboDisplay = document.getElementById('comboDisplay');
      comboDisplay.textContent = `🔥 ${streak}x COMBO! +${points} pts`;
      setTimeout(() => comboDisplay.textContent = '', 1000);
    }
    
    // Level up every 5 correct answers
    if (streak % 5 === 0) {
      level++;
      timeLeft += 5; // Level bonus
    }
    
    updateStats();
    
    setTimeout(() => {
      allButtons.forEach(btn => btn.style.pointerEvents = 'auto');
      nextRound();
    }, 500);
    
  } else {
    // Wrong!
    button.classList.add('wrong');
    lives--;
    streak = 0;
    
    document.getElementById('comboDisplay').textContent = '❌ Wrong!';
    setTimeout(() => document.getElementById('comboDisplay').textContent = '', 1000);
    
    updateLives();
    
    if (lives <= 0) {
      gameOver();
    } else {
      setTimeout(() => {
        allButtons.forEach(btn => btn.style.pointerEvents = 'auto');
        nextRound();
      }, 1000);
    }
  }
}

function updateStats() {
  document.getElementById('score').textContent = score;
  document.getElementById('level').textContent = level;
  document.getElementById('streak').textContent = streak;
}

function updateLives() {
  const livesDisplay = document.getElementById('livesDisplay');
  livesDisplay.innerHTML = '';
  
  for (let i = 0; i < 3; i++) {
    const heart = document.createElement('span');
    heart.textContent = i < lives ? '❤️' : '🖤';
    livesDisplay.appendChild(heart);
  }
}

function startTimer() {
  clearInterval(timerInterval);
  
  timerInterval = setInterval(() => {
    if (!gameActive) return;
    
    timeLeft--;
    document.getElementById('timer').textContent = timeLeft + 's';
    
    if (timeLeft <= 0) {
      gameOver();
    }
  }, 1000);
}

function gameOver() {
  gameActive = false;
  clearInterval(timerInterval);
  
  document.getElementById('finalScore').textContent = score;
  document.getElementById('finalStreak').textContent = bestStreak + 'x';
  document.getElementById('finalLevel').textContent = level;
  document.getElementById('gameOverPanel').style.display = 'flex';
}

async function submitScore() {
  if (typeof currentUser === 'undefined' || !currentUser) {
    alert('Please login to submit your score!');
    window.location.href = 'index.html';
    return;
  }
  
  try {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    
    // Save score directly to Firestore
    await db.collection('gamescores').add({
      userId: currentUser.uid,
      score: score,
      playDuration: elapsed,
      gameType: 'color-rush',
      level: level,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      createdAt: new Date().toISOString()
    });
    
    // Update user stats
    const userRef = db.collection('users').doc(currentUser.uid);
    const userDoc = await userRef.get();
    
    if (userDoc.exists) {
      const userData = userDoc.data();
      const currentBest = userData.bestScore || 0;
      const newBest = Math.max(currentBest, score);
      
      await userRef.update({
        bestScore: newBest,
        lastPlayed: firebase.firestore.FieldValue.serverTimestamp(),
        gamesPlayed: firebase.firestore.FieldValue.increment(1)
      });
    }
    
    // Update leaderboard
    await db.collection('leaderboard').doc(currentUser.uid).set({
      username: currentUser.displayName || currentUser.email?.split('@')[0] || 'Player',
      bestScore: score,
      totalEarned: 0,
      dailyStreak: 0,
      lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    
    // Calculate reward
    const reward = (score / 10).toFixed(2);
    
    alert(`Score submitted! 🎉\n\nScore: ${score}\nTime: ${elapsed}s\nLevel: ${level}\nEstimated Reward: ${reward} SHARP`);
    
    setTimeout(() => {
      window.location.href = 'profile.html';
    }, 2000);
    
  } catch (error) {
    console.error('Error submitting score:', error);
    alert('Error submitting score. Please try again.');
  }
}
