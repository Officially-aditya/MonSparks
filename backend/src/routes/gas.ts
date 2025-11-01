import { Router, Request, Response } from "express";
import ContractService from "../utils/contracts";
import storage from "../utils/storage";

const router = Router();
let contractService: ContractService;

// Initialize contract service
export const initGasRoute = (cs: ContractService) => {
  contractService = cs;
};

/**
 * GET /api/gas/eligibility/:address
 * Check user's gas eligibility
 */
router.get("/eligibility/:address", async (req: Request, res: Response) => {
  try {
    const userAddress = req.params.address;
    const eligibleAmount = await contractService.getUserEligibility(userAddress);

    res.json({
      address: userAddress,
      eligibleAmount,
      isEligible: parseFloat(eligibleAmount) > 0,
    });
  } catch (error: any) {
    console.error("Error checking eligibility:", error);
    res.status(500).json({ error: "Failed to check eligibility", message: error.message });
  }
});

/**
 * POST /api/gas/allocate
 * Allocate temporary gas to user
 */
router.post("/allocate", async (req: Request, res: Response) => {
  try {
    const { userAddress } = req.body;

    if (!userAddress) {
      return res.status(400).json({ error: "User address is required" });
    }

    // Check eligibility first
    const eligibleAmount = await contractService.getUserEligibility(userAddress);
    if (parseFloat(eligibleAmount) === 0) {
      return res.status(400).json({
        error: "User not eligible for gas allocation",
        message: "Complete quests to earn gas eligibility",
      });
    }

    // Allocate gas
    const allocationId = await contractService.allocateGasToUser(userAddress);

    // Store allocation in local storage
    storage.addAllocation(userAddress, {
      allocationId,
      amount: eligibleAmount,
      timestamp: new Date().toISOString(),
      status: "active",
    });

    // Add to activity feed
    storage.addActivity({
      id: storage.generateId(),
      userAddress,
      type: "gas_allocated",
      description: `Allocated ${eligibleAmount} MON gas`,
      timestamp: new Date().toISOString(),
      metadata: { allocationId, amount: eligibleAmount },
    });

    res.json({
      success: true,
      allocationId,
      amount: eligibleAmount,
      message: "Gas allocated successfully",
    });
  } catch (error: any) {
    console.error("Error allocating gas:", error);
    res.status(500).json({ error: "Failed to allocate gas", message: error.message });
  }
});

/**
 * POST /api/gas/revert
 * Revert allocated gas back to pool
 */
router.post("/revert", async (req: Request, res: Response) => {
  try {
    const { allocationId, userAddress } = req.body;

    if (!allocationId || !userAddress) {
      return res.status(400).json({ error: "Allocation ID and user address are required" });
    }

    // Note: In production, this would handle the actual revert transaction
    // For demo, we'll mark it as reverted in local storage

    storage.updateAllocation(userAddress, allocationId, {
      status: "reverted",
    });

    // Add to activity feed
    storage.addActivity({
      id: storage.generateId(),
      userAddress,
      type: "gas_reverted",
      description: "Gas returned to pool",
      timestamp: new Date().toISOString(),
      metadata: { allocationId },
    });

    res.json({
      success: true,
      message: "Gas reverted successfully",
    });
  } catch (error: any) {
    console.error("Error reverting gas:", error);
    res.status(500).json({ error: "Failed to revert gas", message: error.message });
  }
});

/**
 * GET /api/gas/pool
 * Get current gas pool balance
 */
router.get("/pool", async (req: Request, res: Response) => {
  try {
    const poolBalance = await contractService.getPoolBalance();

    res.json({
      poolBalance,
      unit: "MON",
    });
  } catch (error: any) {
    console.error("Error fetching pool balance:", error);
    res.status(500).json({ error: "Failed to fetch pool balance", message: error.message });
  }
});

/**
 * GET /api/gas/allocations/:address
 * Get user's gas allocation history
 */
router.get("/allocations/:address", async (req: Request, res: Response) => {
  try {
    const userAddress = req.params.address;
    const user = storage.getUser(userAddress);

    res.json({
      allocations: user?.allocations || [],
    });
  } catch (error: any) {
    console.error("Error fetching allocations:", error);
    res.status(500).json({ error: "Failed to fetch allocations", message: error.message });
  }
});

export default router;
