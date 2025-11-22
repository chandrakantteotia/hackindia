const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { ethers } = require('ethers');

admin.initializeApp();
const db = admin.firestore();

// Configuration
const MIN_PLAY_TIME = 10; // seconds
const MAX_SCORE = 10000;
const RATE_LIMIT_WINDOW = 300000; // 5 minutes in ms
const MAX_SUBMISSIONS_PER_WINDOW = 5;

// ERC20 Token ABI (minimal for transfer)
const ERC20_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)"
];

/**
 * Submit Score - Main Cloud Function
 * Validates score, calculates rewards, updates user data, and transfers SHARP tokens
 */
exports.submitScore = functions.https.onCall(async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const uid = context.auth.uid;
  const { score, playDuration, timestamp } = data;

  // Input validation
  if (!score || !playDuration || !timestamp) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
  }

  if (score < 0 || score > MAX_SCORE) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid score value');
  }

  if (playDuration < MIN_PLAY_TIME) {
    throw new functions.https.HttpsError('failed-precondition', 
      `Game must be played for at least ${MIN_PLAY_TIME} seconds`);
  }

  try {
    // Rate limiting check
    await checkRateLimit(uid);

    // Get user data
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'User not found');
    }

    const userData = userDoc.data();

    // Calculate daily streak
    const { dailyStreak, isNewDay } = calculateDailyStreak(userData);

    // Calculate reward
    const reward = calculateReward(score, dailyStreak, userData);

    // Save game score
    await db.collection('gamescores').add({
      uid: uid,
      score: score,
      playDuration: playDuration,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      verified: true,
      rewardAmount: reward
    });

    // Update user data
    const updateData = {
      lastPlayedAt: admin.firestore.FieldValue.serverTimestamp(),
      dailyStreak: dailyStreak,
      tokensBalance: admin.firestore.FieldValue.increment(reward),
      totalEarned: admin.firestore.FieldValue.increment(reward)
    };

    // Update best score if applicable
    if (!userData.bestScore || score > userData.bestScore) {
      updateData.bestScore = score;
    }

    await userRef.update(updateData);

    // Update leaderboard
    await updateLeaderboard(uid, userData.username, score, userData.totalEarned + reward);

    // Transfer SHARP tokens if wallet address exists
    let txHash = null;
    if (userData.walletAddress && userData.walletAddress.startsWith('0x')) {
      txHash = await transferSHARPTokens(uid, userData.walletAddress, reward);
    }

    // Handle referral bonus
    if (userData.invitedBy) {
      await handleReferralBonus(userData.invitedBy, reward);
    }

    return {
      success: true,
      reward: reward,
      dailyStreak: dailyStreak,
      newBestScore: score > (userData.bestScore || 0),
      txHash: txHash
    };

  } catch (error) {
    console.error('Error in submitScore:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * Rate Limiting Check
 */
async function checkRateLimit(uid) {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;

  const recentScores = await db.collection('gamescores')
    .where('uid', '==', uid)
    .where('timestamp', '>', new Date(windowStart))
    .get();

  if (recentScores.size >= MAX_SUBMISSIONS_PER_WINDOW) {
    throw new functions.https.HttpsError('resource-exhausted', 
      'Too many submissions. Please wait before submitting again.');
  }
}

/**
 * Calculate Daily Streak
 */
function calculateDailyStreak(userData) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let dailyStreak = userData.dailyStreak || 0;
  let isNewDay = false;

  if (userData.lastPlayedAt) {
    const lastPlayed = userData.lastPlayedAt.toDate();
    lastPlayed.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor((today - lastPlayed) / (1000 * 60 * 60 * 24));

    if (daysDiff === 0) {
      // Same day - no change
      isNewDay = false;
    } else if (daysDiff === 1) {
      // Next day - increment streak
      dailyStreak += 1;
      isNewDay = true;
    } else {
      // Missed days - reset streak
      dailyStreak = 1;
      isNewDay = true;
    }
  } else {
    // First time playing
    dailyStreak = 1;
    isNewDay = true;
  }

  return { dailyStreak, isNewDay };
}

/**
 * Calculate Reward
 * Formula: reward = (score / 10) + streakBonus + achievementBonus
 */
function calculateReward(score, dailyStreak, userData) {
  let baseReward = score / 10;
  
  // Streak bonus (0.5 SHARP per day of streak, max 10 days)
  let streakBonus = Math.min(dailyStreak, 10) * 0.5;
  
  // Achievement bonuses
  let achievementBonus = 0;
  
  // New best score bonus
  if (!userData.bestScore || score > userData.bestScore) {
    achievementBonus += 2;
  }
  
  // High score milestone bonuses
  if (score >= 1000) achievementBonus += 5;
  if (score >= 500) achievementBonus += 2;
  if (score >= 100) achievementBonus += 1;
  
  const totalReward = baseReward + streakBonus + achievementBonus;
  
  return Math.max(0.1, totalReward); // Minimum 0.1 SHARP
}

/**
 * Update Leaderboard
 */
async function updateLeaderboard(uid, username, score, totalEarned) {
  const leaderboardRef = db.collection('leaderboard').doc(uid);
  const doc = await leaderboardRef.get();

  if (!doc.exists) {
    await leaderboardRef.set({
      uid: uid,
      username: username,
      bestScore: score,
      totalEarned: totalEarned,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    });
  } else {
    const currentBest = doc.data().bestScore || 0;
    if (score > currentBest) {
      await leaderboardRef.update({
        bestScore: score,
        totalEarned: totalEarned,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      });
    }
  }
}

/**
 * Transfer SHARP Tokens via Web3
 */
async function transferSHARPTokens(uid, toAddress, amount) {
  try {
    // Get configuration from environment
    const privateKey = functions.config().web3?.private_key || process.env.ADMIN_WALLET_PRIVATE_KEY;
    const tokenAddress = functions.config().web3?.token_address || process.env.SHARP_TOKEN_CONTRACT_ADDRESS;
    const rpcUrl = functions.config().web3?.rpc_url || process.env.RPC_URL || 'https://eth-mainnet.g.alchemy.com/v2/your-key';

    if (!privateKey || !tokenAddress) {
      console.warn('Web3 configuration missing, skipping token transfer');
      
      // Save pending transaction
      await db.collection('transactions').add({
        uid: uid,
        amount: amount,
        toAddress: toAddress,
        status: 'pending',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        note: 'Web3 configuration pending'
      });
      
      return null;
    }

    // Connect to blockchain
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, wallet);

    // Convert amount to token decimals (assuming 18 decimals)
    const amountInWei = ethers.parseUnits(amount.toFixed(6), 18);

    // Send transaction
    const tx = await tokenContract.transfer(toAddress, amountInWei);
    
    // Save transaction record
    await db.collection('transactions').add({
      uid: uid,
      amount: amount,
      toAddress: toAddress,
      txHash: tx.hash,
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      note: 'Game reward'
    });

    // Wait for confirmation (optional, can be done in background)
    const receipt = await tx.wait();

    // Update transaction status
    const txQuery = await db.collection('transactions')
      .where('txHash', '==', tx.hash)
      .limit(1)
      .get();
    
    if (!txQuery.empty) {
      await txQuery.docs[0].ref.update({
        status: 'completed',
        blockNumber: receipt.blockNumber,
        completedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    return tx.hash;

  } catch (error) {
    console.error('Error transferring tokens:', error);
    
    // Save failed transaction
    await db.collection('transactions').add({
      uid: uid,
      amount: amount,
      toAddress: toAddress,
      status: 'failed',
      error: error.message,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      note: 'Transfer failed'
    });
    
    return null;
  }
}

/**
 * Handle Referral Bonus
 */
async function handleReferralBonus(referralCode, earnedAmount) {
  try {
    // Find referrer
    const referrerQuery = await db.collection('users')
      .where('referralCode', '==', referralCode)
      .limit(1)
      .get();

    if (!referrerQuery.empty) {
      const referrerDoc = referrerQuery.docs[0];
      const bonusAmount = earnedAmount * 0.1; // 10% bonus for referrer

      await referrerDoc.ref.update({
        tokensBalance: admin.firestore.FieldValue.increment(bonusAmount),
        totalEarned: admin.firestore.FieldValue.increment(bonusAmount)
      });

      // Record referral bonus transaction
      await db.collection('transactions').add({
        uid: referrerDoc.id,
        amount: bonusAmount,
        status: 'completed',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        note: 'Referral bonus'
      });
    }
  } catch (error) {
    console.error('Error handling referral bonus:', error);
  }
}

/**
 * Weekly Tournament Processor
 * Scheduled function to process tournament winners
 */
exports.processTournament = functions.pubsub
  .schedule('0 0 * * 0') // Every Sunday at midnight
  .onRun(async (context) => {
    try {
      console.log('Processing weekly tournament...');

      // Get top 10 players
      const leaderboard = await db.collection('leaderboard')
        .orderBy('bestScore', 'desc')
        .limit(10)
        .get();

      if (leaderboard.empty) {
        console.log('No players to reward');
        return null;
      }

      const prizePool = 1000; // Total SHARP tokens
      const prizes = [500, 300, 150, 50, 50, 50, 50, 50, 50, 50]; // Distribution

      const batch = db.batch();
      let rank = 1;

      leaderboard.forEach((doc, index) => {
        const prize = prizes[index] || 0;
        const userRef = db.collection('users').doc(doc.id);

        batch.update(userRef, {
          tokensBalance: admin.firestore.FieldValue.increment(prize),
          totalEarned: admin.firestore.FieldValue.increment(prize)
        });

        // Record transaction
        const txRef = db.collection('transactions').doc();
        batch.set(txRef, {
          uid: doc.id,
          amount: prize,
          status: 'completed',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          note: `Tournament reward - Rank #${rank}`
        });

        rank++;
      });

      // Save tournament record
      const tournamentRef = db.collection('tournaments').doc();
      batch.set(tournamentRef, {
        name: 'Weekly Tournament',
        startAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
        endAt: admin.firestore.Timestamp.now(),
        prizePool: prizePool,
        winner: leaderboard.docs[0].data().username,
        participants: leaderboard.size,
        processed: true
      });

      await batch.commit();

      console.log('Tournament processed successfully');
      return null;

    } catch (error) {
      console.error('Error processing tournament:', error);
      return null;
    }
  });

/**
 * Get User Stats
 */
exports.getUserStats = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const uid = context.auth.uid;

  try {
    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'User not found');
    }

    const gamesPlayed = await db.collection('gamescores')
      .where('uid', '==', uid)
      .count()
      .get();

    return {
      ...userDoc.data(),
      gamesPlayed: gamesPlayed.data().count
    };

  } catch (error) {
    console.error('Error getting user stats:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});
