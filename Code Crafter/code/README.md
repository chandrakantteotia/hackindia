# SharpPlay Web 🎮💰

**Play Web Games & Earn SHARP Tokens**

A fully web-based gaming platform where users can play fun browser games and earn cryptocurrency rewards. Built with Firebase, Web3, and vanilla JavaScript.

![SharpPlay Banner](https://via.placeholder.com/800x200/6C63FF/FFFFFF?text=SharpPlay+Web)

## 🌟 Features

### 🎯 Browser-Based Gaming
- **Tap Reaction Game**: Fast-paced target clicking game with increasing difficulty
- Canvas-based game engine with smooth animations
- Real-time score tracking and best score persistence
- Game over detection and replay functionality

### 💰 Cryptocurrency Rewards
- Earn SHARP tokens based on game performance
- Automated token transfers to EVM-compatible wallets
- Reward formula: `(score / 10) + streakBonus + achievementBonus`
- Transaction tracking with blockchain verification

### 🔥 Daily Streak System
- Consecutive daily play rewards
- +0.5 SHARP per streak day (max 10 days)
- Automatic streak tracking and reset logic

### 🏆 Competitive Features
- **Global Leaderboard**: Real-time rankings by best score
- **Weekly Tournaments**: Compete for prize pools
- **Top 10 Rewards**: Automatic distribution every Sunday

### 🎁 Referral Program
- Unique referral codes for each user
- 10% bonus for referrer on friend's earnings
- 5% signup bonus for new referred users

### 🔐 Security & Anti-Cheat
- Server-side score validation
- Minimum play time enforcement (10 seconds)
- Rate limiting (5 submissions per 5 minutes)
- Firebase Authentication required
- ID token verification on all requests

## 📁 Project Structure

```
SharpPlayWeb/
├── public/                      # Web application
│   ├── index.html              # Home page
│   ├── game.html               # Game page
│   ├── profile.html            # User profile
│   ├── leaderboard.html        # Global rankings
│   ├── tournament.html         # Tournament info
│   ├── referral.html           # Referral system
│   ├── css/
│   │   ├── style.css           # Global styles
│   │   ├── game.css            # Game-specific styles
│   │   ├── profile.css         # Profile styles
│   │   ├── leaderboard.css     # Leaderboard styles
│   │   └── tournament.css      # Tournament styles
│   └── js/
│       ├── firebase-config.js  # Firebase initialization
│       ├── auth.js             # Authentication UI
│       ├── game.js             # Game engine
│       ├── profile.js          # Profile management
│       ├── leaderboard.js      # Leaderboard display
│       ├── tournament.js       # Tournament logic
│       ├── referral.js         # Referral system
│       └── main.js             # Main app logic
├── functions/                   # Firebase Cloud Functions
│   ├── index.js                # All cloud functions
│   └── package.json            # Function dependencies
├── firestore.rules             # Security rules
├── firestore.indexes.json      # Database indexes
├── firebase.json               # Firebase config
└── package.json                # Project dependencies
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18 or higher
- Firebase CLI: `npm install -g firebase-tools`
- Firebase project created at [console.firebase.google.com](https://console.firebase.google.com)
- EVM wallet with SHARP tokens (for production)

### Installation

1. **Clone the repository**
```bash
cd C:\
git clone <repository-url> SharpPlayWeb
cd SharpPlayWeb
```

2. **Install dependencies**
```bash
npm install
cd functions
npm install
cd ..
```

3. **Configure Firebase**
```bash
firebase login
firebase init
```
Select:
- Firestore
- Functions
- Hosting

4. **Set up environment variables**

Create `.env` file:
```env
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=your_app_id

ADMIN_WALLET_PRIVATE_KEY=your_private_key
SHARP_TOKEN_CONTRACT_ADDRESS=0x...
RPC_URL=https://your-rpc-url
CHAIN_ID=1
```

5. **Update Firebase config in code**

Edit `public/js/firebase-config.js`:
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

6. **Set Cloud Functions config**
```bash
firebase functions:config:set web3.private_key="YOUR_PRIVATE_KEY"
firebase functions:config:set web3.token_address="0x..."
firebase functions:config:set web3.rpc_url="https://..."
```

7. **Deploy to Firebase**
```bash
# Deploy everything
firebase deploy

# Or deploy individually
firebase deploy --only hosting
firebase deploy --only functions
firebase deploy --only firestore:rules
```

### Local Development

```bash
# Serve locally
firebase serve

# Or use npm
npm start

# View at http://localhost:5000
```

## 🗄️ Database Schema

### Collections

#### `users`
```javascript
{
  username: string,
  email: string,
  walletAddress: string,
  bestScore: number,
  dailyStreak: number,
  lastPlayedAt: timestamp,
  tokensBalance: number,
  totalEarned: number,
  referralCode: string,
  invitedBy: string,
  createdAt: timestamp
}
```

#### `gamescores`
```javascript
{
  uid: string,
  score: number,
  playDuration: number,
  timestamp: timestamp,
  verified: boolean,
  rewardAmount: number
}
```

#### `leaderboard`
```javascript
{
  uid: string,
  username: string,
  bestScore: number,
  totalEarned: number,
  lastUpdated: timestamp
}
```

#### `transactions`
```javascript
{
  uid: string,
  amount: number,
  toAddress: string,
  txHash: string,
  status: "pending" | "completed" | "failed",
  createdAt: timestamp,
  completedAt: timestamp,
  note: string
}
```

#### `tournaments`
```javascript
{
  name: string,
  startAt: timestamp,
  endAt: timestamp,
  prizePool: number,
  winner: string,
  participants: number,
  processed: boolean
}
```

## ⚡ Cloud Functions

### `submitScore`
HTTP callable function to submit game scores.

**Input:**
```javascript
{
  score: number,
  playDuration: number,
  timestamp: number
}
```

**Output:**
```javascript
{
  success: boolean,
  reward: number,
  dailyStreak: number,
  newBestScore: boolean,
  txHash: string | null
}
```

**Security:**
- Requires authentication
- Validates score range (0-10000)
- Enforces minimum play time (10s)
- Rate limiting (5 per 5 minutes)
- Anti-cheat validation

### `processTournament`
Scheduled function (runs every Sunday at midnight).

**Actions:**
- Calculates top 10 players
- Distributes prize pool
- Creates tournament record
- Updates user balances

### `getUserStats`
HTTP callable function to get user statistics.

**Output:**
```javascript
{
  username: string,
  bestScore: number,
  dailyStreak: number,
  tokensBalance: number,
  totalEarned: number,
  gamesPlayed: number
}
```

## 💰 Reward System

### Base Reward Calculation
```javascript
baseReward = score / 10
```

### Streak Bonus
```javascript
streakBonus = min(dailyStreak, 10) * 0.5
```

### Achievement Bonuses
- New best score: +2 SHARP
- Score ≥ 1000: +5 SHARP
- Score ≥ 500: +2 SHARP
- Score ≥ 100: +1 SHARP

### Total Reward
```javascript
totalReward = baseReward + streakBonus + achievementBonus
// Minimum: 0.1 SHARP
```

### Referral Bonuses
- Referrer: 10% of referred user's earnings
- New user: 5% signup bonus

## 🔒 Security Features

### Firebase Security Rules
- Users can only read/write their own data
- Leaderboard is public read-only
- Transactions are user-specific read-only
- All writes go through Cloud Functions

### Anti-Cheat Measures
1. **Server-side validation**: All score logic on backend
2. **Play time enforcement**: Minimum 10 seconds
3. **Rate limiting**: Max 5 submissions per 5 minutes
4. **ID token verification**: Every request authenticated
5. **Score range validation**: 0-10,000 maximum
6. **Timestamp verification**: Prevent replay attacks

### Web3 Security
- Private keys stored in Cloud Functions config (never exposed)
- Admin wallet signs all transactions
- Transaction verification before status update
- Error handling with transaction rollback

## 🎮 Game Mechanics

### Tap Reaction Game

**Objective**: Click colored targets before they fade away

**Gameplay:**
- Targets spawn randomly on canvas
- Each target lasts 2 seconds
- Click targets to score points
- Faster clicks = more points
- Miss 10 targets = game over
- Difficulty increases over time

**Scoring:**
- Points based on reaction time
- Max 10 points per target (instant click)
- Fading targets worth less points

**Technical Details:**
- Canvas resolution: 800x600
- Target spawn rate: 1000ms (decreases over time)
- Target lifetime: 2000ms
- Max missed targets: 10

## 🌐 Web3 Integration

### Token Transfer Flow

1. User completes game
2. Score submitted to Cloud Function
3. Function validates and calculates reward
4. Function updates Firestore
5. Function initiates Web3 transfer
6. Transaction hash saved to database
7. Transaction confirmation monitored
8. Status updated when confirmed

### Smart Contract Interaction

```javascript
// ERC20 Token Transfer
const tokenContract = new ethers.Contract(
  tokenAddress,
  ERC20_ABI,
  wallet
);

const tx = await tokenContract.transfer(
  userWalletAddress,
  ethers.parseUnits(amount.toString(), 18)
);

const receipt = await tx.wait();
```

### Supported Networks
- Ethereum Mainnet
- Polygon
- BSC
- Arbitrum
- Optimism
- Any EVM-compatible chain

## 📊 Architecture Diagram

```
┌─────────────┐
│   Browser   │
│  (Web App)  │
└──────┬──────┘
       │
       │ Firebase SDK
       │
┌──────▼──────────────────────────────┐
│        Firebase Services            │
│  ┌──────────┐  ┌─────────────────┐ │
│  │   Auth   │  │   Firestore     │ │
│  └────┬─────┘  └────┬────────────┘ │
│       │             │               │
│  ┌────▼─────────────▼────────────┐ │
│  │    Cloud Functions            │ │
│  │  - submitScore()              │ │
│  │  - processTournament()        │ │
│  │  - getUserStats()             │ │
│  └────┬──────────────────────────┘ │
└───────┼──────────────────────────── ┘
        │
        │ ethers.js
        │
┌───────▼─────────────┐
│   Blockchain        │
│  (SHARP Token)      │
│  - Transfer tokens  │
│  - Verify txs       │
└─────────────────────┘
```

## 🧪 Testing

### Manual Testing Checklist

**Authentication:**
- ✅ Google login works
- ✅ Email/password signup
- ✅ Email/password login
- ✅ Logout functionality

**Game:**
- ✅ Game starts correctly
- ✅ Targets spawn and fade
- ✅ Click detection works
- ✅ Score updates in real-time
- ✅ Game over triggers correctly
- ✅ Score submission works

**Profile:**
- ✅ Stats display correctly
- ✅ Wallet address can be updated
- ✅ Transactions list loads
- ✅ Referral code displays

**Leaderboard:**
- ✅ Rankings load and display
- ✅ Podium shows top 3
- ✅ User rank displays if logged in

**Security:**
- ✅ Unauthenticated users blocked
- ✅ Invalid scores rejected
- ✅ Rate limiting works
- ✅ Minimum play time enforced

### Firebase Emulator Testing

```bash
# Start emulators
firebase emulators:start

# Run functions locally
cd functions
npm run serve
```

## 🚢 Deployment

### Production Deployment

```bash
# Full deployment
firebase deploy

# Update only hosting
firebase deploy --only hosting

# Update only functions
firebase deploy --only functions

# Update only Firestore rules
firebase deploy --only firestore:rules
```

### Environment-Specific Deploys

```bash
# Deploy to staging
firebase use staging
firebase deploy

# Deploy to production
firebase use production
firebase deploy
```

### Post-Deployment Checks

1. ✅ Website loads correctly
2. ✅ Authentication works
3. ✅ Game is playable
4. ✅ Scores submit successfully
5. ✅ Leaderboard updates
6. ✅ Transactions recorded
7. ✅ Web3 transfers work (if configured)

## 🛠️ Configuration

### Firebase Setup

1. Create Firebase project
2. Enable Authentication (Google + Email/Password)
3. Create Firestore database
4. Deploy security rules
5. Deploy indexes
6. Configure Cloud Functions
7. Set up hosting

### Web3 Setup

1. Deploy or use existing SHARP token contract
2. Fund admin wallet with ETH (for gas)
3. Fund admin wallet with SHARP tokens
4. Add RPC URL to config
5. Test token transfers

## 📝 Usage Guide

### For Players

1. **Sign Up**: Create account with Google or Email
2. **Play Game**: Click "Play Now" and tap targets
3. **Submit Score**: After game over, submit your score
4. **Add Wallet**: Go to Profile → Add your EVM wallet address
5. **Earn Tokens**: Receive SHARP tokens automatically
6. **Track Progress**: View stats, leaderboard, and transactions
7. **Refer Friends**: Share your referral code for bonuses

### For Developers

1. **Clone Repository**: Get the code
2. **Install Dependencies**: Run `npm install`
3. **Configure Firebase**: Add your project credentials
4. **Set Web3 Config**: Add private key and contract address
5. **Deploy**: Use Firebase CLI to deploy
6. **Monitor**: Check Firebase Console for analytics

## 🎯 Hackathon Demo Script

### 5-Minute Demo Flow

**Minute 1: Introduction**
- "Welcome to SharpPlay Web - Play Games, Earn Crypto!"
- Show landing page
- Explain the concept: Browser games + blockchain rewards

**Minute 2: Authentication & Setup**
- Sign in with Google (instant)
- Show profile page
- Add wallet address
- Explain reward system

**Minute 3: Gameplay**
- Start Tap Reaction Game
- Play for 30 seconds
- Show real-time score tracking
- Demonstrate game over

**Minute 4: Rewards & Web3**
- Submit score
- Show reward calculation
- Display transaction popup
- View blockchain transaction on Etherscan
- Check updated balance

**Minute 5: Features Showcase**
- Leaderboard with top players
- Tournament system and prizes
- Referral program
- Security features (anti-cheat)
- Weekly automated payouts

### Key Points to Emphasize

✅ **Fully Web-Based**: No app downloads
✅ **Instant Rewards**: Automatic crypto transfers
✅ **Secure**: Anti-cheat + Firebase security
✅ **Scalable**: Cloud Functions + Firestore
✅ **Engaging**: Daily streaks + tournaments
✅ **Viral**: Referral system built-in

## 🤝 Contributing

Contributions welcome! Please follow these steps:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Firebase for backend infrastructure
- Ethers.js for Web3 integration
- Canvas API for game rendering
- SHARP Token community

## 📞 Support

- **Documentation**: See this README
- **Issues**: GitHub Issues
- **Discord**: [Your Discord Server]
- **Email**: support@sharpplay.io

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Tap Reaction Game
- ✅ SHARP Token Rewards
- ✅ Leaderboard
- ✅ Tournaments
- ✅ Referral System

### Phase 2 (Next)
- 🔲 Additional games (Endless Runner, Puzzle)
- 🔲 NFT achievements
- 🔲 Mobile optimization
- 🔲 Social features
- 🔲 Clan system

### Phase 3 (Future)
- 🔲 Multiplayer games
- 🔲 Marketplace for items
- 🔲 DAO governance
- 🔲 Multi-chain support
- 🔲 SDK for developers

---

**Built with ❤️ for the Web3 Gaming Community**

*Last Updated: November 2025*
