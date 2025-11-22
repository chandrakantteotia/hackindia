// Tournament functionality
let currentTournament = null;

async function loadTournament() {
  try {
    // Get active tournament
    const snapshot = await db.collection('tournaments')
      .where('endAt', '>', new Date())
      .orderBy('endAt', 'asc')
      .limit(1)
      .get();
    
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      currentTournament = { id: doc.id, ...doc.data() };
      updateTournamentUI();
      loadTournamentRankings();
      startCountdown();
    } else {
      // Create default tournament info
      document.getElementById('prizePool').textContent = '1000 SHARP';
      document.getElementById('participantCount').textContent = '0';
      document.getElementById('timeRemaining').textContent = 'Coming Soon';
    }
    
    loadPastTournaments();
    
  } catch (error) {
    console.error('Error loading tournament:', error);
  }
}

function updateTournamentUI() {
  if (!currentTournament) return;
  
  document.getElementById('prizePool').textContent = (currentTournament.prizePool || 1000) + ' SHARP';
  document.getElementById('participantCount').textContent = currentTournament.participants || 0;
}

async function loadTournamentRankings() {
  try {
    // Get top players from current leaderboard
    const snapshot = await db.collection('leaderboard')
      .orderBy('bestScore', 'desc')
      .limit(10)
      .get();
    
    if (snapshot.empty) {
      document.getElementById('tournamentRankings').innerHTML = '<tr><td colspan="4" class="loading">No participants yet</td></tr>';
      return;
    }
    
    const prizeDistribution = [
      { rank: 1, prize: '500 SHARP' },
      { rank: 2, prize: '300 SHARP' },
      { rank: 3, prize: '150 SHARP' },
      { rank: 4, prize: '50 SHARP' },
      { rank: 5, prize: '50 SHARP' },
      { rank: 6, prize: '50 SHARP' },
      { rank: 7, prize: '50 SHARP' },
      { rank: 8, prize: '50 SHARP' },
      { rank: 9, prize: '50 SHARP' },
      { rank: 10, prize: '50 SHARP' }
    ];
    
    let html = '';
    let rank = 1;
    
    snapshot.forEach(doc => {
      const player = doc.data();
      const prize = prizeDistribution[rank - 1]?.prize || '-';
      
      html += `
        <tr>
          <td class="rank-cell">#${rank}</td>
          <td>${player.username || 'Anonymous'}</td>
          <td class="score-cell">${player.bestScore || 0}</td>
          <td style="color: var(--success-color); font-weight: bold;">${prize}</td>
        </tr>
      `;
      rank++;
    });
    
    document.getElementById('tournamentRankings').innerHTML = html;
    
  } catch (error) {
    console.error('Error loading rankings:', error);
  }
}

function startCountdown() {
  if (!currentTournament || !currentTournament.endAt) {
    document.getElementById('timeRemaining').textContent = '6d 23h 59m';
    return;
  }
  
  const endTime = currentTournament.endAt.toDate ? currentTournament.endAt.toDate() : new Date(currentTournament.endAt);
  
  function updateCountdown() {
    const now = new Date();
    const diff = endTime - now;
    
    if (diff <= 0) {
      document.getElementById('timeRemaining').textContent = 'ENDED';
      return;
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    document.getElementById('timeRemaining').textContent = 
      `${days}d ${hours}h ${minutes}m ${seconds}s`;
  }
  
  updateCountdown();
  setInterval(updateCountdown, 1000);
}

async function loadPastTournaments() {
  try {
    const snapshot = await db.collection('tournaments')
      .where('endAt', '<', new Date())
      .orderBy('endAt', 'desc')
      .limit(6)
      .get();
    
    if (snapshot.empty) {
      document.getElementById('pastTournamentsList').innerHTML = 
        '<p class="loading">No past tournaments yet</p>';
      return;
    }
    
    let html = '';
    snapshot.forEach(doc => {
      const tournament = doc.data();
      const endDate = tournament.endAt ? new Date(tournament.endAt.toDate()).toLocaleDateString() : 'N/A';
      
      html += `
        <div class="past-tournament-card">
          <h3>${tournament.name || 'Weekly Tournament'}</h3>
          <div class="past-tournament-info">Ended: ${endDate}</div>
          <div class="past-tournament-info">Prize Pool: ${tournament.prizePool || 1000} SHARP</div>
          <div class="past-tournament-winner">
            <div class="winner-label">Winner:</div>
            <div class="winner-name">${tournament.winner || 'N/A'}</div>
          </div>
        </div>
      `;
    });
    
    document.getElementById('pastTournamentsList').innerHTML = html;
    
  } catch (error) {
    console.error('Error loading past tournaments:', error);
  }
}

// Load tournament when page loads
window.addEventListener('load', () => {
  loadTournament();
});

// Refresh rankings every 30 seconds
setInterval(() => {
  loadTournamentRankings();
}, 30000);
