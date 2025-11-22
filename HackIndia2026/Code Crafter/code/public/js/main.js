// Main page functionality

// Static demo data
const STATIC_DATA = {
  totalPlayers: 12847,
  totalRewards: 156420,
  gamesPlayed: 48392
};

async function loadHomePageStats() {
  try {
    // Try to load from Firebase, fallback to static data
    try {
      const usersSnapshot = await db.collection('users').get();
      document.getElementById('totalPlayers').textContent = usersSnapshot.size || STATIC_DATA.totalPlayers;
      
      let totalRewards = 0;
      usersSnapshot.forEach(doc => {
        totalRewards += doc.data().totalEarned || 0;
      });
      document.getElementById('totalRewards').textContent = (totalRewards || STATIC_DATA.totalRewards).toFixed(0);
      
      const scoresSnapshot = await db.collection('gamescores').get();
      document.getElementById('gamesPlayed').textContent = scoresSnapshot.size || STATIC_DATA.gamesPlayed;
    } catch (error) {
      // Use static data if Firebase fails
      console.log('Using static data for demo');
      document.getElementById('totalPlayers').textContent = STATIC_DATA.totalPlayers.toLocaleString();
      document.getElementById('totalRewards').textContent = STATIC_DATA.totalRewards.toLocaleString();
      document.getElementById('gamesPlayed').textContent = STATIC_DATA.gamesPlayed.toLocaleString();
    }
    
  } catch (error) {
    console.error('Error loading stats:', error);
    // Fallback to static data
    document.getElementById('totalPlayers').textContent = STATIC_DATA.totalPlayers.toLocaleString();
    document.getElementById('totalRewards').textContent = STATIC_DATA.totalRewards.toLocaleString();
    document.getElementById('gamesPlayed').textContent = STATIC_DATA.gamesPlayed.toLocaleString();
  }
}

// Load stats when page loads
if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
  window.addEventListener('load', loadHomePageStats);
}

// Handle referral code from URL
const urlParams = new URLSearchParams(window.location.search);
const refCode = urlParams.get('ref');
if (refCode) {
  localStorage.setItem('referralCode', refCode);
}
