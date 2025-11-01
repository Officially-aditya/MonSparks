// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title QuestHub
 * @dev Manages on-chain quests and rewards users with XP and gas eligibility
 * @notice Users complete quests to earn MON Sparks (XP) which unlock gas allocation
 */
contract QuestHub is Ownable, ReentrancyGuard {

    // Quest structure
    struct Quest {
        uint256 id;
        string name;
        string description;
        uint256 xpReward;
        uint256 gasReward; // Amount of gas eligibility earned
        bool isActive;
        uint256 completionCount;
        uint256 requiredAction; // Type of action required (1=social, 2=transaction, 3=game)
    }

    // User progress structure
    struct UserProgress {
        uint256 totalXP;
        uint256 completedQuests;
        uint256 level;
        mapping(uint256 => bool) questCompleted;
    }

    // Storage
    mapping(uint256 => Quest) public quests;
    mapping(address => UserProgress) public userProgress;
    uint256 public questCounter;

    // Level thresholds (XP needed for each level)
    uint256[] public levelThresholds;

    // Reference to GasManager contract
    address public gasManager;

    // Events
    event QuestCreated(
        uint256 indexed questId,
        string name,
        uint256 xpReward,
        uint256 gasReward
    );

    event QuestCompleted(
        address indexed user,
        uint256 indexed questId,
        uint256 xpEarned,
        uint256 gasEligibilityEarned
    );

    event LevelUp(address indexed user, uint256 newLevel, uint256 totalXP);

    event RewardClaimed(address indexed user, uint256 amount);

    constructor() Ownable(msg.sender) {
        questCounter = 0;

        // Initialize level thresholds (XP needed for each level)
        levelThresholds.push(0);      // Level 0
        levelThresholds.push(100);    // Level 1
        levelThresholds.push(250);    // Level 2
        levelThresholds.push(500);    // Level 3
        levelThresholds.push(1000);   // Level 4
        levelThresholds.push(2000);   // Level 5
    }

    /**
     * @dev Set the GasManager contract address
     */
    function setGasManager(address _gasManager) external onlyOwner {
        require(_gasManager != address(0), "Invalid address");
        gasManager = _gasManager;
    }

    /**
     * @dev Create a new quest
     * @param name Quest name
     * @param description Quest description
     * @param xpReward XP reward for completion
     * @param gasReward Gas eligibility reward
     * @param requiredAction Type of action required
     */
    function createQuest(
        string memory name,
        string memory description,
        uint256 xpReward,
        uint256 gasReward,
        uint256 requiredAction
    ) external onlyOwner returns (uint256) {
        questCounter++;

        quests[questCounter] = Quest({
            id: questCounter,
            name: name,
            description: description,
            xpReward: xpReward,
            gasReward: gasReward,
            isActive: true,
            completionCount: 0,
            requiredAction: requiredAction
        });

        emit QuestCreated(questCounter, name, xpReward, gasReward);

        return questCounter;
    }

    /**
     * @dev Complete a quest and earn rewards
     * @param questId ID of the quest to complete
     */
    function completeQuest(uint256 questId) external nonReentrant {
        Quest storage quest = quests[questId];
        require(quest.isActive, "Quest not active");
        require(!userProgress[msg.sender].questCompleted[questId], "Quest already completed");

        // Mark quest as completed
        userProgress[msg.sender].questCompleted[questId] = true;
        userProgress[msg.sender].completedQuests++;
        quest.completionCount++;

        // Award XP
        uint256 oldXP = userProgress[msg.sender].totalXP;
        userProgress[msg.sender].totalXP += quest.xpReward;

        // Check for level up
        _checkLevelUp(msg.sender, oldXP);

        emit QuestCompleted(msg.sender, questId, quest.xpReward, quest.gasReward);

        // Update gas eligibility in GasManager if set
        if (gasManager != address(0) && quest.gasReward > 0) {
            // Call GasManager to update eligibility
            (bool success, ) = gasManager.call(
                abi.encodeWithSignature(
                    "updateEligibility(address,uint256)",
                    msg.sender,
                    quest.gasReward
                )
            );
            require(success, "Failed to update gas eligibility");
        }
    }

    /**
     * @dev Verify quest completion (called by backend after off-chain verification)
     * @param user User who completed the quest
     * @param questId Quest ID
     */
    function verifyAndCompleteQuest(address user, uint256 questId)
        external
        onlyOwner
        nonReentrant
    {
        Quest storage quest = quests[questId];
        require(quest.isActive, "Quest not active");
        require(!userProgress[user].questCompleted[questId], "Quest already completed");

        // Mark quest as completed
        userProgress[user].questCompleted[questId] = true;
        userProgress[user].completedQuests++;
        quest.completionCount++;

        // Award XP
        uint256 oldXP = userProgress[user].totalXP;
        userProgress[user].totalXP += quest.xpReward;

        // Check for level up
        _checkLevelUp(user, oldXP);

        emit QuestCompleted(user, questId, quest.xpReward, quest.gasReward);

        // Update gas eligibility
        if (gasManager != address(0) && quest.gasReward > 0) {
            (bool success, ) = gasManager.call(
                abi.encodeWithSignature(
                    "updateEligibility(address,uint256)",
                    user,
                    quest.gasReward
                )
            );
            require(success, "Failed to update gas eligibility");
        }
    }

    /**
     * @dev Check if user leveled up
     */
    function _checkLevelUp(address user, uint256 oldXP) internal {
        uint256 currentLevel = userProgress[user].level;
        uint256 newXP = userProgress[user].totalXP;

        // Check if user reached next level threshold
        for (uint256 i = currentLevel + 1; i < levelThresholds.length; i++) {
            if (newXP >= levelThresholds[i]) {
                userProgress[user].level = i;
                emit LevelUp(user, i, newXP);
            } else {
                break;
            }
        }
    }

    /**
     * @dev Get user's current level and progress
     */
    function getUserProgress(address user)
        external
        view
        returns (
            uint256 totalXP,
            uint256 completedQuests,
            uint256 level,
            uint256 xpToNextLevel
        )
    {
        UserProgress storage progress = userProgress[user];
        uint256 currentLevel = progress.level;
        uint256 nextLevelXP = currentLevel + 1 < levelThresholds.length
            ? levelThresholds[currentLevel + 1]
            : 0;

        return (
            progress.totalXP,
            progress.completedQuests,
            progress.level,
            nextLevelXP > progress.totalXP ? nextLevelXP - progress.totalXP : 0
        );
    }

    /**
     * @dev Check if user completed a specific quest
     */
    function hasCompletedQuest(address user, uint256 questId)
        external
        view
        returns (bool)
    {
        return userProgress[user].questCompleted[questId];
    }

    /**
     * @dev Get quest details
     */
    function getQuest(uint256 questId)
        external
        view
        returns (
            string memory name,
            string memory description,
            uint256 xpReward,
            uint256 gasReward,
            bool isActive,
            uint256 completionCount
        )
    {
        Quest memory quest = quests[questId];
        return (
            quest.name,
            quest.description,
            quest.xpReward,
            quest.gasReward,
            quest.isActive,
            quest.completionCount
        );
    }

    /**
     * @dev Toggle quest active status
     */
    function toggleQuestStatus(uint256 questId) external onlyOwner {
        quests[questId].isActive = !quests[questId].isActive;
    }

    /**
     * @dev Get total number of quests
     */
    function getTotalQuests() external view returns (uint256) {
        return questCounter;
    }

    /**
     * @dev Add a new level threshold
     */
    function addLevelThreshold(uint256 xpRequired) external onlyOwner {
        require(xpRequired > levelThresholds[levelThresholds.length - 1], "Threshold must be higher");
        levelThresholds.push(xpRequired);
    }

    /**
     * @dev Get all level thresholds
     */
    function getLevelThresholds() external view returns (uint256[] memory) {
        return levelThresholds;
    }
}
