import { ethers } from "ethers";
import * as fs from "fs";
import * as path from "path";

// ABI imports (simplified for demo - in production, import from artifacts)
const GasManagerABI = [
  "function allocateGas(address user) external returns (bytes32)",
  "function revertGas(bytes32 allocationId) external",
  "function returnGas(bytes32 allocationId) external payable",
  "function updateEligibility(address user, uint256 amount) external",
  "function getAllocation(bytes32 allocationId) external view returns (address user, uint256 amount, uint256 timestamp, bool isActive)",
  "function userEligibleAmount(address user) external view returns (uint256)",
  "function poolBalance() external view returns (uint256)",
  "event GasAllocated(bytes32 indexed allocationId, address indexed user, uint256 amount, uint256 timestamp)",
  "event GasReverted(bytes32 indexed allocationId, address indexed user, uint256 amount, bool successful)",
];

const QuestHubABI = [
  "function createQuest(string memory name, string memory description, uint256 xpReward, uint256 gasReward, uint256 requiredAction) external returns (uint256)",
  "function completeQuest(uint256 questId) external",
  "function verifyAndCompleteQuest(address user, uint256 questId) external",
  "function getUserProgress(address user) external view returns (uint256 totalXP, uint256 completedQuests, uint256 level, uint256 xpToNextLevel)",
  "function hasCompletedQuest(address user, uint256 questId) external view returns (bool)",
  "function getQuest(uint256 questId) external view returns (string memory name, string memory description, uint256 xpReward, uint256 gasReward, bool isActive, uint256 completionCount)",
  "function getTotalQuests() external view returns (uint256)",
  "event QuestCompleted(address indexed user, uint256 indexed questId, uint256 xpEarned, uint256 gasEligibilityEarned)",
  "event LevelUp(address indexed user, uint256 newLevel, uint256 totalXP)",
];

const BridgeManagerABI = [
  "function initiateBridge(string memory targetChain, string memory targetToken) external payable returns (bytes32)",
  "function completeBridge(bytes32 requestId) external",
  "function getBridgeRequest(bytes32 requestId) external view returns (address user, uint256 amount, string memory targetChain, string memory targetToken, uint256 timestamp, bool isCompleted)",
  "function calculateBridgeOutput(uint256 inputAmount, string memory targetToken) external view returns (uint256 outputAmount, uint256 fee)",
  "event BridgeInitiated(bytes32 indexed requestId, address indexed user, uint256 amount, string targetChain, string targetToken, uint256 timestamp)",
  "event BridgeCompleted(bytes32 indexed requestId, address indexed user, uint256 outputAmount, bool success)",
];

export class ContractService {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  public gasManager: ethers.Contract;
  public questHub: ethers.Contract;
  public bridgeManager: ethers.Contract;

  constructor() {
    const rpcUrl = process.env.RPC_URL || "http://127.0.0.1:8545";
    const privateKey = process.env.PRIVATE_KEY || "";

    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.wallet = new ethers.Wallet(privateKey, this.provider);

    // Load deployment addresses
    const deploymentPath = path.join(__dirname, "../contracts/deployments.json");
    let addresses: any = {};

    if (fs.existsSync(deploymentPath)) {
      const deploymentData = fs.readFileSync(deploymentPath, "utf-8");
      addresses = JSON.parse(deploymentData).contracts;
    } else {
      console.warn("⚠️  Deployment file not found. Using environment variables.");
      addresses = {
        GasManager: process.env.GAS_MANAGER_ADDRESS,
        QuestHub: process.env.QUEST_HUB_ADDRESS,
        BridgeManager: process.env.BRIDGE_MANAGER_ADDRESS,
      };
    }

    // Initialize contracts
    this.gasManager = new ethers.Contract(
      addresses.GasManager,
      GasManagerABI,
      this.wallet
    );

    this.questHub = new ethers.Contract(
      addresses.QuestHub,
      QuestHubABI,
      this.wallet
    );

    this.bridgeManager = new ethers.Contract(
      addresses.BridgeManager,
      BridgeManagerABI,
      this.wallet
    );

    console.log("✅ Contract service initialized");
    console.log("   GasManager:", addresses.GasManager);
    console.log("   QuestHub:", addresses.QuestHub);
    console.log("   BridgeManager:", addresses.BridgeManager);
  }

  // Gas Manager methods
  async allocateGasToUser(userAddress: string): Promise<string> {
    try {
      const tx = await this.gasManager.allocateGas(userAddress);
      const receipt = await tx.wait();

      // Extract allocation ID from event
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = this.gasManager.interface.parseLog(log);
          return parsed?.name === "GasAllocated";
        } catch {
          return false;
        }
      });

      if (event) {
        const parsed = this.gasManager.interface.parseLog(event);
        return parsed?.args[0]; // allocationId
      }

      throw new Error("Allocation event not found");
    } catch (error: any) {
      throw new Error(`Failed to allocate gas: ${error.message}`);
    }
  }

  async getPoolBalance(): Promise<string> {
    const balance = await this.gasManager.poolBalance();
    return ethers.formatEther(balance);
  }

  async getUserEligibility(userAddress: string): Promise<string> {
    const amount = await this.gasManager.userEligibleAmount(userAddress);
    return ethers.formatEther(amount);
  }

  // Quest Hub methods
  async getUserProgress(userAddress: string) {
    const [totalXP, completedQuests, level, xpToNextLevel] =
      await this.questHub.getUserProgress(userAddress);

    return {
      totalXP: totalXP.toString(),
      completedQuests: completedQuests.toString(),
      level: level.toString(),
      xpToNextLevel: xpToNextLevel.toString(),
    };
  }

  async getQuest(questId: number) {
    const [name, description, xpReward, gasReward, isActive, completionCount] =
      await this.questHub.getQuest(questId);

    return {
      id: questId,
      name,
      description,
      xpReward: xpReward.toString(),
      gasReward: ethers.formatEther(gasReward),
      isActive,
      completionCount: completionCount.toString(),
    };
  }

  async getAllQuests() {
    const totalQuests = await this.questHub.getTotalQuests();
    const quests = [];

    for (let i = 1; i <= Number(totalQuests); i++) {
      const quest = await this.getQuest(i);
      quests.push(quest);
    }

    return quests;
  }

  async hasCompletedQuest(userAddress: string, questId: number): Promise<boolean> {
    return await this.questHub.hasCompletedQuest(userAddress, questId);
  }

  async verifyAndCompleteQuest(userAddress: string, questId: number) {
    try {
      const tx = await this.questHub.verifyAndCompleteQuest(userAddress, questId);
      await tx.wait();
      return { success: true, txHash: tx.hash };
    } catch (error: any) {
      throw new Error(`Failed to complete quest: ${error.message}`);
    }
  }

  // Bridge Manager methods
  async calculateBridgeOutput(inputAmount: string, targetToken: string) {
    const amount = ethers.parseEther(inputAmount);
    const [outputAmount, fee] = await this.bridgeManager.calculateBridgeOutput(
      amount,
      targetToken
    );

    return {
      outputAmount: ethers.formatEther(outputAmount),
      fee: ethers.formatEther(fee),
    };
  }

  async getBridgeRequest(requestId: string) {
    const [user, amount, targetChain, targetToken, timestamp, isCompleted] =
      await this.bridgeManager.getBridgeRequest(requestId);

    return {
      user,
      amount: ethers.formatEther(amount),
      targetChain,
      targetToken,
      timestamp: timestamp.toString(),
      isCompleted,
    };
  }

  async completeBridgeRequest(requestId: string) {
    try {
      const tx = await this.bridgeManager.completeBridge(requestId);
      await tx.wait();
      return { success: true, txHash: tx.hash };
    } catch (error: any) {
      throw new Error(`Failed to complete bridge: ${error.message}`);
    }
  }
}

export default ContractService;
