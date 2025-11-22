// Memory Match Game
let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;
let score = 0;
let startTime = null;
let timerInterval = null;
let difficulty = 'medium';
let gameActive = false;

const emojis = ['🎮', '🎯', '🎲', '🎪', '🎨', '🎭', '🎬', '🎤', '🎧', '🎹', 
               '🎺', '🎸', '🎻', '🎼', '🏆', '💎', '⚡', '🔥', '💰', '🌟'];

function startGame(selectedDifficulty) {
  difficulty = selectedDifficulty;
  const cardCount = difficulty === 'easy' ? 12 : difficulty === 'medium' ? 16 : 20;
  const pairCount = cardCount / 2;
  
  // Reset game state
  cards = [];
  flippedCards = [];
  matchedPairs = 0;
  moves = 0;
  score = 10000; // Start with high score, decrease with moves
  gameActive = true;
  
  // Select random emojis
  const selectedEmojis = emojis.slice(0, pairCount);
  const gameEmojis = [...selectedEmojis, ...selectedEmojis];
  
  // Shuffle cards
  cards = gameEmojis.sort(() => Math.random() - 0.5).map((emoji, index) => ({
    id: index,
    emoji: emoji,
    flipped: false,
    matched: false
  }));
  
  // Update grid columns based on difficulty
  const grid = document.getElementById('memoryGrid');
  grid.style.gridTemplateColumns = difficulty === 'easy' ? 'repeat(3, 1fr)' : 
                                    difficulty === 'medium' ? 'repeat(4, 1fr)' : 
                                    'repeat(5, 1fr)';
  
  renderCards();
  updateStats();
  startTimer();
}

function renderCards() {
  const grid = document.getElementById('memoryGrid');
  grid.innerHTML = '';
  
  cards.forEach(card => {
    const cardElement = document.createElement('div');
    cardElement.className = 'memory-card';
    cardElement.dataset.id = card.id;
    
    cardElement.innerHTML = `
      <div class="card-back">❓</div>
      <div class="card-front">${card.emoji}</div>
    `;
    
    cardElement.addEventListener('click', () => handleCardClick(card.id));
    grid.appendChild(cardElement);
  });
}

function handleCardClick(cardId) {
  if (!gameActive) return;
  
  const card = cards.find(c => c.id === cardId);
  if (card.flipped || card.matched || flippedCards.length >= 2) return;
  
  // Flip card
  card.flipped = true;
  flippedCards.push(card);
  updateCardVisual(cardId);
  
  if (flippedCards.length === 2) {
    moves++;
    score = Math.max(0, score - 50); // Lose points per move
    updateStats();
    checkMatch();
  }
}

function updateCardVisual(cardId) {
  const cardElement = document.querySelector(`[data-id="${cardId}"]`);
  const card = cards.find(c => c.id === cardId);
  
  if (card.matched) {
    cardElement.classList.add('matched');
  } else if (card.flipped) {
    cardElement.classList.add('flipped');
  } else {
    cardElement.classList.remove('flipped');
  }
}

function checkMatch() {
  setTimeout(() => {
    const [card1, card2] = flippedCards;
    
    if (card1.emoji === card2.emoji) {
      // Match found
      card1.matched = true;
      card2.matched = true;
      matchedPairs++;
      score += 500; // Bonus for match
      
      updateCardVisual(card1.id);
      updateCardVisual(card2.id);
      
      if (matchedPairs === cards.length / 2) {
        gameComplete();
      }
    } else {
      // No match
      card1.flipped = false;
      card2.flipped = false;
      
      updateCardVisual(card1.id);
      updateCardVisual(card2.id);
    }
    
    flippedCards = [];
    updateStats();
  }, 800);
}

function updateStats() {
  document.getElementById('moves').textContent = moves;
  document.getElementById('matches').textContent = matchedPairs;
  document.getElementById('score').textContent = score;
}

function startTimer() {
  startTime = Date.now();
  clearInterval(timerInterval);
  
  timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    document.getElementById('timer').textContent = elapsed + 's';
    
    // Lose points over time
    if (gameActive && elapsed > 0 && elapsed % 5 === 0) {
      score = Math.max(0, score - 10);
      updateStats();
    }
  }, 1000);
}

function gameComplete() {
  gameActive = false;
  clearInterval(timerInterval);
  
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  
  // Time bonus
  const timeBonus = Math.max(0, 1000 - (elapsed * 10));
  score += timeBonus;
  
  // Difficulty multiplier
  const multiplier = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 1.5 : 2;
  score = Math.floor(score * multiplier);
  
  // Show game over modal
  document.getElementById('finalScore').textContent = score;
  document.getElementById('finalMoves').textContent = moves;
  document.getElementById('finalTime').textContent = elapsed + 's';
  document.getElementById('gameOverPanel').style.display = 'flex';
}

async function submitScore() {
  if (!currentUser) {
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
      gameType: 'memory',
      difficulty: difficulty,
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
    
    alert(`Score submitted! 🎉\n\nScore: ${score}\nTime: ${elapsed}s\nDifficulty: ${difficulty}\nEstimated Reward: ${reward} SHARP`);
    
    // Optionally redirect to profile
    setTimeout(() => {
      window.location.href = 'profile.html';
    }, 2000);
    
  } catch (error) {
    console.error('Error submitting score:', error);
    alert('Error submitting score. Please try again.');
  }
}

// Auto-start on page load
window.addEventListener('load', () => {
  setTimeout(() => startGame('medium'), 500);
});
