// Firebase Configuration
// Replace these values with your Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyBKJZGYvHBm6f63SeMSpdTG4snbMgYmDTE",
  authDomain: "hackindia-9574c.firebaseapp.com",
  databaseURL: "https://hackindia-9574c-default-rtdb.firebaseio.com",
  projectId: "hackindia-9574c",
  storageBucket: "hackindia-9574c.firebasestorage.app",
  messagingSenderId: "763583600422",
  appId: "1:763583600422:web:b75336b88181629ee293e7",
  measurementId: "G-LYTZWXZWQ7"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Firebase services
const auth = firebase.auth();
const db = firebase.firestore();
const functions = firebase.functions();

// Auth state observer
let currentUser = null;

auth.onAuthStateChanged(async (user) => {
  currentUser = user;
  if (user) {
    console.log('User logged in:', user.uid);
    await ensureUserDocument(user);
    updateUIForLoggedInUser(user);
  } else {
    console.log('User logged out');
    updateUIForLoggedOutUser();
  }
});

// Ensure user document exists in Firestore
async function ensureUserDocument(user) {
  const userRef = db.collection('users').doc(user.uid);
  const userDoc = await userRef.get();
  
  if (!userDoc.exists) {
    const referralCode = generateReferralCode();
    await userRef.set({
      username: user.displayName || user.email.split('@')[0],
      email: user.email,
      photoURL: user.photoURL || '',
      walletAddress: '',
      bestScore: 0,
      dailyStreak: 0,
      lastPlayedAt: null,
      tokensBalance: 0,
      totalEarned: 0,
      referralCode: referralCode,
      invitedBy: localStorage.getItem('referralCode') || '',
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  } else {
    // Update photoURL if it changed (e.g., from Google)
    const userData = userDoc.data();
    if (user.photoURL && user.photoURL !== userData.photoURL) {
      await userRef.update({
        photoURL: user.photoURL
      });
    }
  }
}

// Generate unique referral code
function generateReferralCode() {
  return 'SHARP' + Math.random().toString(36).substr(2, 6).toUpperCase();
}

// Google Sign In with better fallback
async function signInWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  
  try {
    // Try redirect method (works in all environments)
    await auth.signInWithRedirect(provider);
  } catch (error) {
    console.error('Google sign in error:', error);
    alert('Sign in failed: ' + error.message);
  }
}

// Handle redirect result on page load
auth.getRedirectResult()
  .then((result) => {
    if (result.user) {
      console.log('Successfully signed in:', result.user.email);
    }
  })
  .catch((error) => {
    console.error('Redirect result error:', error);
    alert('Sign in error: ' + error.message);
  });

// Email/Password Sign Up
async function signUpWithEmail(email, password, username) {
  try {
    const result = await auth.createUserWithEmailAndPassword(email, password);
    await result.user.updateProfile({ displayName: username });
    return result.user;
  } catch (error) {
    console.error('Sign up error:', error);
    throw error;
  }
}

// Email/Password Sign In
async function signInWithEmail(email, password) {
  try {
    await auth.signInWithEmailAndPassword(email, password);
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
}

// Sign Out
async function signOut() {
  try {
    // Disconnect wallet if connected
    if (typeof disconnectWallet !== 'undefined') {
      disconnectWallet();
    }
    
    // Clear wallet connection state
    localStorage.removeItem('walletConnected');
    
    await auth.signOut();
    window.location.href = 'index.html';
  } catch (error) {
    console.error('Sign out error:', error);
  }
}

// UI Updates
function updateUIForLoggedInUser(user) {
  const loginBtn = document.getElementById('loginBtn');
  const userProfile = document.getElementById('userProfile');
  const userName = document.getElementById('userName');
  
  if (loginBtn) loginBtn.style.display = 'none';
  if (userProfile) {
    userProfile.style.display = 'flex';
  }
  if (userName) {
    userName.textContent = user.displayName || user.email;
  }
  
  // Load and display profile photo
  loadNavProfilePhoto(user.uid);
}

async function loadNavProfilePhoto(uid) {
  try {
    const userDoc = await db.collection('users').doc(uid).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      // Prioritize Firebase stored photo, then auth photo
      const photoURL = userData.photoURL || (currentUser && currentUser.photoURL) || '';
      updateNavProfilePhoto(photoURL);
    } else if (currentUser && currentUser.photoURL) {
      // Fallback to auth photo if document doesn't exist yet
      updateNavProfilePhoto(currentUser.photoURL);
    }
  } catch (error) {
    console.error('Error loading profile photo:', error);
    // Try to use auth photo as fallback
    if (currentUser && currentUser.photoURL) {
      updateNavProfilePhoto(currentUser.photoURL);
    }
  }
}

function updateNavProfilePhoto(photoURL) {
  const photoImg = document.getElementById('navProfilePhoto');
  const iconSpan = document.getElementById('navProfileIcon');
  
  if (photoImg && iconSpan) {
    if (photoURL) {
      photoImg.src = photoURL;
      photoImg.style.display = 'block';
      iconSpan.style.display = 'none';
    } else {
      photoImg.style.display = 'none';
      iconSpan.style.display = 'block';
    }
  }
}

function updateUIForLoggedOutUser() {
  const loginBtn = document.getElementById('loginBtn');
  const userProfile = document.getElementById('userProfile');
  
  if (loginBtn) loginBtn.style.display = 'block';
  if (userProfile) userProfile.style.display = 'none';
}

// Check authentication
function requireAuth() {
  if (!currentUser) {
    alert('Please sign in to continue');
    window.location.href = 'index.html';
    return false;
  }
  return true;
}
