// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title BridgeManager
 * @dev Simulates bridging MON gas to target chain tokens
 * @notice For MVP demo - bridges MON to user's required token format
 */
contract BridgeManager is Ownable, ReentrancyGuard {

    // Bridge request structure
    struct BridgeRequest {
        address user;
        uint256 amount;
        string targetChain;
        string targetToken;
        uint256 timestamp;
        bool isCompleted;
        bytes32 requestId;
    }

    // Supported chains (for demo)
    mapping(string => bool) public supportedChains;

    // Bridge requests
    mapping(bytes32 => BridgeRequest) public bridgeRequests;
    mapping(address => bytes32[]) public userBridgeRequests;

    // Conversion rates (MON to target token, scaled by 1e18)
    mapping(string => uint256) public conversionRates;

    // Bridge fee (percentage, scaled by 100, e.g., 50 = 0.5%)
    uint256 public bridgeFeePercent = 50; // 0.5%

    // Events
    event BridgeInitiated(
        bytes32 indexed requestId,
        address indexed user,
        uint256 amount,
        string targetChain,
        string targetToken,
        uint256 timestamp
    );

    event BridgeCompleted(
        bytes32 indexed requestId,
        address indexed user,
        uint256 outputAmount,
        bool success
    );

    event ChainAdded(string chain, bool supported);

    event ConversionRateUpdated(string tokenSymbol, uint256 rate);

    constructor() Ownable(msg.sender) {
        // Initialize supported chains
        supportedChains["Ethereum"] = true;
        supportedChains["Polygon"] = true;
        supportedChains["BSC"] = true;
        supportedChains["Arbitrum"] = true;
        supportedChains["Optimism"] = true;

        // Initialize demo conversion rates (1 MON = X target token)
        // Rates are scaled by 1e18 for precision
        conversionRates["ETH"] = 1e18;       // 1:1 for demo
        conversionRates["MATIC"] = 1500e18;  // 1 MON = 1500 MATIC
        conversionRates["BNB"] = 2e18;       // 1 MON = 2 BNB
        conversionRates["USDC"] = 3000e18;   // 1 MON = 3000 USDC
        conversionRates["USDT"] = 3000e18;   // 1 MON = 3000 USDT
    }

    /**
     * @dev Initiate a bridge request
     * @param targetChain Target blockchain
     * @param targetToken Target token symbol
     */
    function initiateBridge(
        string memory targetChain,
        string memory targetToken
    ) external payable nonReentrant returns (bytes32) {
        require(msg.value > 0, "Must send MON to bridge");
        require(supportedChains[targetChain], "Chain not supported");
        require(conversionRates[targetToken] > 0, "Token not supported");

        // Calculate fee
        uint256 fee = (msg.value * bridgeFeePercent) / 10000;
        uint256 amountAfterFee = msg.value - fee;

        // Generate request ID
        bytes32 requestId = keccak256(
            abi.encodePacked(
                msg.sender,
                msg.value,
                targetChain,
                targetToken,
                block.timestamp,
                block.number
            )
        );

        // Create bridge request
        bridgeRequests[requestId] = BridgeRequest({
            user: msg.sender,
            amount: amountAfterFee,
            targetChain: targetChain,
            targetToken: targetToken,
            timestamp: block.timestamp,
            isCompleted: false,
            requestId: requestId
        });

        userBridgeRequests[msg.sender].push(requestId);

        emit BridgeInitiated(
            requestId,
            msg.sender,
            amountAfterFee,
            targetChain,
            targetToken,
            block.timestamp
        );

        return requestId;
    }

    /**
     * @dev Complete a bridge request (simulated for demo)
     * @param requestId ID of the bridge request
     */
    function completeBridge(bytes32 requestId) external onlyOwner nonReentrant {
        BridgeRequest storage request = bridgeRequests[requestId];

        require(!request.isCompleted, "Bridge already completed");
        require(request.user != address(0), "Invalid request");

        // Calculate output amount based on conversion rate
        uint256 outputAmount = (request.amount * conversionRates[request.targetToken]) / 1e18;

        // Mark as completed
        request.isCompleted = true;

        // In a real implementation, this would trigger cross-chain message
        // For demo, we just emit event and return MON equivalent
        (bool success, ) = payable(request.user).call{value: request.amount}("");

        emit BridgeCompleted(requestId, request.user, outputAmount, success);
    }

    /**
     * @dev Get bridge request details
     */
    function getBridgeRequest(bytes32 requestId)
        external
        view
        returns (
            address user,
            uint256 amount,
            string memory targetChain,
            string memory targetToken,
            uint256 timestamp,
            bool isCompleted
        )
    {
        BridgeRequest memory request = bridgeRequests[requestId];
        return (
            request.user,
            request.amount,
            request.targetChain,
            request.targetToken,
            request.timestamp,
            request.isCompleted
        );
    }

    /**
     * @dev Get all bridge requests for a user
     */
    function getUserBridgeRequests(address user)
        external
        view
        returns (bytes32[] memory)
    {
        return userBridgeRequests[user];
    }

    /**
     * @dev Calculate output amount for a bridge
     */
    function calculateBridgeOutput(uint256 inputAmount, string memory targetToken)
        external
        view
        returns (uint256 outputAmount, uint256 fee)
    {
        require(conversionRates[targetToken] > 0, "Token not supported");

        fee = (inputAmount * bridgeFeePercent) / 10000;
        uint256 amountAfterFee = inputAmount - fee;
        outputAmount = (amountAfterFee * conversionRates[targetToken]) / 1e18;

        return (outputAmount, fee);
    }

    /**
     * @dev Add or update supported chain
     */
    function setSupportedChain(string memory chain, bool supported)
        external
        onlyOwner
    {
        supportedChains[chain] = supported;
        emit ChainAdded(chain, supported);
    }

    /**
     * @dev Update conversion rate for a token
     */
    function setConversionRate(string memory tokenSymbol, uint256 rate)
        external
        onlyOwner
    {
        require(rate > 0, "Rate must be positive");
        conversionRates[tokenSymbol] = rate;
        emit ConversionRateUpdated(tokenSymbol, rate);
    }

    /**
     * @dev Update bridge fee percentage
     */
    function setBridgeFee(uint256 newFeePercent) external onlyOwner {
        require(newFeePercent <= 1000, "Fee too high"); // Max 10%
        bridgeFeePercent = newFeePercent;
    }

    /**
     * @dev Withdraw collected fees
     */
    function withdrawFees(uint256 amount) external onlyOwner {
        require(amount <= address(this).balance, "Insufficient balance");

        (bool success, ) = payable(owner()).call{value: amount}("");
        require(success, "Withdrawal failed");
    }

    /**
     * @dev Get contract balance
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    // Receive function to accept MON
    receive() external payable {}
}
