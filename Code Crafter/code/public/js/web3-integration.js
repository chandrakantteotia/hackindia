// Web3 Integration for SharpPlay
// Handles wallet connection, blockchain interactions, and token transfers

// Web3 Configuration
const WEB3_CONFIG = {
  // Replace with your actual contract addresses
  SHARP_TOKEN_ADDRESS: '0x0000000000000000000000000000000000000000', // Update with actual SHARP token contract
  CHAIN_ID: 137, // Polygon Mainnet (change to 80001 for Mumbai testnet)
  CHAIN_NAME: 'Polygon',
  RPC_URL: 'https://polygon-rpc.com',
  EXPLORER_URL: 'https://polygonscan.com',
  CURRENCY: {
    name: 'MATIC',
    symbol: 'MATIC',
    decimals: 18
  }
};

// Web3 State
let web3Instance = null;
let connectedWalletAddress = null;
let web3Provider = null;

// Initialize Web3
async function initWeb3() {
  if (typeof window.ethereum !== 'undefined') {
    console.log('MetaMask detected!');
    web3Provider = window.ethereum;
    web3Instance = new Web3(window.ethereum);
    
    // Listen for account changes
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    
    // Listen for chain changes
    window.ethereum.on('chainChanged', handleChainChanged);
    
    // Check if already connected
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    if (accounts.length > 0) {
      connectedWalletAddress = accounts[0];
      updateWalletUI(true);
    }
    
    return true;
  } else {
    console.log('MetaMask not detected');
    return false;
  }
}

// Connect Wallet
async function connectWallet() {
  try {
    if (!web3Instance) {
      const initialized = await initWeb3();
      if (!initialized) {
        alert('Please install MetaMask or another Web3 wallet to connect!');
        window.open('https://metamask.io/download/', '_blank');
        return null;
      }
    }
    
    // Request account access
    const accounts = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    });
    
    if (accounts.length === 0) {
      throw new Error('No accounts found');
    }
    
    connectedWalletAddress = accounts[0];
    
    // Check and switch network if needed
    await ensureCorrectNetwork();
    
    // Update UI
    updateWalletUI(true);
    
    // Save wallet address to Firebase if user is logged in
    try {
      if (typeof currentUser !== 'undefined' && currentUser) {
        await saveWalletToFirebase(connectedWalletAddress);
      }
    } catch (error) {
      console.log('User not logged in, skipping Firebase wallet save');
    }
    
    console.log('Wallet connected:', connectedWalletAddress);
    return connectedWalletAddress;
    
  } catch (error) {
    console.error('Error connecting wallet:', error);
    
    if (error.code === 4001) {
      alert('Please approve the connection request in your wallet');
    } else {
      alert('Failed to connect wallet: ' + error.message);
    }
    
    return null;
  }
}

// Disconnect Wallet
function disconnectWallet() {
  connectedWalletAddress = null;
  updateWalletUI(false);
  console.log('Wallet disconnected');
}

// Ensure Correct Network
async function ensureCorrectNetwork() {
  try {
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    const currentChainId = parseInt(chainId, 16);
    
    if (currentChainId !== WEB3_CONFIG.CHAIN_ID) {
      await switchNetwork();
    }
  } catch (error) {
    console.error('Error checking network:', error);
  }
}

// Switch Network
async function switchNetwork() {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: Web3.utils.toHex(WEB3_CONFIG.CHAIN_ID) }],
    });
  } catch (switchError) {
    // This error code indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: Web3.utils.toHex(WEB3_CONFIG.CHAIN_ID),
            chainName: WEB3_CONFIG.CHAIN_NAME,
            nativeCurrency: WEB3_CONFIG.CURRENCY,
            rpcUrls: [WEB3_CONFIG.RPC_URL],
            blockExplorerUrls: [WEB3_CONFIG.EXPLORER_URL]
          }],
        });
      } catch (addError) {
        console.error('Error adding network:', addError);
        throw new Error('Failed to add network to wallet');
      }
    } else {
      throw switchError;
    }
  }
}

// Get Wallet Balance (MATIC)
async function getWalletBalance(address) {
  if (!web3Instance || !address) return '0';
  
  try {
    const balance = await web3Instance.eth.getBalance(address);
    return web3Instance.utils.fromWei(balance, 'ether');
  } catch (error) {
    console.error('Error getting balance:', error);
    return '0';
  }
}

// Get SHARP Token Balance
async function getSharpTokenBalance(address) {
  if (!web3Instance || !address || !WEB3_CONFIG.SHARP_TOKEN_ADDRESS) return '0';
  
  try {
    // ERC20 ABI for balanceOf function
    const minABI = [
      {
        constant: true,
        inputs: [{ name: "_owner", type: "address" }],
        name: "balanceOf",
        outputs: [{ name: "balance", type: "uint256" }],
        type: "function"
      }
    ];
    
    const contract = new web3Instance.eth.Contract(minABI, WEB3_CONFIG.SHARP_TOKEN_ADDRESS);
    const balance = await contract.methods.balanceOf(address).call();
    
    return web3Instance.utils.fromWei(balance, 'ether');
  } catch (error) {
    console.error('Error getting SHARP balance:', error);
    return '0';
  }
}

// Send SHARP Tokens
async function sendSharpTokens(toAddress, amount) {
  if (!web3Instance || !connectedWalletAddress) {
    throw new Error('Wallet not connected');
  }
  
  try {
    // ERC20 ABI for transfer function
    const minABI = [
      {
        constant: false,
        inputs: [
          { name: "_to", type: "address" },
          { name: "_value", type: "uint256" }
        ],
        name: "transfer",
        outputs: [{ name: "", type: "bool" }],
        type: "function"
      }
    ];
    
    const contract = new web3Instance.eth.Contract(minABI, WEB3_CONFIG.SHARP_TOKEN_ADDRESS);
    const amountInWei = web3Instance.utils.toWei(amount.toString(), 'ether');
    
    const tx = await contract.methods.transfer(toAddress, amountInWei).send({
      from: connectedWalletAddress
    });
    
    console.log('Transaction successful:', tx.transactionHash);
    return tx.transactionHash;
    
  } catch (error) {
    console.error('Error sending tokens:', error);
    throw error;
  }
}

// Sign Message (for verification)
async function signMessage(message) {
  if (!web3Instance || !connectedWalletAddress) {
    throw new Error('Wallet not connected');
  }
  
  try {
    const signature = await web3Instance.eth.personal.sign(
      message,
      connectedWalletAddress,
      ''
    );
    return signature;
  } catch (error) {
    console.error('Error signing message:', error);
    throw error;
  }
}

// Verify Wallet Ownership
async function verifyWalletOwnership() {
  if (!connectedWalletAddress) {
    return false;
  }
  
  if (typeof currentUser === 'undefined' || !currentUser) {
    console.log('User not logged in, cannot verify wallet');
    return false;
  }
  
  try {
    const message = `Verify wallet ownership for SharpPlay\nUser: ${currentUser.uid}\nTimestamp: ${Date.now()}`;
    const signature = await signMessage(message);
    
    // Save signature to Firebase for backend verification if needed
    await db.collection('users').doc(currentUser.uid).update({
      walletVerified: true,
      walletSignature: signature,
      lastVerified: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Error verifying wallet:', error);
    return false;
  }
}

// Save Wallet Address to Firebase
async function saveWalletToFirebase(address) {
  if (typeof currentUser === 'undefined' || !currentUser) {
    console.log('User not logged in, cannot save wallet to Firebase');
    return;
  }
  
  try {
    await db.collection('users').doc(currentUser.uid).update({
      walletAddress: address,
      walletConnected: true,
      lastWalletUpdate: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('Wallet address saved to Firebase');
  } catch (error) {
    console.error('Error saving wallet to Firebase:', error);
  }
}

// Handle Account Changes
function handleAccountsChanged(accounts) {
  if (accounts.length === 0) {
    // User disconnected wallet
    disconnectWallet();
  } else if (accounts[0] !== connectedWalletAddress) {
    // User switched accounts
    connectedWalletAddress = accounts[0];
    updateWalletUI(true);
    
    try {
      if (typeof currentUser !== 'undefined' && currentUser) {
        saveWalletToFirebase(connectedWalletAddress);
      }
    } catch (error) {
      console.log('User not logged in, skipping Firebase wallet save');
    }
  }
}

// Handle Chain Changes
function handleChainChanged(chainId) {
  // Reload page on network change
  window.location.reload();
}

// Update Wallet UI
function updateWalletUI(connected) {
  const connectBtn = document.getElementById('connectWalletBtn');
  const walletInfo = document.getElementById('walletInfo');
  const walletAddressDisplay = document.getElementById('walletAddressDisplay');
  
  if (connected && connectedWalletAddress) {
    if (connectBtn) {
      connectBtn.textContent = 'Wallet Connected';
      connectBtn.classList.add('connected');
    }
    
    if (walletInfo) {
      walletInfo.style.display = 'flex';
    }
    
    if (walletAddressDisplay) {
      walletAddressDisplay.textContent = formatAddress(connectedWalletAddress);
    }
    
    // Update balance displays
    updateWalletBalances();
    
  } else {
    if (connectBtn) {
      connectBtn.textContent = '🦊 Connect Wallet';
      connectBtn.classList.remove('connected');
    }
    
    if (walletInfo) {
      walletInfo.style.display = 'none';
    }
  }
}

// Update Wallet Balances
async function updateWalletBalances() {
  if (!connectedWalletAddress) return;
  
  try {
    const maticBalance = await getWalletBalance(connectedWalletAddress);
    const sharpBalance = await getSharpTokenBalance(connectedWalletAddress);
    
    const maticDisplay = document.getElementById('maticBalance');
    const sharpDisplay = document.getElementById('sharpBalance');
    
    if (maticDisplay) {
      maticDisplay.textContent = parseFloat(maticBalance).toFixed(4) + ' MATIC';
    }
    
    if (sharpDisplay) {
      sharpDisplay.textContent = parseFloat(sharpBalance).toFixed(2) + ' SHARP';
    }
    
  } catch (error) {
    console.error('Error updating balances:', error);
  }
}

// Format Address (0x1234...5678)
function formatAddress(address) {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

// Request Reward from Backend (simplified example)
async function requestRewardFromBackend(score, gameId) {
  if (!connectedWalletAddress) {
    throw new Error('Wallet not connected');
  }
  
  if (typeof currentUser === 'undefined' || !currentUser) {
    throw new Error('User not authenticated');
  }
  
  try {
    // Calculate reward based on score
    const rewardAmount = calculateReward(score);
    
    // In a real implementation, call your backend/Firebase function
    // which will verify the score and send tokens
    const claimReward = firebase.functions().httpsCallable('claimReward');
    const result = await claimReward({
      score: score,
      gameId: gameId,
      walletAddress: connectedWalletAddress
    });
    
    return result.data;
    
  } catch (error) {
    console.error('Error requesting reward:', error);
    throw error;
  }
}

// Calculate Reward (example formula)
function calculateReward(score) {
  // Example: 1 SHARP per 100 points
  return Math.floor(score / 100) * 1;
}

// Initialize Web3 on page load
window.addEventListener('load', async () => {
  await initWeb3();
  
  // Auto-connect if previously connected
  if (localStorage.getItem('walletConnected') === 'true') {
    setTimeout(() => {
      connectWallet();
    }, 1000);
  }
});

// Clean up on page unload
window.addEventListener('beforeunload', () => {
  if (connectedWalletAddress) {
    localStorage.setItem('walletConnected', 'true');
  } else {
    localStorage.removeItem('walletConnected');
  }
});
