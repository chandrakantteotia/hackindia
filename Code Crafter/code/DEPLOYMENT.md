# SharpPlay Web - Deployment Guide

## Prerequisites

Before deploying SharpPlay Web, ensure you have:

- [ ] Node.js 18+ installed
- [ ] Firebase CLI installed (`npm install -g firebase-tools`)
- [ ] Firebase project created
- [ ] EVM wallet with SHARP tokens (for production)
- [ ] RPC endpoint (Alchemy, Infura, or similar)

## Step 1: Firebase Project Setup

### 1.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add Project"
3. Enter project name: `sharpplay-web`
4. Disable Google Analytics (optional)
5. Click "Create Project"

### 1.2 Enable Firebase Services

**Enable Authentication:**
1. Go to Authentication → Sign-in method
2. Enable "Google" provider
3. Enable "Email/Password" provider

**Create Firestore Database:**
1. Go to Firestore Database
2. Click "Create database"
3. Select "Start in production mode"
4. Choose location (us-central1 recommended)

**Enable Cloud Functions:**
1. Go to Functions
2. Upgrade to Blaze plan (pay-as-you-go)
3. This is required for Cloud Functions

## Step 2: Local Setup

### 2.1 Clone and Install

```powershell
# Navigate to project directory
cd C:\SharpPlayWeb

# Install root dependencies
npm install

# Install function dependencies
cd functions
npm install
cd ..
```

### 2.2 Firebase Login

```powershell
# Login to Firebase
firebase login

# Initialize Firebase (if not done)
firebase init

# Select:
# - Firestore
# - Functions
# - Hosting
```

### 2.3 Configure Firebase Project

```powershell
# Set your Firebase project
firebase use --add

# Select your project and give it an alias
# Alias: default
```

## Step 3: Configuration

### 3.1 Get Firebase Config

1. Go to Firebase Console → Project Settings
2. Scroll to "Your apps"
3. Click "Web" icon (</>)
4. Register app with nickname "SharpPlay Web"
5. Copy the `firebaseConfig` object

### 3.2 Update Frontend Config

Edit `public/js/firebase-config.js`:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "sharpplay-web.firebaseapp.com",
  projectId: "sharpplay-web",
  storageBucket: "sharpplay-web.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdefghijklmnop"
};
```

### 3.3 Set Cloud Functions Config

```powershell
# Set Web3 configuration
firebase functions:config:set web3.private_key="YOUR_WALLET_PRIVATE_KEY"
firebase functions:config:set web3.token_address="0xYOUR_SHARP_TOKEN_ADDRESS"
firebase functions:config:set web3.rpc_url="https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY"

# Verify configuration
firebase functions:config:get
```

### 3.4 Smart Contract Setup

If you don't have a SHARP token contract, you'll need to:

1. Deploy an ERC20 token contract
2. Name it "SHARP Token"
3. Symbol: "SHARP"
4. Decimals: 18
5. Mint tokens to admin wallet
6. Use the contract address in config

**Simple ERC20 Contract (Solidity):**
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract SharpToken is ERC20 {
    constructor() ERC20("SHARP Token", "SHARP") {
        _mint(msg.sender, 1000000 * 10**18); // 1 million tokens
    }
}
```

## Step 4: Deploy Firestore Rules

```powershell
# Deploy security rules
firebase deploy --only firestore:rules

# Deploy indexes
firebase deploy --only firestore:indexes
```

Verify in Firebase Console:
- Go to Firestore → Rules
- Check that rules are deployed
- Go to Firestore → Indexes
- Verify indexes are building

## Step 5: Deploy Cloud Functions

```powershell
# Deploy all functions
firebase deploy --only functions

# Or deploy specific function
firebase deploy --only functions:submitScore
```

**Expected Output:**
```
✔  functions[submitScore(us-central1)] Successful create operation.
✔  functions[processTournament(us-central1)] Successful create operation.
✔  functions[getUserStats(us-central1)] Successful create operation.
```

### Verify Functions

```powershell
# List deployed functions
firebase functions:list

# Check function logs
firebase functions:log
```

## Step 6: Deploy Hosting

```powershell
# Deploy website
firebase deploy --only hosting
```

**Expected Output:**
```
✔  hosting: release complete

Project Console: https://console.firebase.google.com/project/sharpplay-web
Hosting URL: https://sharpplay-web.web.app
```

## Step 7: Post-Deployment Verification

### 7.1 Test Website

1. Open hosting URL: `https://your-project.web.app`
2. Verify home page loads
3. Check navigation links
4. Verify responsive design

### 7.2 Test Authentication

1. Click "Login"
2. Try Google Sign-In
3. Try Email/Password Sign-Up
4. Verify user creation in Firestore

### 7.3 Test Game

1. Sign in
2. Go to Game page
3. Play game for at least 10 seconds
4. Submit score
5. Check for reward popup

### 7.4 Verify Database

1. Go to Firestore Console
2. Check collections:
   - `users` - User created
   - `gamescores` - Score recorded
   - `leaderboard` - Entry added
   - `transactions` - Transaction created

### 7.5 Test Web3 (If Configured)

1. Add wallet address in Profile
2. Play and submit score
3. Check transaction status
4. Verify on blockchain explorer
5. Check wallet balance

## Step 8: Monitoring

### 8.1 Set Up Alerts

```powershell
# Enable error reporting
firebase functions:config:set monitoring.enabled=true
```

### 8.2 Monitor Functions

```powershell
# View real-time logs
firebase functions:log --only submitScore

# View all logs
firebase functions:log
```

### 8.3 Check Usage

1. Go to Firebase Console → Functions
2. View invocations and errors
3. Monitor execution times
4. Check memory usage

## Troubleshooting

### Issue: Functions not deploying

**Solution:**
```powershell
# Check Node version
node --version  # Should be 18+

# Clear cache
firebase functions:config:get
firebase deploy --only functions --force
```

### Issue: Authentication not working

**Solution:**
1. Check Firebase Console → Authentication → Sign-in methods
2. Verify Google/Email providers are enabled
3. Add authorized domains in Authentication → Settings → Authorized domains

### Issue: Firestore permission denied

**Solution:**
1. Check `firestore.rules` is deployed
2. Verify user is authenticated
3. Check console for error messages

### Issue: Web3 transfers failing

**Solution:**
1. Verify private key is correct
2. Check admin wallet has ETH for gas
3. Check admin wallet has SHARP tokens
4. Verify RPC URL is working
5. Check contract address is correct

### Issue: CORS errors

**Solution:**
Add to `firebase.json`:
```json
{
  "hosting": {
    "headers": [
      {
        "source": "**",
        "headers": [
          {
            "key": "Access-Control-Allow-Origin",
            "value": "*"
          }
        ]
      }
    ]
  }
}
```

## Production Checklist

Before going live:

- [ ] All environment variables set
- [ ] Firestore rules deployed and tested
- [ ] Cloud Functions deployed and working
- [ ] Website deployed to Firebase Hosting
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] Google Analytics added (optional)
- [ ] Error monitoring configured
- [ ] Backup strategy in place
- [ ] Security audit completed
- [ ] Load testing performed
- [ ] Documentation updated

## Custom Domain Setup (Optional)

### 1. Add Custom Domain

```powershell
# In Firebase Console:
# Hosting → Add custom domain
# Enter: sharpplay.io
```

### 2. Configure DNS

Add records from Firebase to your DNS provider:
```
Type: A
Name: @
Value: [IP from Firebase]

Type: A
Name: www
Value: [IP from Firebase]
```

### 3. Verify Domain

Wait for DNS propagation (up to 24 hours), then Firebase will automatically provision SSL.

## Maintenance

### Regular Tasks

**Daily:**
- Monitor error logs
- Check transaction status
- Verify game functionality

**Weekly:**
- Review user growth
- Check tournament processing
- Analyze reward distribution
- Monitor costs

**Monthly:**
- Security audit
- Performance review
- Backup verification
- Update dependencies

### Backup Strategy

```powershell
# Export Firestore data
firebase firestore:export gs://your-bucket/backups/$(date +%Y%m%d)

# Schedule automated backups
# Set up in Firebase Console → Firestore → Import/Export
```

### Update Deployment

```powershell
# Update code
git pull origin main

# Install new dependencies
npm install
cd functions && npm install && cd ..

# Deploy updates
firebase deploy

# Verify deployment
firebase hosting:channel:list
```

## Scaling Considerations

### For High Traffic:

1. **Upgrade Firestore:**
   - Enable multi-region replication
   - Increase concurrent connections

2. **Optimize Functions:**
   - Increase memory allocation
   - Use connection pooling
   - Implement caching

3. **CDN Integration:**
   - Use Firebase CDN
   - Cache static assets
   - Optimize images

4. **Database Optimization:**
   - Add composite indexes
   - Implement data pagination
   - Archive old data

## Cost Estimation

### Firebase Free Tier:
- Firestore: 1GB storage, 50K reads/day
- Functions: 2M invocations/month
- Hosting: 10GB transfer/month

### Estimated Costs (1000 active users):
- Firestore: ~$10-20/month
- Functions: ~$5-15/month
- Hosting: ~$1-5/month
- **Total: ~$16-40/month**

### Cost Optimization:

1. Cache frequently accessed data
2. Optimize function execution time
3. Use CDN for static assets
4. Implement data retention policies
5. Monitor and alert on unusual usage

## Support Resources

- **Firebase Documentation**: https://firebase.google.com/docs
- **Ethers.js Docs**: https://docs.ethers.org
- **Firebase Support**: https://firebase.google.com/support
- **Community Discord**: [Your Discord Link]

---

**Deployment Complete! 🚀**

Your SharpPlay Web platform is now live and ready for users!
