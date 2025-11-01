import { Router, Request, Response } from "express";
import storage from "../utils/storage";

const router = Router();

/**
 * GET /api/activity
 * Get global activity feed
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const activities = storage.getAllActivities().slice(0, limit);

    res.json({ activities });
  } catch (error: any) {
    console.error("Error fetching activities:", error);
    res.status(500).json({ error: "Failed to fetch activities", message: error.message });
  }
});

/**
 * GET /api/activity/:address
 * Get user-specific activity feed
 */
router.get("/:address", async (req: Request, res: Response) => {
  try {
    const userAddress = req.params.address;
    const limit = parseInt(req.query.limit as string) || 20;

    const activities = storage.getUserActivities(userAddress, limit);

    res.json({ activities });
  } catch (error: any) {
    console.error("Error fetching user activities:", error);
    res.status(500).json({ error: "Failed to fetch activities", message: error.message });
  }
});

export default router;
