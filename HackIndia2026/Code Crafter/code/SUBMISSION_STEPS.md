# HackIndia 2026 Submission Steps

## 📋 Complete This Before Submitting

1. **Update HACKINDIA_README.md**
   - [ ] Add your team name
   - [ ] Add all team member names and GitHub IDs
   - [ ] Add your live demo URL (deploy to Firebase first)
   - [ ] Add demo video link (optional but recommended)

2. **Deploy Your Project**
   ```bash
   cd C:\Users\chandrakant\Desktop\SharpPlayWeb
   firebase deploy --only hosting
   ```
   - Copy the deployed URL and add it to README

3. **Test Everything**
   - [ ] Website loads properly
   - [ ] Games work
   - [ ] Google Sign-In works
   - [ ] Profile features work
   - [ ] Wallet connection works

---

## 🚀 Submission Commands

### Step 1: Fork the Official Repo
Go to: https://github.com/HackIndiaXYZ/HackIndia2026
Click **Fork** button (top right)

### Step 2: Clone YOUR Fork
Replace `<your-username>` with your actual GitHub username:

```bash
cd C:\Users\chandrakant\Desktop
git clone https://github.com/<your-username>/HackIndia2026.git
cd HackIndia2026
```

### Step 3: Create Team Folder
Replace `<TEAM_NAME>` with your actual team name:

```bash
mkdir <TEAM_NAME>
cd <TEAM_NAME>
```

### Step 4: Copy Your Project Files
```bash
# Copy the entire SharpPlayWeb project
xcopy /E /I C:\Users\chandrakant\Desktop\SharpPlayWeb .\SharpPlayWeb

# Rename the README
cd SharpPlayWeb
move HACKINDIA_README.md README.md

# Clean up unnecessary files
rmdir /S /Q node_modules
rmdir /S /Q .firebase
del firebase-debug.log
del .firebaserc
```

### Step 5: Commit and Push
```bash
# Go back to team folder root
cd C:\Users\chandrakant\Desktop\HackIndia2026

# Add all files
git add <TEAM_NAME>

# Commit
git commit -m "Add project: <TEAM_NAME> - SharpPlay Web"

# Push to YOUR fork
git push origin main
```

### Step 6: Create Pull Request
1. Go to your fork on GitHub: `https://github.com/<your-username>/HackIndia2026`
2. Click **"Compare & Pull Request"** (green button)
3. Fill in PR details:

**PR Title:**
```
Add project: <TEAM_NAME> — SharpPlay Web - Play & Earn Platform
```

**PR Description Template:**
```markdown
## Team Information
**Team Name:** <TEAM_NAME>

**Team Members:**
- Chandrakant Teotia - @chandrakantteotia
- [Add other members]

## Project Details
**Project Name:** SharpPlay Web
**Category:** Web3 Gaming / Blockchain

**Demo Link:** https://your-deployed-url.web.app

**Tech Stack:**
- Frontend: HTML5, CSS3, JavaScript
- Backend: Firebase (Auth, Firestore, Hosting)
- Blockchain: Web3.js, Polygon, Solidity
- Tools: MetaMask, Firebase CLI

## Description
SharpPlay is a Web3-enabled gaming platform where users play browser games and earn SHARP cryptocurrency tokens. Features include multiple games, wallet integration, leaderboards, referral system, and real-time token rewards.

## How to Run
See README.md in our project folder for detailed setup instructions.

## Notes for Judges
- Full Web3 integration with MetaMask
- Real-time leaderboard with Firebase
- Smart contract for SHARP token (ERC-20)
- Fully responsive design
- Production-ready deployment

Thank you for reviewing our submission! 🚀
```

4. Click **"Create Pull Request"**

---

## ✅ Submission Checklist

Before submitting, make sure:

- [ ] README.md is complete with all team info
- [ ] Project is deployed and live demo link works
- [ ] All code files are included
- [ ] Smart contract code is included (contracts folder)
- [ ] Documentation is clear
- [ ] PR title follows the format
- [ ] PR description is complete
- [ ] All team members are listed with GitHub IDs
- [ ] Tech stack is mentioned
- [ ] Run instructions are clear

---

## 🎯 Quick Deploy to Firebase

```bash
cd C:\Users\chandrakant\Desktop\SharpPlayWeb

# Login (if not already)
firebase login

# Deploy
firebase deploy --only hosting

# Note the deployed URL (e.g., https://hackindia-9574c.web.app)
```

---

## 📝 Important Notes

1. **Don't include:**
   - node_modules folder
   - .env files with secrets
   - firebase-debug.log
   - .firebase folder

2. **Do include:**
   - All source code
   - Smart contracts
   - Documentation
   - README.md
   - package.json

3. **Make sure:**
   - Code is clean and commented
   - README is professional
   - Demo link works
   - All features are functional

---

## 🆘 Need Help?

If you get stuck:
1. Check if you forked the repo (not cloned the original)
2. Make sure you're pushing to YOUR fork
3. Verify all team member GitHub IDs are correct
4. Test your demo link before submitting

---

Good luck with your submission! 🎉
