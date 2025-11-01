import { Router, Request, Response } from "express";
import ContractService from "../utils/contracts";
import storage from "../utils/storage";

const router = Router();
let contractService: ContractService;

// Initialize contract service
export const initQuestsRoute = (cs: ContractService) => {
  contractService = cs;
};

/**
 * GET /api/quests
 * Get all available quests
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const quests = await contractService.getAllQuests();

    // Add user progress if address provided
    const userAddress = req.query.address as string;
    if (userAddress) {
      const questsWithProgress = await Promise.all(
        quests.map(async (quest) => {
          const completed = await contractService.hasCompletedQuest(
            userAddress,
            quest.id
          );
          return { ...quest, completed };
        })
      );
      return res.json({ quests: questsWithProgress });
    }

    res.json({ quests });
  } catch (error: any) {
    console.error("Error fetching quests:", error);
    res.status(500).json({ error: "Failed to fetch quests", message: error.message });
  }
});

/**
 * GET /api/quests/:id
 * Get specific quest details
 */
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const questId = parseInt(req.params.id);
    const quest = await contractService.getQuest(questId);

    const userAddress = req.query.address as string;
    if (userAddress) {
      const completed = await contractService.hasCompletedQuest(userAddress, questId);
      return res.json({ quest: { ...quest, completed } });
    }

    res.json({ quest });
  } catch (error: any) {
    console.error("Error fetching quest:", error);
    res.status(500).json({ error: "Failed to fetch quest", message: error.message });
  }
});

/**
 * POST /api/quests/:id/complete
 * Complete a quest (verify and mark as complete)
 */
router.post("/:id/complete", async (req: Request, res: Response) => {
  try {
    const questId = parseInt(req.params.id);
    const { userAddress } = req.body;

    if (!userAddress) {
      return res.status(400).json({ error: "User address is required" });
    }

    // Check if already completed
    const hasCompleted = await contractService.hasCompletedQuest(userAddress, questId);
    if (hasCompleted) {
      return res.status(400).json({ error: "Quest already completed" });
    }

    // Verify and complete quest on-chain
    const result = await contractService.verifyAndCompleteQuest(userAddress, questId);

    // Store in local storage
    storage.markQuestCompleted(userAddress, questId);

    // Get quest details for activity
    const quest = await contractService.getQuest(questId);

    // Add to activity feed
    storage.addActivity({
      id: storage.generateId(),
      userAddress,
      type: "quest_completed",
      description: `Completed quest: ${quest.name}`,
      timestamp: new Date().toISOString(),
      metadata: { questId, xpEarned: quest.xpReward },
    });

    // Get updated user progress
    const userProgress = await contractService.getUserProgress(userAddress);

    res.json({
      success: true,
      txHash: result.txHash,
      quest,
      userProgress,
    });
  } catch (error: any) {
    console.error("Error completing quest:", error);
    res.status(500).json({ error: "Failed to complete quest", message: error.message });
  }
});

/**
 * GET /api/quests/progress/:address
 * Get user's quest progress and stats
 */
router.get("/progress/:address", async (req: Request, res: Response) => {
  try {
    const userAddress = req.params.address;

    // Get on-chain progress
    const progress = await contractService.getUserProgress(userAddress);

    // Get local quest completion data
    const user = storage.getUser(userAddress);

    res.json({
      progress: {
        ...progress,
        questsCompleted: user?.questProgress || {},
      },
    });
  } catch (error: any) {
    console.error("Error fetching progress:", error);
    res.status(500).json({ error: "Failed to fetch progress", message: error.message });
  }
});

export default router;
