# 🚀 Quick Start Guide - SharpPlay Web

## Get Playing in 5 Minutes!

### For Players

#### 1. **Visit the Website**
Open your browser and go to: `https://your-sharpplay-url.com`

#### 2. **Create Account**
- Click "Login" button
- Choose "Sign Up"
- Enter email and password OR
- Use "Continue with Google"

#### 3. **Connect Wallet** (Optional but Recommended)
- Click "🦊 Connect Wallet"
- Approve MetaMask connection
- Switch to Polygon network (auto-prompted)
- Tokens will be sent directly to your wallet!

#### 4. **Browse Games**
- Click "Games" in navigation
- Choose from:
  - 🎯 **Tap Reaction** - Test your reflexes
  - 🧠 **Memory Match** - Match the pairs
  - 🎨 **Color Rush** - Brain teaser challenge

#### 5. **Play & Earn**
- Play any game
- Complete the game
- Click "Submit & Earn"
- Receive SHARP tokens!

#### 6. **Track Progress**
- Visit "Profile" to see:
  - Total earnings
  - Best scores
  - Daily streak
  - Transaction history

---

## For Developers

### Local Development Setup

#### Prerequisites
```bash
- Node.js 16+ installed
- Firebase CLI installed
- Git installed
- MetaMask browser extension
```

#### 1. Clone Repository
```bash
git clone https://github.com/your-username/SharpPlayWeb.git
cd SharpPlayWeb
```

#### 2. Install Dependencies
```bash
# Install Firebase Functions dependencies
cd functions
npm install
cd ..
```

#### 3. Firebase Setup
```bash
# Login to Firebase
firebase login

# Initialize Firebase (if not already done)
firebase init

# Select:
# - Firestore
# - Functions
# - Hosting
```

#### 4. Configure Firebase
Update `public/js/firebase-config.js` with your Firebase config:
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  // ... other config
};
```

#### 5. Configure Web3
Update `public/js/web3-integration.js`:
```javascript
const WEB3_CONFIG = {
  SHARP_TOKEN_ADDRESS: '0xYOUR_TOKEN_CONTRACT',
  CHAIN_ID: 137, // Polygon Mainnet
  // ... other config
};
```

#### 6. Run Locally
```bash
# Serve locally
firebase serve

# Or use any local server
# python -m http.server 8000
# npx http-server public
```

Visit: `http://localhost:5000`

#### 7. Deploy
```bash
# Deploy everything
firebase deploy

# Or deploy specific parts
firebase deploy --only hosting
firebase deploy --only functions
firebase deploy --only firestore
```

---

## Configuration Checklist

### Before Going Live

- [ ] Deploy SHARP token contract to Polygon
- [ ] Update `SHARP_TOKEN_ADDRESS` in web3-integration.js
- [ ] Configure Firebase Functions environment:
  ```bash
  firebase functions:config:set \
    web3.private_key="ADMIN_WALLET_KEY" \
    web3.token_address="TOKEN_CONTRACT" \
    web3.rpc_url="https://polygon-rpc.com"
  ```
- [ ] Fund admin wallet with MATIC for gas
- [ ] Transfer SHARP tokens to admin wallet
- [ ] Set up Firestore security rules
- [ ] Enable Firebase Authentication providers
- [ ] Test on Mumbai testnet first
- [ ] Configure custom domain (optional)
- [ ] Set up analytics (optional)

---

## Testing Workflow

### Test on Mumbai Testnet

1. **Get Test MATIC**
   - Visit: https://faucet.polygon.technology
   - Enter your wallet address
   - Receive test MATIC

2. **Deploy Test Contract**
   ```bash
   # Update WEB3_CONFIG to Mumbai
   CHAIN_ID: 80001
   RPC_URL: 'https://rpc-mumbai.maticvigil.com'
   ```

3. **Play Test Game**
   - Connect wallet
   - Play a game
   - Submit score
   - Verify transaction on Mumbai explorer

4. **Check Everything**
   - ✅ Wallet connects
   - ✅ Game plays smoothly
   - ✅ Score submits successfully
   - ✅ Tokens received
   - ✅ Transaction appears in history

---

## Common Issues & Solutions

### Issue: "MetaMask not detected"
**Solution:** Install MetaMask browser extension from https://metamask.io

### Issue: "Wrong network"
**Solution:** Click "Connect Wallet" - MetaMask will prompt to switch

### Issue: "Transaction failed"
**Solution:** 
- Check admin wallet has MATIC for gas
- Check admin wallet has SHARP tokens
- Verify contract address is correct

### Issue: "Score not submitting"
**Solution:**
- Check Firebase Functions logs
- Verify you're authenticated
- Check rate limiting (max 5 per 5 minutes)

### Issue: "No tokens received"
**Solution:**
- Check transaction hash on Polygonscan
- Verify wallet address is correct
- Check you're on correct network

---

## Quick Commands

### Development
```bash
# Install dependencies
npm install

# Run locally
firebase serve

# View logs
firebase functions:log

# Open Firebase console
firebase open
```

### Deployment
```bash
# Deploy all
firebase deploy

# Deploy only hosting
firebase deploy --only hosting

# Deploy only functions
firebase deploy --only functions

# Deploy specific function
firebase deploy --only functions:submitScore
```

### Debugging
```bash
# Test function locally
firebase functions:shell

# View real-time logs
firebase functions:log --only submitScore

# Check Firestore data
firebase firestore:read users/USER_ID
```

---

## Environment Variables

### Firebase Functions (.env)
```bash
ADMIN_WALLET_PRIVATE_KEY=0x...
SHARP_TOKEN_CONTRACT_ADDRESS=0x...
RPC_URL=https://polygon-rpc.com
```

### Frontend (firebase-config.js)
```javascript
apiKey: "..."
authDomain: "..."
projectId: "..."
```

---

## Performance Tips

1. **Optimize Images**
   - Use WebP format
   - Compress before upload
   - Use lazy loading

2. **Minimize JavaScript**
   - Bundle files in production
   - Remove console.logs
   - Use minification

3. **Enable Caching**
   - Configure Firebase Hosting cache
   - Use CDN for static assets

4. **Monitor Performance**
   - Use Lighthouse audits
   - Check Firebase Performance
   - Monitor function execution time

---

## Security Best Practices

1. **Never commit private keys** to Git
2. **Use environment variables** for sensitive data
3. **Implement rate limiting** (already done)
4. **Validate inputs** on server-side
5. **Enable Firestore security rules**
6. **Use HTTPS** only
7. **Sanitize user inputs**
8. **Monitor for abuse**

---

## Support Resources

- **Documentation:** Check GAMES_GUIDE.md and WEB3_SETUP.md
- **Firebase Docs:** https://firebase.google.com/docs
- **Web3.js Docs:** https://web3js.readthedocs.io
- **Polygon Docs:** https://docs.polygon.technology
- **GitHub Issues:** Report bugs and request features

---

## Next Steps

1. ✅ Complete local setup
2. ✅ Test on Mumbai testnet
3. ✅ Deploy to production
4. 🎮 Start playing and earning!
5. 📢 Share with friends using referral code
6. 🏆 Climb the leaderboard
7. 💰 Participate in tournaments

---

## Quick Links

- 🌐 **Website:** [Your URL]
- 📱 **Twitter:** [Your Twitter]
- 💬 **Discord:** [Your Discord]
- 📧 **Email:** support@sharpplay.com
- 🐛 **Bug Reports:** GitHub Issues

---

**Happy Gaming! 🎮💰**
