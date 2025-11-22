// Referral page functionality
let referralData = null;

async function loadReferralData() {
  if (!currentUser) {
    window.location.href = 'index.html';
    return;
  }
  
  try {
    const userDoc = await db.collection('users').doc(currentUser.uid).get();
    
    if (userDoc.exists) {
      referralData = userDoc.data();
      updateReferralUI();
      loadReferralStats();
    }
  } catch (error) {
    console.error('Error loading referral data:', error);
  }
}

function updateReferralUI() {
  if (!referralData) return;
  
  const code = referralData.referralCode || 'LOADING...';
  const baseUrl = window.location.origin;
  const referralUrl = `${baseUrl}?ref=${code}`;
  
  document.getElementById('referralCodeInput').value = code;
  document.getElementById('referralLinkInput').value = referralUrl;
}

async function loadReferralStats() {
  if (!currentUser) return;
  
  try {
    // Count total referrals
    const referralsSnapshot = await db.collection('users')
      .where('invitedBy', '==', referralData.referralCode)
      .get();
    
    document.getElementById('totalReferrals').textContent = referralsSnapshot.size;
    
    // Count active referrals (played in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    let activeCount = 0;
    referralsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.lastPlayedAt && data.lastPlayedAt.toDate() > sevenDaysAgo) {
        activeCount++;
      }
    });
    
    document.getElementById('activeReferrals').textContent = activeCount;
    
    // Calculate referral earnings (10% of referred users' earnings)
    let referralEarnings = 0;
    referralsSnapshot.forEach(doc => {
      const data = doc.data();
      referralEarnings += (data.totalEarned || 0) * 0.1;
    });
    
    document.getElementById('referralEarnings').textContent = referralEarnings.toFixed(2);
    
  } catch (error) {
    console.error('Error loading referral stats:', error);
  }
}

function copyReferralCode() {
  const input = document.getElementById('referralCodeInput');
  input.select();
  document.execCommand('copy');
  alert('Referral code copied to clipboard!');
}

function copyReferralLink() {
  const input = document.getElementById('referralLinkInput');
  input.select();
  document.execCommand('copy');
  alert('Referral link copied to clipboard!');
}

function shareTwitter() {
  const code = referralData?.referralCode;
  if (!code) return;
  
  const text = `Join me on SharpPlay and earn SHARP tokens by playing fun games! 🎮💰 Use my referral code: ${code}`;
  const url = `${window.location.origin}?ref=${code}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
  
  window.open(twitterUrl, '_blank');
}

function shareFacebook() {
  const code = referralData?.referralCode;
  if (!code) return;
  
  const url = `${window.location.origin}?ref=${code}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  
  window.open(facebookUrl, '_blank');
}

// Load referral data when page loads
window.addEventListener('load', () => {
  setTimeout(loadReferralData, 1000);
});

// Refresh on auth state change
auth.onAuthStateChanged((user) => {
  if (user) {
    setTimeout(loadReferralData, 500);
  }
});
