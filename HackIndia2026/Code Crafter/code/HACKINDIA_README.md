# SharpPlay Web - Play Games & Earn SHARP Tokens 🎮💰

## HackIndia 2026 Submission

### Team Information
**Team Name:** [Code crafter]

**Team Members:**
- Chandrakant Teotia - [@chandrakantteotia](https://github.com/chandrakantteotia)
- [Add other team members with GitHub IDs]

### Project Demo
🌐 **Live Demo:** [Your deployed URL - e.g., https://hackindia-9574c.web.app]

📹 **Demo Video:** [Add YouTube/Loom link if available]

---

## 📝 Project Overview

SharpPlay is a Web3-enabled gaming platform where users can play browser-based games and earn SHARP cryptocurrency tokens as rewards. The platform combines traditional gaming with blockchain technology to create a play-to-earn ecosystem.

### Key Features
- 🎮 **Multiple Games**: Action, puzzle, and casual games
- 💰 **Token Rewards**: Earn SHARP tokens based on performance
- 🔐 **Web3 Integration**: MetaMask wallet connection
- 🔥 **Daily Streaks**: Bonus rewards for consistent play
- 🏆 **Leaderboard System**: Compete with other players
- 👥 **Referral Program**: Earn by inviting friends
- 📊 **User Profiles**: Track stats and earnings
- 🎯 **Tournament Mode**: Compete for bigger prizes

### Available Games
1. **Tap Reaction** - Test your reflexes with fast-paced tapping
2. **Memory Match** - Classic card matching puzzle game
3. **Color Rush** - Quick color identification challenge

---

## 🛠️ Tech Stack

### Frontend
- HTML5, CSS3, JavaScript (Vanilla)
- Responsive design with mobile support
- Progressive Web App (PWA) ready

### Backend & Database
- **Firebase Authentication** - Google Sign-In & Email/Password
- **Cloud Firestore** - Real-time database for user data
- **Firebase Hosting** - Fast, secure web hosting
- **Firebase Functions** - Serverless backend logic

### Blockchain & Web3
- **Web3.js** - Ethereum blockchain interaction
- **MetaMask Integration** - Wallet connectivity
- **Polygon Network** - Low-fee token transactions
- **Smart Contracts (Solidity)** - SHARP token (ERC-20)

---

## 🚀 How to Run Locally

### Prerequisites
```bash
# Install Node.js (v16+)
# Install Firebase CLI
npm install -g firebase-tools

# Install Python (for local server)
```

### Setup Instructions

1. **Clone the repository**
```bash
git clone https://github.com/[your-username]/HackIndia2026.git
cd HackIndia2026/[TEAM_NAME]/SharpPlayWeb
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure Firebase**
- Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
- Enable Authentication (Google & Email/Password)
- Enable Cloud Firestore
- Copy your Firebase config to `public/js/firebase-config.js`

4. **Start local server**

Option A: Using Python
```bash
cd public
python -m http.server 5000
```

Option B: Using Firebase
```bash
firebase serve --only hosting
```

5. **Open in browser**
```
http://localhost:5000
```

### Important Notes
- For Google Sign-In to work, you MUST use `http://localhost` or deploy to a live server
- Opening files directly (`file://`) will NOT work due to browser security restrictions
- Add `http://localhost:5000` to Firebase authorized domains

---

## 📱 Features Breakdown

### 1. Authentication System
- Google OAuth integration
- Email/Password authentication
- Profile photo upload with Firebase storage
- Persistent login sessions

### 2. Gaming Engine
- Real-time score tracking
- Multiple difficulty levels
- Game state persistence
- Performance analytics

### 3. Blockchain Integration
- MetaMask wallet connection
- SHARP token distribution
- Transaction history
- Wallet address verification

### 4. User Management
- Personal dashboard
- Game statistics
- Earnings tracker
- Referral code system

### 5. Leaderboard
- Global rankings
- Weekly/Daily filters
- Top 3 podium display
- Real-time updates

---

## 🎯 Game Mechanics & Rewards

### Scoring System
- **Base Points**: Performance-based scoring
- **Multipliers**: Daily streak bonuses (up to 2x)
- **Time Bonus**: Complete faster for extra points
- **Accuracy Bonus**: Perfect plays earn more

### Token Distribution
- Earn SHARP tokens based on score
- ~1 SHARP per 100 points
- Bonus tokens for daily streaks
- Referral rewards (10% of referee earnings)

---

## 🔐 Smart Contract Details

**Contract Name:** SharpToken (SHARP)
**Type:** ERC-20 Token
**Network:** Polygon (Mumbai Testnet / Mainnet)
**Features:**
- Mintable by platform admin
- Transferable between users
- Burnable for platform perks

Contract location: `contracts/SharpToken.sol`

---

## 📊 Database Schema

### Users Collection
```javascript
{
  uid: string,
  username: string,
  email: string,
  photoURL: string,
  walletAddress: string,
  bestScore: number,
  dailyStreak: number,
  tokensBalance: number,
  totalEarned: number,
  referralCode: string,
  invitedBy: string,
  createdAt: timestamp
}
```

### GameScores Collection
```javascript
{
  uid: string,
  gameId: string,
  score: number,
  tokensEarned: number,
  createdAt: timestamp
}
```

---

## 🚀 Deployment

### Deploy to Firebase Hosting
```bash
# Login to Firebase
firebase login

# Deploy
firebase deploy --only hosting

# Your site will be live at:
# https://[project-id].web.app
```

### Environment Setup
1. Add Firebase config
2. Deploy smart contract to Polygon
3. Update contract address in `web3-integration.js`
4. Configure Firebase security rules
5. Set up Firebase Functions for token distribution

---

## 🎨 Design Highlights

- Modern gradient-based UI with dark theme
- Smooth animations and transitions
- Mobile-responsive design
- Accessibility features (keyboard navigation, ARIA labels)
- Loading animations and preloaders
- Toast notifications for user feedback

---

## 🔮 Future Enhancements

- [ ] NFT rewards for top players
- [ ] More game types (arcade, strategy)
- [ ] Multiplayer tournament modes
- [ ] Social features (chat, challenges)
- [ ] Mobile app (React Native)
- [ ] DAO governance for platform decisions
- [ ] Staking mechanism for passive rewards
- [ ] Cross-chain token bridge

---

## 📜 License
MIT License

---

## 🙏 Acknowledgments

- Firebase for backend infrastructure
- MetaMask for Web3 connectivity
- Polygon for blockchain layer
- HackIndia 2026 for the opportunity

---

## 📞 Contact

For questions or feedback:
- GitHub: [@chandrakantteotia](https://github.com/chandrakantteotia)
- Email: chandrakantteotia@example.com

---

**Built with ❤️ for HackIndia 2026**
