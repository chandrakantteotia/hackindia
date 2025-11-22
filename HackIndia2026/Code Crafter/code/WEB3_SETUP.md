# Web3 Integration Setup Guide

## Overview
SharpPlay now includes full Web3 integration for wallet connectivity and SHARP token distribution on Polygon blockchain.

## Features Implemented

### ✅ Frontend Features
- **MetaMask Connection**: Connect Web3 wallet directly from the website
- **Wallet Balance Display**: View MATIC and SHARP token balances
- **Auto-Connect**: Remembers wallet connection across sessions
- **Network Switching**: Automatically switches to Polygon network
- **Manual Wallet Input**: Fallback option for manual address entry
- **Real-time Balance Updates**: Live wallet balance monitoring

### ✅ Backend Features
- **Automated Token Distribution**: Firebase Cloud Functions handle token transfers
- **Score Verification**: Anti-cheat measures and rate limiting
- **Daily Streak Bonuses**: Reward players for consistent gameplay
- **Referral System**: 10% bonus for referrers
- **Tournament Processing**: Automated weekly prize distribution
- **Transaction History**: Complete blockchain transaction tracking

## Configuration Steps

### 1. Update Web3 Configuration

Edit `public/js/web3-integration.js`:

```javascript
const WEB3_CONFIG = {
  SHARP_TOKEN_ADDRESS: '0xYOUR_TOKEN_CONTRACT_ADDRESS', // Your ERC20 token contract
  CHAIN_ID: 137, // Polygon Mainnet (use 80001 for Mumbai testnet)
  CHAIN_NAME: 'Polygon',
  RPC_URL: 'https://polygon-rpc.com',
  EXPLORER_URL: 'https://polygonscan.com'
};
```

### 2. Deploy ERC20 Token Contract

You need to deploy a SHARP token contract on Polygon. Here's a basic example:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SharpToken is ERC20, Ownable {
    constructor(uint256 initialSupply) ERC20("Sharp Token", "SHARP") {
        _mint(msg.sender, initialSupply * 10 ** decimals());
    }
    
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
```

### 3. Configure Firebase Cloud Functions

Set up environment variables:

```bash
cd functions
npm install ethers

# Set configuration
firebase functions:config:set \
  web3.private_key="YOUR_ADMIN_WALLET_PRIVATE_KEY" \
  web3.token_address="YOUR_TOKEN_CONTRACT_ADDRESS" \
  web3.rpc_url="https://polygon-rpc.com"
```

Or use environment file:
```bash
# functions/.env
ADMIN_WALLET_PRIVATE_KEY=your_private_key_here
SHARP_TOKEN_CONTRACT_ADDRESS=0x...
RPC_URL=https://polygon-rpc.com
```

### 4. Fund Admin Wallet

The admin wallet needs:
- MATIC tokens (for gas fees)
- SHARP tokens (to distribute as rewards)

Transfer SHARP tokens to your admin wallet address.

### 5. Update Firebase Security Rules

```javascript
// firestore.rules
match /transactions/{transactionId} {
  allow read: if request.auth != null && 
    (request.auth.uid == resource.data.uid || 
     request.auth.token.admin == true);
  allow write: if false; // Only backend can write
}

match /users/{userId} {
  allow read: if request.auth != null;
  allow write: if request.auth != null && request.auth.uid == userId;
}
```

## Usage Guide

### For Players

1. **Connect Wallet**
   - Click "🦊 Connect Wallet" button
   - Approve MetaMask connection
   - Wallet automatically switches to Polygon network

2. **Play Games**
   - Play games to earn SHARP tokens
   - Tokens automatically sent to connected wallet
   - View transaction history in Profile page

3. **View Balances**
   - Check MATIC balance for gas fees
   - Check SHARP token balance
   - View all transactions on blockchain explorer

### For Developers

#### Check if wallet is connected:
```javascript
if (connectedWalletAddress) {
  console.log('Wallet connected:', connectedWalletAddress);
}
```

#### Get balances:
```javascript
const maticBalance = await getWalletBalance(address);
const sharpBalance = await getSharpTokenBalance(address);
```

#### Request reward after game:
```javascript
const result = await requestRewardFromBackend(score, gameId);
console.log('Transaction hash:', result.txHash);
```

## Network Options

### Polygon Mainnet (Production)
- Chain ID: 137
- RPC: https://polygon-rpc.com
- Explorer: https://polygonscan.com
- Currency: MATIC

### Mumbai Testnet (Development)
- Chain ID: 80001
- RPC: https://rpc-mumbai.maticvigil.com
- Explorer: https://mumbai.polygonscan.com
- Faucet: https://faucet.polygon.technology

## Security Best Practices

1. **Never commit private keys** to Git
2. **Use environment variables** for sensitive data
3. **Implement rate limiting** (already done)
4. **Validate all inputs** on backend
5. **Use secure RPC providers** (Alchemy, Infura)
6. **Monitor admin wallet balance** regularly
7. **Implement withdrawal limits** for security

## Testing

### Test on Mumbai Testnet First

1. Get test MATIC from faucet
2. Deploy test token contract
3. Update config to Mumbai settings
4. Test full flow:
   - Connect wallet
   - Play game
   - Receive tokens
   - Verify on explorer

### Check Transaction Status

Visit Polygonscan:
```
https://polygonscan.com/tx/[TRANSACTION_HASH]
```

## Troubleshooting

### Wallet Won't Connect
- Ensure MetaMask is installed
- Check browser console for errors
- Try refreshing page
- Clear browser cache

### Tokens Not Received
- Check transaction status on explorer
- Verify admin wallet has MATIC for gas
- Verify admin wallet has SHARP tokens
- Check Firebase Function logs

### Wrong Network
- MetaMask will auto-prompt to switch
- Manually switch to Polygon in MetaMask
- Check CHAIN_ID in config

## Cost Estimation

### Gas Costs (Polygon)
- Average token transfer: ~0.001 MATIC ($0.001)
- Very low cost compared to Ethereum mainnet
- Can process thousands of transactions cheaply

### RPC Providers (Free Tier)
- Alchemy: 300M compute units/month
- Infura: 100,000 requests/day
- Public RPCs: Available but less reliable

## Future Enhancements

- [ ] NFT rewards for achievements
- [ ] Staking mechanism for SHARP tokens
- [ ] Multi-chain support (BSC, Ethereum L2s)
- [ ] Token swap integration
- [ ] Gasless transactions (meta-transactions)
- [ ] In-game marketplace

## Support

For issues:
1. Check browser console logs
2. Check Firebase Function logs
3. Verify blockchain transaction on explorer
4. Check Web3 provider status

## Resources

- [Web3.js Documentation](https://web3js.readthedocs.io/)
- [Ethers.js Documentation](https://docs.ethers.org/)
- [Polygon Documentation](https://docs.polygon.technology/)
- [MetaMask Documentation](https://docs.metamask.io/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
