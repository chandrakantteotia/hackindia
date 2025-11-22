// Leaderboard functionality
let currentFilter = 'all';

// Static demo data for leaderboard
const STATIC_LEADERBOARD = [
  { username: 'CryptoMaster', bestScore: 2847, totalEarned: 1245.50, dailyStreak: 15 },
  { username: 'TokenHunter', bestScore: 2654, totalEarned: 1180.25, dailyStreak: 12 },
  { username: 'GamePro2025', bestScore: 2489, totalEarned: 1095.75, dailyStreak: 18 },
  { username: 'SharpPlayer', bestScore: 2301, totalEarned: 985.40, dailyStreak: 9 },
  { username: 'MetaGamer', bestScore: 2156, totalEarned: 892.60, dailyStreak: 14 },
  { username: 'BlockchainKing', bestScore: 2089, totalEarned: 856.30, dailyStreak: 11 },
  { username: 'Web3Wizard', bestScore: 1987, totalEarned: 798.50, dailyStreak: 7 },
  { username: 'NFTCollector', bestScore: 1845, totalEarned: 745.20, dailyStreak: 13 },
  { username: 'DeFiLegend', bestScore: 1756, totalEarned: 695.80, dailyStreak: 8 },
  { username: 'TokenTrader', bestScore: 1689, totalEarned: 654.30, dailyStreak: 10 },
  { username: 'CryptoNinja', bestScore: 1598, totalEarned: 612.90, dailyStreak: 6 },
  { username: 'SmartGamer', bestScore: 1534, totalEarned: 589.40, dailyStreak: 9 },
  { username: 'ChainMaster', bestScore: 1467, totalEarned: 556.70, dailyStreak: 5 },
  { username: 'PolygonPro', bestScore: 1389, totalEarned: 523.60, dailyStreak: 11 },
  { username: 'EthEnthusiast', bestScore: 1298, totalEarned: 489.20, dailyStreak: 7 },
  { username: 'GameChanger', bestScore: 1245, totalEarned: 467.80, dailyStreak: 4 },
  { username: 'SharpShooter', bestScore: 1178, totalEarned: 445.30, dailyStreak: 8 },
  { username: 'TokenKing', bestScore: 1123, totalEarned: 423.90, dailyStreak: 6 },
  { username: 'WebWarrior', bestScore: 1089, totalEarned: 401.50, dailyStreak: 3 },
  { username: 'CryptoChamp', bestScore: 1034, totalEarned: 389.20, dailyStreak: 9 }
];

async function loadLeaderboard(filter = 'all') {
  currentFilter = filter;
  
  try {
    let players = [];
    
    try {
      const snapshot = await db.collection('leaderboard')
        .orderBy('bestScore', 'desc')
        .limit(50)
        .get();
      
      if (!snapshot.empty) {
        snapshot.forEach(doc => {
          players.push({ id: doc.id, ...doc.data() });
        });
      }
    } catch (error) {
      console.log('Using static leaderboard data');
    }
    
    // Use static data if no Firebase data
    if (players.length === 0) {
      players = STATIC_LEADERBOARD.map((p, i) => ({ id: 'user_' + i, ...p }));
    }
    
    // Update podium (top 3)
    if (players.length > 0) {
      updatePodium(players.slice(0, 3));
    }
    
    // Update table
    let html = '';
    players.forEach((player, index) => {
      const rank = index + 1;
      const username = player.username || 'Anonymous';
      const score = player.bestScore || 0;
      const tokens = player.totalEarned || 0;
      const streak = player.dailyStreak || 0;
      
      html += `
        <tr>
          <td class="rank-cell">#${rank}</td>
          <td>
            <div class="player-cell">
              <div class="player-avatar">👤</div>
              <span class="player-name">${username}</span>
            </div>
          </td>
          <td class="score-cell">${score.toLocaleString()}</td>
          <td>${tokens.toFixed(2)} SHARP</td>
          <td>${streak} 🔥</td>
        </tr>
      `;
    });
    
    document.getElementById('leaderboardBody').innerHTML = html;
    
    // Show user's rank if logged in
    if (typeof currentUser !== 'undefined' && currentUser) {
      showUserRank(players);
    }
    
  } catch (error) {
    console.error('Error loading leaderboard:', error);
    // Use static data as fallback
    const players = STATIC_LEADERBOARD.map((p, i) => ({ id: 'user_' + i, ...p }));
    
    let html = '';
    players.forEach((player, index) => {
      const rank = index + 1;
      html += `
        <tr>
          <td class="rank-cell">#${rank}</td>
          <td>
            <div class="player-cell">
              <div class="player-avatar">👤</div>
              <span class="player-name">${player.username}</span>
            </div>
          </td>
          <td class="score-cell">${player.bestScore.toLocaleString()}</td>
          <td>${player.totalEarned.toFixed(2)} SHARP</td>
          <td>${player.dailyStreak} 🔥</td>
        </tr>
      `;
    });
    
    document.getElementById('leaderboardBody').innerHTML = html;
    updatePodium(players.slice(0, 3));
  }
}

function updatePodium(topPlayers) {
  // First place
  if (topPlayers[0]) {
    document.getElementById('rank1Name').textContent = topPlayers[0].username || 'Anonymous';
    document.getElementById('rank1Score').textContent = topPlayers[0].bestScore || 0;
  }
  
  // Second place
  if (topPlayers[1]) {
    document.getElementById('rank2Name').textContent = topPlayers[1].username || 'Anonymous';
    document.getElementById('rank2Score').textContent = topPlayers[1].bestScore || 0;
  }
  
  // Third place
  if (topPlayers[2]) {
    document.getElementById('rank3Name').textContent = topPlayers[2].username || 'Anonymous';
    document.getElementById('rank3Score').textContent = topPlayers[2].bestScore || 0;
  }
}

async function showUserRank(allPlayers) {
  if (typeof currentUser === 'undefined' || !currentUser) return;
  
  try {
    const userDoc = await db.collection('users').doc(currentUser.uid).get();
    if (!userDoc.exists) return;
    
    const userData = userDoc.data();
    const userRank = allPlayers.findIndex(p => p.id === currentUser.uid) + 1;
    
    if (userRank > 0) {
      document.getElementById('yourRankBadge').textContent = `#${userRank}`;
      document.getElementById('yourBestScore').textContent = userData.bestScore || 0;
      document.getElementById('yourTotalEarned').textContent = (userData.totalEarned || 0).toFixed(2) + ' SHARP';
      document.getElementById('yourRank').style.display = 'block';
    }
  } catch (error) {
    console.error('Error showing user rank:', error);
  }
}

function filterLeaderboard(filter) {
  // Update button states
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');
  
  // For now, just reload (in production, filter by date)
  loadLeaderboard(filter);
}

// Load leaderboard when page loads
window.addEventListener('load', () => {
  loadLeaderboard();
});

// Refresh every 30 seconds
setInterval(() => {
  loadLeaderboard(currentFilter);
}, 30000);
