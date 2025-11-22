// Profile page functionality
let userProfileData = null;

// Trigger file input for photo upload
function triggerPhotoUpload() {
  document.getElementById('photoUpload').click();
}

// Handle photo upload
document.addEventListener('DOMContentLoaded', () => {
  const photoInput = document.getElementById('photoUpload');
  if (photoInput) {
    photoInput.addEventListener('change', handlePhotoUpload);
  }
});

async function handlePhotoUpload(event) {
  const file = event.target.files[0];
  if (!file || !currentUser) return;
  
  // Validate file
  if (!file.type.startsWith('image/')) {
    alert('Please select an image file');
    return;
  }
  
  if (file.size > 5 * 1024 * 1024) {
    alert('Image size must be less than 5MB');
    return;
  }
  
  try {
    // Convert to base64
    const reader = new FileReader();
    reader.onload = async function(e) {
      const photoURL = e.target.result;
      
      // Update Firebase
      await db.collection('users').doc(currentUser.uid).update({
        photoURL: photoURL,
        photoUpdatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      // Update UI
      displayProfilePhoto(photoURL);
      
      // Update navbar photo if function exists
      if (typeof updateNavProfilePhoto !== 'undefined') {
        updateNavProfilePhoto(photoURL);
      }
      
      alert('Profile photo updated successfully!');
    };
    reader.readAsDataURL(file);
    
  } catch (error) {
    console.error('Error uploading photo:', error);
    alert('Failed to update profile photo');
  }
}

function displayProfilePhoto(photoURL) {
  const photoImg = document.getElementById('profilePhoto');
  const iconSpan = document.getElementById('profileIcon');
  
  if (photoURL) {
    photoImg.src = photoURL;
    photoImg.style.display = 'block';
    iconSpan.style.display = 'none';
  } else {
    photoImg.style.display = 'none';
    iconSpan.style.display = 'block';
  }
}

async function loadProfile() {
  if (!currentUser) {
    window.location.href = 'index.html';
    return;
  }
  
  try {
    const userDoc = await db.collection('users').doc(currentUser.uid).get();
    
    if (userDoc.exists) {
      userProfileData = userDoc.data();
      updateProfileUI();
      loadTransactions();
    }
  } catch (error) {
    console.error('Error loading profile:', error);
  }
}

function updateProfileUI() {
  if (!userProfileData) return;
  
  const username = userProfileData.username || currentUser.displayName || 'User';
  document.getElementById('profileUsername').textContent = username;
  document.getElementById('profileEmail').textContent = userProfileData.email || currentUser.email || '';
  
  // Display profile photo if exists
  const photoURL = userProfileData.photoURL || currentUser.photoURL;
  displayProfilePhoto(photoURL);
  
  document.getElementById('profileBestScore').textContent = userProfileData.bestScore || 0;
  document.getElementById('profileStreak').textContent = (userProfileData.dailyStreak || 0) + ' 🔥';
  document.getElementById('profileTotalEarned').textContent = (userProfileData.totalEarned || 0).toFixed(2) + ' SHARP';
  document.getElementById('profileBalance').textContent = (userProfileData.tokensBalance || 0).toFixed(2) + ' SHARP';
  
  document.getElementById('walletAddress').value = userProfileData.walletAddress || '';
  document.getElementById('referralCode').textContent = userProfileData.referralCode || 'LOADING...';
}

async function updateWalletAddress() {
  if (!currentUser) return;
  
  const walletAddress = document.getElementById('walletAddress').value.trim();
  const statusDiv = document.getElementById('walletStatus');
  
  // Validate Ethereum address
  const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
  if (!ethAddressRegex.test(walletAddress)) {
    statusDiv.className = 'status-message error';
    statusDiv.textContent = 'Invalid Ethereum address format';
    statusDiv.style.display = 'block';
    return;
  }
  
  try {
    await db.collection('users').doc(currentUser.uid).update({
      walletAddress: walletAddress,
      manualWallet: true
    });
    
    statusDiv.className = 'status-message success';
    statusDiv.textContent = '✓ Wallet address saved successfully!';
    statusDiv.style.display = 'block';
    
    setTimeout(() => {
      statusDiv.style.display = 'none';
    }, 3000);
    
  } catch (error) {
    console.error('Error updating wallet:', error);
    statusDiv.className = 'status-message error';
    statusDiv.textContent = 'Failed to update wallet address';
    statusDiv.style.display = 'block';
  }
}

async function loadTransactions() {
  if (!currentUser) return;
  
  const listDiv = document.getElementById('transactionsList');
  
  try {
    const snapshot = await db.collection('transactions')
      .where('uid', '==', currentUser.uid)
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();
    
    if (snapshot.empty) {
      listDiv.innerHTML = '<p class="loading">No transactions yet. Play games to earn SHARP tokens!</p>';
      return;
    }
    
    let html = '';
    snapshot.forEach(doc => {
      const tx = doc.data();
      const date = tx.createdAt ? new Date(tx.createdAt.toDate()).toLocaleDateString() : 'N/A';
      const status = tx.status || 'pending';
      
      html += `
        <div class="transaction-item ${status}">
          <div class="transaction-info">
            <div class="transaction-amount">+${tx.amount.toFixed(2)} SHARP</div>
            <div class="transaction-status">
              <span class="status-badge ${status}">${status.toUpperCase()}</span>
              ${tx.note ? ' - ' + tx.note : ''}
            </div>
          </div>
          <div>
            <div class="transaction-date">${date}</div>
            ${tx.txHash ? `<a href="https://etherscan.io/tx/${tx.txHash}" target="_blank" class="transaction-hash">${tx.txHash.substring(0, 10)}...</a>` : ''}
          </div>
        </div>
      `;
    });
    
    listDiv.innerHTML = html;
    
  } catch (error) {
    console.error('Error loading transactions:', error);
    listDiv.innerHTML = '<p class="loading">Error loading transactions</p>';
  }
}

function copyReferralCode() {
  const code = document.getElementById('referralCode').textContent;
  navigator.clipboard.writeText(code);
  alert('Referral code copied!');
}

function shareReferral() {
  const code = userProfileData?.referralCode;
  if (!code) return;
  
  const url = `${window.location.origin}?ref=${code}`;
  const text = `Join me on SharpPlay and earn SHARP tokens by playing games! Use my referral code: ${code}`;
  
  if (navigator.share) {
    navigator.share({
      title: 'SharpPlay Referral',
      text: text,
      url: url
    });
  } else {
    navigator.clipboard.writeText(url);
    alert('Referral link copied to clipboard!');
  }
}

// Load profile when page loads
window.addEventListener('load', () => {
  // Wait for auth to initialize
  setTimeout(loadProfile, 1000);
});

// Refresh on auth state change
auth.onAuthStateChanged((user) => {
  if (user) {
    setTimeout(loadProfile, 500);
  }
});
