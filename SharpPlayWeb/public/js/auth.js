// Authentication UI handling
function showLoginModal() {
  document.getElementById('loginModal').style.display = 'flex';
}

function closeLoginModal() {
  document.getElementById('loginModal').style.display = 'none';
}

function showSignupModal() {
  closeLoginModal();
  document.getElementById('signupModal').style.display = 'flex';
}

function closeSignupModal() {
  document.getElementById('signupModal').style.display = 'none';
}

// Google Sign In Handler
async function handleGoogleSignIn() {
  try {
    await signInWithGoogle();
    closeLoginModal();
    closeSignupModal();
  } catch (error) {
    console.error('Google sign in error:', error);
    if (error.code === 'auth/popup-closed-by-user') {
      alert('Sign in cancelled. Please try again.');
    } else if (error.code === 'auth/popup-blocked') {
      alert('Pop-up blocked. Please allow pop-ups for this site and try again.');
    } else {
      alert('Google sign in failed: ' + error.message);
    }
  }
}

async function handleEmailLogin(event) {
  event.preventDefault();
  
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  
  try {
    await signInWithEmail(email, password);
    closeLoginModal();
  } catch (error) {
    alert('Login failed: ' + error.message);
  }
}

async function handleEmailSignup(event) {
  event.preventDefault();
  
  const username = document.getElementById('signupUsername').value;
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;
  const referralCode = document.getElementById('signupReferral').value;
  
  // Store referral code for later
  if (referralCode) {
    localStorage.setItem('referralCode', referralCode);
  }
  
  try {
    await signUpWithEmail(email, password, username);
    closeSignupModal();
  } catch (error) {
    console.error('Signup error:', error);
    
    // Handle specific error cases
    if (error.code === 'auth/email-already-in-use') {
      const shouldLogin = confirm('This email is already registered. Would you like to log in instead?');
      if (shouldLogin) {
        closeSignupModal();
        showLoginModal();
        // Pre-fill the email in login form
        document.getElementById('loginEmail').value = email;
      }
    } else if (error.code === 'auth/weak-password') {
      alert('Password is too weak. Please use at least 6 characters.');
    } else if (error.code === 'auth/invalid-email') {
      alert('Invalid email address. Please check and try again.');
    } else {
      alert('Signup failed: ' + error.message);
    }
  }
}

// Close modals when clicking outside
window.onclick = function(event) {
  const loginModal = document.getElementById('loginModal');
  const signupModal = document.getElementById('signupModal');
  
  if (event.target == loginModal) {
    closeLoginModal();
  }
  if (event.target == signupModal) {
    closeSignupModal();
  }
}
