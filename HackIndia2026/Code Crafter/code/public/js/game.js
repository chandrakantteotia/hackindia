// Tap Reaction Game Engine
class TapReactionGame {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.width = 800;
    this.height = 600;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    
    // Game state
    this.score = 0;
    this.bestScore = 0;
    this.gameActive = false;
    this.gameStartTime = null;
    this.gameEndTime = null;
    this.targets = [];
    this.targetSpawnRate = 1000; // ms
    this.targetLifetime = 2000; // ms
    this.lastSpawn = 0;
    this.missedTargets = 0;
    this.maxMissed = 10;
    
    // Colors
    this.colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];
    
    // Event listeners
    this.canvas.addEventListener('click', this.handleClick.bind(this));
    
    // Load best score
    this.loadBestScore();
  }
  
  start() {
    this.score = 0;
    this.missedTargets = 0;
    this.targets = [];
    this.gameActive = true;
    this.gameStartTime = Date.now();
    this.lastSpawn = Date.now();
    this.targetSpawnRate = 1000;
    
    this.gameLoop();
  }
  
  gameLoop() {
    if (!this.gameActive) return;
    
    this.update();
    this.render();
    
    requestAnimationFrame(() => this.gameLoop());
  }
  
  update() {
    const now = Date.now();
    
    // Spawn new targets
    if (now - this.lastSpawn > this.targetSpawnRate) {
      this.spawnTarget();
      this.lastSpawn = now;
      
      // Increase difficulty over time
      if (this.targetSpawnRate > 400) {
        this.targetSpawnRate -= 10;
      }
    }
    
    // Update targets
    this.targets = this.targets.filter(target => {
      target.age = now - target.spawnTime;
      
      // Remove expired targets
      if (target.age > this.targetLifetime) {
        this.missedTargets++;
        if (this.missedTargets >= this.maxMissed) {
          this.endGame();
        }
        return false;
      }
      return true;
    });
    
    // Update UI
    this.updateUI();
  }
  
  spawnTarget() {
    const radius = 30 + Math.random() * 20;
    const target = {
      x: radius + Math.random() * (this.width - radius * 2),
      y: radius + Math.random() * (this.height - radius * 2),
      radius: radius,
      color: this.colors[Math.floor(Math.random() * this.colors.length)],
      spawnTime: Date.now(),
      age: 0
    };
    this.targets.push(target);
  }
  
  render() {
    // Clear canvas
    this.ctx.fillStyle = '#1a1a2e';
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    // Draw targets
    this.targets.forEach(target => {
      const alpha = 1 - (target.age / this.targetLifetime);
      this.ctx.save();
      this.ctx.globalAlpha = alpha;
      
      // Draw circle
      this.ctx.fillStyle = target.color;
      this.ctx.beginPath();
      this.ctx.arc(target.x, target.y, target.radius, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Draw ring
      this.ctx.strokeStyle = '#ffffff';
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.arc(target.x, target.y, target.radius, 0, Math.PI * 2);
      this.ctx.stroke();
      
      this.ctx.restore();
    });
    
    // Draw game over warning
    if (this.missedTargets > this.maxMissed / 2) {
      this.ctx.fillStyle = '#ff4444';
      this.ctx.font = 'bold 20px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(`Missed: ${this.missedTargets}/${this.maxMissed}`, this.width / 2, 30);
    }
  }
  
  handleClick(event) {
    if (!this.gameActive) return;
    
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Check if clicked on target
    for (let i = this.targets.length - 1; i >= 0; i--) {
      const target = this.targets[i];
      const distance = Math.sqrt(
        Math.pow(x - target.x, 2) + Math.pow(y - target.y, 2)
      );
      
      if (distance < target.radius) {
        // Hit!
        const points = Math.ceil(10 * (1 - target.age / this.targetLifetime));
        this.score += points;
        this.targets.splice(i, 1);
        this.playHitEffect(target.x, target.y);
        break;
      }
    }
  }
  
  playHitEffect(x, y) {
    // Visual feedback for hit
    this.ctx.save();
    this.ctx.fillStyle = '#ffffff';
    this.ctx.globalAlpha = 0.8;
    this.ctx.beginPath();
    this.ctx.arc(x, y, 50, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  }
  
  endGame() {
    this.gameActive = false;
    this.gameEndTime = Date.now();
    
    // Update best score
    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      this.saveBestScore();
    }
    
    // Show game over panel
    this.showGameOver();
  }
  
  updateUI() {
    document.getElementById('currentScore').textContent = this.score;
    document.getElementById('bestScore').textContent = this.bestScore;
    
    // Update timer
    if (this.gameStartTime) {
      const elapsed = Math.floor((Date.now() - this.gameStartTime) / 1000);
      document.getElementById('timer').textContent = elapsed + 's';
    }
  }
  
  showGameOver() {
    const panel = document.getElementById('gameOverPanel');
    document.getElementById('finalScore').textContent = this.score;
    document.getElementById('finalBestScore').textContent = this.bestScore;
    
    const playDuration = Math.floor((this.gameEndTime - this.gameStartTime) / 1000);
    document.getElementById('playDuration').textContent = playDuration + 's';
    
    panel.style.display = 'flex';
  }
  
  saveBestScore() {
    localStorage.setItem('bestScore', this.bestScore);
  }
  
  loadBestScore() {
    const saved = localStorage.getItem('bestScore');
    this.bestScore = saved ? parseInt(saved) : 0;
  }
  
  getPlayDuration() {
    if (this.gameStartTime && this.gameEndTime) {
      return Math.floor((this.gameEndTime - this.gameStartTime) / 1000);
    }
    return 0;
  }
}

// Initialize game when DOM is ready
let game = null;

function initGame() {
  game = new TapReactionGame('gameCanvas');
}

function startGame() {
  if (!requireAuth()) return;
  
  document.getElementById('gameOverPanel').style.display = 'none';
  game.start();
}

async function submitScore() {
  if (typeof currentUser === 'undefined' || !currentUser) {
    alert('Please sign in to submit your score');
    showLoginModal();
    return;
  }
  
  const submitBtn = document.getElementById('submitScoreBtn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Submitting...';
  
  try {
    const playDuration = game.getPlayDuration();
    
    // Save score to Firestore directly
    await db.collection('gamescores').add({
      userId: currentUser.uid,
      score: game.score,
      playDuration: playDuration,
      gameType: 'tap-reaction',
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      createdAt: new Date().toISOString()
    });
    
    // Update user stats
    const userRef = db.collection('users').doc(currentUser.uid);
    const userDoc = await userRef.get();
    
    if (userDoc.exists) {
      const userData = userDoc.data();
      const currentBest = userData.bestScore || 0;
      const newBest = Math.max(currentBest, game.score);
      
      await userRef.update({
        bestScore: newBest,
        lastPlayed: firebase.firestore.FieldValue.serverTimestamp(),
        gamesPlayed: firebase.firestore.FieldValue.increment(1)
      });
    }
    
    // Update leaderboard
    await db.collection('leaderboard').doc(currentUser.uid).set({
      username: currentUser.displayName || currentUser.email?.split('@')[0] || 'Player',
      bestScore: game.score,
      totalEarned: 0,
      dailyStreak: 0,
      lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    
    // Calculate reward (simple calculation)
    const reward = (game.score / 10).toFixed(2);
    
    alert(`Score submitted! 🎉\n\nScore: ${game.score}\nEstimated Reward: ${reward} SHARP\n\nNote: Actual token distribution requires backend setup.`);
    
    // Close game over panel
    document.getElementById('gameOverPanel').style.display = 'none';
    
  } catch (error) {
    console.error('Error submitting score:', error);
    alert('Failed to submit score. Please try again.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit Score';
  }
}

function showRewardPopup(data) {
  const popup = document.getElementById('rewardPopup');
  document.getElementById('rewardAmount').textContent = data.reward.toFixed(2);
  document.getElementById('rewardStreak').textContent = data.dailyStreak;
  
  if (data.txHash) {
    document.getElementById('rewardTxHash').textContent = data.txHash;
    document.getElementById('rewardTxHash').href = `https://etherscan.io/tx/${data.txHash}`;
  } else {
    document.getElementById('rewardTxHash').textContent = 'Pending...';
  }
  
  popup.style.display = 'flex';
}

function closeRewardPopup() {
  document.getElementById('rewardPopup').style.display = 'none';
}
