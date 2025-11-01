// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title GasManager
 * @dev Manages temporary MON gas allocation and automatic reversion
 * @notice This contract allows users to borrow gas temporarily for microtransactions
 */
contract GasManager is Ownable, ReentrancyGuard {

    // Struct to track gas allocations
    struct GasAllocation {
        address user;
        uint256 amount;
        uint256 timestamp;
        bool isActive;
        bytes32 transactionHash;
    }

    // Mapping from allocation ID to allocation details
    mapping(bytes32 => GasAllocation) public allocations;

    // Mapping from user address to their active allocation ID
    mapping(address => bytes32) public userActiveAllocation;

    // Mapping to track user eligibility (based on quest completion)
    mapping(address => uint256) public userEligibleAmount;

    // Pool balance for gas allocation
    uint256 public poolBalance;

    // Maximum allocation per user
    uint256 public maxAllocationPerUser = 0.1 ether; // 0.1 MON

    // Allocation timeout (after which it can be force-reverted)
    uint256 public constant ALLOCATION_TIMEOUT = 1 hours;

    // Events
    event GasAllocated(
        bytes32 indexed allocationId,
        address indexed user,
        uint256 amount,
        uint256 timestamp
    );

    event GasReverted(
        bytes32 indexed allocationId,
        address indexed user,
        uint256 amount,
        bool successful
    );

    event PoolFunded(address indexed funder, uint256 amount);

    event EligibilityUpdated(address indexed user, uint256 amount);

    constructor() {
        poolBalance = 0;
    }

    /**
     * @dev Fund the gas pool with MON
     */
    function fundPool() external payable onlyOwner {
        require(msg.value > 0, "Must send MON to fund pool");
        poolBalance += msg.value;
        emit PoolFunded(msg.sender, msg.value);
    }

    /**
     * @dev Update user eligibility based on quest completion
     * @param user Address of the user
     * @param amount Amount of gas they're eligible for
     */
    function updateEligibility(address user, uint256 amount) external onlyOwner {
        require(amount <= maxAllocationPerUser, "Amount exceeds max allocation");
        userEligibleAmount[user] = amount;
        emit EligibilityUpdated(user, amount);
    }

    /**
     * @dev Allocate temporary gas to a user
     * @param user Address to allocate gas to
     */
    function allocateGas(address user) external nonReentrant returns (bytes32) {
        require(userEligibleAmount[user] > 0, "User not eligible for gas allocation");
        require(userActiveAllocation[user] == bytes32(0), "User already has active allocation");
        require(poolBalance >= userEligibleAmount[user], "Insufficient pool balance");

        uint256 amount = userEligibleAmount[user];
        bytes32 allocationId = keccak256(
            abi.encodePacked(user, block.timestamp, block.number)
        );

        // Create allocation record
        allocations[allocationId] = GasAllocation({
            user: user,
            amount: amount,
            timestamp: block.timestamp,
            isActive: true,
            transactionHash: bytes32(0)
        });

        // Update mappings
        userActiveAllocation[user] = allocationId;
        poolBalance -= amount;

        // Transfer gas to user
        (bool success, ) = payable(user).call{value: amount}("");
        require(success, "Gas transfer failed");

        emit GasAllocated(allocationId, user, amount, block.timestamp);

        return allocationId;
    }

    /**
     * @dev Revert gas back to the pool after transaction completion
     * @param allocationId ID of the allocation to revert
     */
    function revertGas(bytes32 allocationId) external nonReentrant {
        GasAllocation storage allocation = allocations[allocationId];

        require(allocation.isActive, "Allocation not active");
        require(
            msg.sender == allocation.user || msg.sender == owner(),
            "Only user or owner can revert"
        );

        address user = allocation.user;
        uint256 currentBalance = user.balance;
        uint256 amountToRevert = allocation.amount;

        // Check if user has enough balance to revert
        bool fullRevert = currentBalance >= amountToRevert;
        uint256 actualRevertAmount = fullRevert ? amountToRevert : currentBalance;

        if (actualRevertAmount > 0) {
            // Request user to return the gas
            // In practice, this would be handled by a frontend approval flow
            // For now, we mark it as inactive and expect the user to send back
            allocation.isActive = false;
            userActiveAllocation[user] = bytes32(0);
            poolBalance += actualRevertAmount;

            emit GasReverted(allocationId, user, actualRevertAmount, fullRevert);
        }
    }

    /**
     * @dev Allow user to manually return borrowed gas
     * @param allocationId ID of the allocation
     */
    function returnGas(bytes32 allocationId) external payable nonReentrant {
        GasAllocation storage allocation = allocations[allocationId];

        require(allocation.user == msg.sender, "Not your allocation");
        require(allocation.isActive, "Allocation not active");
        require(msg.value > 0, "Must send MON to return");

        uint256 amountToReturn = msg.value > allocation.amount ? allocation.amount : msg.value;

        allocation.isActive = false;
        userActiveAllocation[msg.sender] = bytes32(0);
        poolBalance += amountToReturn;

        // Reset eligibility after use
        userEligibleAmount[msg.sender] = 0;

        emit GasReverted(allocationId, msg.sender, amountToReturn, amountToReturn == allocation.amount);
    }

    /**
     * @dev Force revert expired allocations (emergency function)
     * @param allocationId ID of the allocation
     */
    function forceRevertExpired(bytes32 allocationId) external onlyOwner {
        GasAllocation storage allocation = allocations[allocationId];

        require(allocation.isActive, "Allocation not active");
        require(
            block.timestamp >= allocation.timestamp + ALLOCATION_TIMEOUT,
            "Allocation not expired"
        );

        allocation.isActive = false;
        userActiveAllocation[allocation.user] = bytes32(0);

        emit GasReverted(allocationId, allocation.user, 0, false);
    }

    /**
     * @dev Get allocation details
     */
    function getAllocation(bytes32 allocationId)
        external
        view
        returns (
            address user,
            uint256 amount,
            uint256 timestamp,
            bool isActive
        )
    {
        GasAllocation memory allocation = allocations[allocationId];
        return (
            allocation.user,
            allocation.amount,
            allocation.timestamp,
            allocation.isActive
        );
    }

    /**
     * @dev Withdraw excess funds from pool (owner only)
     */
    function withdrawFromPool(uint256 amount) external onlyOwner {
        require(amount <= poolBalance, "Insufficient pool balance");
        poolBalance -= amount;

        (bool success, ) = payable(owner()).call{value: amount}("");
        require(success, "Withdrawal failed");
    }

    /**
     * @dev Update max allocation per user
     */
    function setMaxAllocationPerUser(uint256 newMax) external onlyOwner {
        maxAllocationPerUser = newMax;
    }

    // Receive function to accept MON
    receive() external payable {
        poolBalance += msg.value;
        emit PoolFunded(msg.sender, msg.value);
    }
}
