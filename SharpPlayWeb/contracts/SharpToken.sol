// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title SharpToken
 * @dev ERC20 Token for SharpPlay gaming platform
 * Features:
 * - Mintable by owner (for game rewards)
 * - Burnable by token holders
 * - Pausable for emergency situations
 * - Capped supply for tokenomics
 */
contract SharpToken is ERC20, ERC20Burnable, Ownable, Pausable {
    
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 1 billion tokens
    uint256 public constant INITIAL_SUPPLY = 100_000_000 * 10**18; // 100 million tokens
    
    // Reward pool address (controlled by backend)
    address public rewardPool;
    
    // Daily mint limit to prevent abuse
    uint256 public dailyMintLimit = 10_000 * 10**18; // 10,000 tokens per day
    uint256 public lastMintReset;
    uint256 public mintedToday;
    
    // Events
    event RewardPoolUpdated(address indexed oldPool, address indexed newPool);
    event DailyLimitUpdated(uint256 oldLimit, uint256 newLimit);
    event TokensMinted(address indexed to, uint256 amount, string reason);
    
    /**
     * @dev Constructor that mints initial supply to deployer
     */
    constructor() ERC20("Sharp Token", "SHARP") {
        _mint(msg.sender, INITIAL_SUPPLY);
        lastMintReset = block.timestamp;
    }
    
    /**
     * @dev Set reward pool address (only owner)
     * @param _rewardPool Address of the reward distribution contract/wallet
     */
    function setRewardPool(address _rewardPool) external onlyOwner {
        require(_rewardPool != address(0), "Invalid address");
        emit RewardPoolUpdated(rewardPool, _rewardPool);
        rewardPool = _rewardPool;
    }
    
    /**
     * @dev Update daily mint limit (only owner)
     * @param _newLimit New daily mint limit in wei
     */
    function setDailyMintLimit(uint256 _newLimit) external onlyOwner {
        emit DailyLimitUpdated(dailyMintLimit, _newLimit);
        dailyMintLimit = _newLimit;
    }
    
    /**
     * @dev Mint new tokens (only owner)
     * Subject to daily limit and max supply cap
     * @param to Address to receive tokens
     * @param amount Amount of tokens to mint
     * @param reason Reason for minting (for transparency)
     */
    function mint(address to, uint256 amount, string memory reason) external onlyOwner {
        require(to != address(0), "Cannot mint to zero address");
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        
        // Reset daily counter if 24 hours passed
        if (block.timestamp >= lastMintReset + 1 days) {
            lastMintReset = block.timestamp;
            mintedToday = 0;
        }
        
        // Check daily limit
        require(mintedToday + amount <= dailyMintLimit, "Exceeds daily mint limit");
        
        mintedToday += amount;
        _mint(to, amount);
        
        emit TokensMinted(to, amount, reason);
    }
    
    /**
     * @dev Batch mint for multiple recipients (gas efficient)
     * @param recipients Array of recipient addresses
     * @param amounts Array of amounts to mint
     */
    function batchMint(address[] memory recipients, uint256[] memory amounts) 
        external 
        onlyOwner 
    {
        require(recipients.length == amounts.length, "Array length mismatch");
        require(recipients.length <= 100, "Too many recipients"); // Gas limit protection
        
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            totalAmount += amounts[i];
        }
        
        require(totalSupply() + totalAmount <= MAX_SUPPLY, "Exceeds max supply");
        
        // Reset daily counter if needed
        if (block.timestamp >= lastMintReset + 1 days) {
            lastMintReset = block.timestamp;
            mintedToday = 0;
        }
        
        require(mintedToday + totalAmount <= dailyMintLimit, "Exceeds daily mint limit");
        
        mintedToday += totalAmount;
        
        for (uint256 i = 0; i < recipients.length; i++) {
            require(recipients[i] != address(0), "Invalid recipient");
            _mint(recipients[i], amounts[i]);
        }
    }
    
    /**
     * @dev Pause token transfers (emergency only)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause token transfers
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Override _beforeTokenTransfer to add pause functionality
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
    }
    
    /**
     * @dev Get remaining mintable tokens for today
     */
    function getRemainingDailyMint() external view returns (uint256) {
        if (block.timestamp >= lastMintReset + 1 days) {
            return dailyMintLimit;
        }
        return dailyMintLimit - mintedToday;
    }
    
    /**
     * @dev Get remaining total supply that can be minted
     */
    function getRemainingSupply() external view returns (uint256) {
        return MAX_SUPPLY - totalSupply();
    }
}

/**
 * Deployment Instructions:
 * 
 * 1. Install Dependencies:
 *    npm install --save-dev @openzeppelin/contracts
 * 
 * 2. Compile with Hardhat/Truffle:
 *    npx hardhat compile
 * 
 * 3. Deploy to Polygon Mumbai (testnet):
 *    npx hardhat run scripts/deploy.js --network mumbai
 * 
 * 4. Deploy to Polygon Mainnet:
 *    npx hardhat run scripts/deploy.js --network polygon
 * 
 * 5. Verify on Polygonscan:
 *    npx hardhat verify --network polygon DEPLOYED_CONTRACT_ADDRESS
 * 
 * 6. After Deployment:
 *    - Set reward pool address: setRewardPool(BACKEND_WALLET_ADDRESS)
 *    - Transfer tokens to reward pool for distribution
 *    - Update WEB3_CONFIG.SHARP_TOKEN_ADDRESS in frontend
 *    - Update functions config with contract address
 */
