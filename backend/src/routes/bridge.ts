import { Router, Request, Response } from "express";
import ContractService from "../utils/contracts";
import storage from "../utils/storage";

const router = Router();
let contractService: ContractService;

// Initialize contract service
export const initBridgeRoute = (cs: ContractService) => {
  contractService = cs;
};

/**
 * POST /api/bridge/calculate
 * Calculate bridge output amount
 */
router.post("/calculate", async (req: Request, res: Response) => {
  try {
    const { inputAmount, targetToken } = req.body;

    if (!inputAmount || !targetToken) {
      return res.status(400).json({ error: "Input amount and target token are required" });
    }

    const result = await contractService.calculateBridgeOutput(inputAmount, targetToken);

    res.json({
      inputAmount,
      targetToken,
      ...result,
    });
  } catch (error: any) {
    console.error("Error calculating bridge output:", error);
    res.status(500).json({ error: "Failed to calculate output", message: error.message });
  }
});

/**
 * POST /api/bridge/initiate
 * Initiate a bridge request
 */
router.post("/initiate", async (req: Request, res: Response) => {
  try {
    const { userAddress, amount, targetChain, targetToken } = req.body;

    if (!userAddress || !amount || !targetChain || !targetToken) {
      return res.status(400).json({
        error: "User address, amount, target chain, and target token are required",
      });
    }

    // For demo purposes, we'll simulate the bridge request
    const requestId = storage.generateId();

    // Store transaction
    storage.addTransaction(userAddress, {
      id: requestId,
      type: "bridge",
      amount,
      timestamp: new Date().toISOString(),
      status: "pending",
    });

    // Add to activity feed
    storage.addActivity({
      id: storage.generateId(),
      userAddress,
      type: "transaction",
      description: `Bridge initiated: ${amount} MON → ${targetToken}`,
      timestamp: new Date().toISOString(),
      metadata: { requestId, targetChain, targetToken },
    });

    res.json({
      success: true,
      requestId,
      message: "Bridge request initiated",
      estimatedTime: "2-5 minutes",
    });
  } catch (error: any) {
    console.error("Error initiating bridge:", error);
    res.status(500).json({ error: "Failed to initiate bridge", message: error.message });
  }
});

/**
 * POST /api/bridge/complete
 * Complete a bridge request (admin/automated)
 */
router.post("/complete", async (req: Request, res: Response) => {
  try {
    const { requestId } = req.body;

    if (!requestId) {
      return res.status(400).json({ error: "Request ID is required" });
    }

    // In production, this would be called by a relayer/backend service
    const result = await contractService.completeBridgeRequest(requestId);

    res.json({
      success: true,
      txHash: result.txHash,
      message: "Bridge completed successfully",
    });
  } catch (error: any) {
    console.error("Error completing bridge:", error);
    res.status(500).json({ error: "Failed to complete bridge", message: error.message });
  }
});

/**
 * GET /api/bridge/request/:requestId
 * Get bridge request details
 */
router.get("/request/:requestId", async (req: Request, res: Response) => {
  try {
    const { requestId } = req.params;

    // Try to get from contract first
    try {
      const request = await contractService.getBridgeRequest(requestId);
      return res.json({ request });
    } catch {
      // If not found on-chain, check local storage
      const allUsers = storage.getAllUsers();
      for (const userAddress in allUsers) {
        const user = allUsers[userAddress];
        const transaction = user.transactions.find((tx) => tx.id === requestId);
        if (transaction) {
          return res.json({ request: transaction });
        }
      }
      throw new Error("Bridge request not found");
    }
  } catch (error: any) {
    console.error("Error fetching bridge request:", error);
    res.status(404).json({ error: "Bridge request not found", message: error.message });
  }
});

/**
 * GET /api/bridge/supported
 * Get supported chains and tokens
 */
router.get("/supported", async (req: Request, res: Response) => {
  try {
    const supported = {
      chains: [
        { name: "Ethereum", chainId: 1, icon: "eth" },
        { name: "Polygon", chainId: 137, icon: "matic" },
        { name: "BSC", chainId: 56, icon: "bnb" },
        { name: "Arbitrum", chainId: 42161, icon: "arb" },
        { name: "Optimism", chainId: 10, icon: "op" },
      ],
      tokens: [
        { symbol: "ETH", name: "Ethereum", decimals: 18 },
        { symbol: "MATIC", name: "Polygon", decimals: 18 },
        { symbol: "BNB", name: "BNB", decimals: 18 },
        { symbol: "USDC", name: "USD Coin", decimals: 6 },
        { symbol: "USDT", name: "Tether", decimals: 6 },
      ],
    };

    res.json(supported);
  } catch (error: any) {
    console.error("Error fetching supported chains:", error);
    res.status(500).json({ error: "Failed to fetch supported chains", message: error.message });
  }
});

export default router;
