import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";

// Import routes
import questsRouter, { initQuestsRoute } from "./routes/quests";
import gasRouter, { initGasRoute } from "./routes/gas";
import bridgeRouter, { initBridgeRoute } from "./routes/bridge";
import activityRouter from "./routes/activity";

// Import utilities
import ContractService from "./utils/contracts";

// Load environment variables
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:8080",
  credentials: true,
}));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize contract service
let contractService: ContractService;

// Health check endpoint
app.get("/", (req: Request, res: Response) => {
  res.json({
    name: "MONSpark Backend API",
    version: "1.0.0",
    status: "running",
    endpoints: {
      quests: "/api/quests",
      gas: "/api/gas",
      bridge: "/api/bridge",
      activity: "/api/activity",
    },
  });
});

app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Initialize contract service and routes
const initializeServices = async () => {
  try {
    console.log("🔄 Initializing contract service...");
    contractService = new ContractService();

    // Initialize routes with contract service
    initQuestsRoute(contractService);
    initGasRoute(contractService);
    initBridgeRoute(contractService);

    // Mount routes
    app.use("/api/quests", questsRouter);
    app.use("/api/gas", gasRouter);
    app.use("/api/bridge", bridgeRouter);
    app.use("/api/activity", activityRouter);

    console.log("✅ Services initialized successfully");
  } catch (error) {
    console.error("❌ Failed to initialize services:", error);
    process.exit(1);
  }
};

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: err.message,
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: "Not found",
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Start server
const startServer = async () => {
  try {
    await initializeServices();

    app.listen(PORT, () => {
      console.log("\n" + "=".repeat(60));
      console.log("🚀 MONSpark Backend Server");
      console.log("=".repeat(60));
      console.log(`📍 Server running on: http://localhost:${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`🔗 RPC URL: ${process.env.RPC_URL || "http://127.0.0.1:8545"}`);
      console.log("=".repeat(60));
      console.log("\n📋 Available endpoints:");
      console.log(`   GET    /                        - API info`);
      console.log(`   GET    /health                  - Health check`);
      console.log(`   GET    /api/quests              - List all quests`);
      console.log(`   GET    /api/quests/:id          - Get quest details`);
      console.log(`   POST   /api/quests/:id/complete - Complete a quest`);
      console.log(`   GET    /api/quests/progress/:address - User progress`);
      console.log(`   GET    /api/gas/eligibility/:address - Check eligibility`);
      console.log(`   POST   /api/gas/allocate        - Allocate gas`);
      console.log(`   POST   /api/gas/revert          - Revert gas`);
      console.log(`   GET    /api/gas/pool            - Pool balance`);
      console.log(`   POST   /api/bridge/calculate    - Calculate bridge output`);
      console.log(`   POST   /api/bridge/initiate     - Initiate bridge`);
      console.log(`   GET    /api/bridge/supported    - Supported chains`);
      console.log(`   GET    /api/activity            - Global activity feed`);
      console.log(`   GET    /api/activity/:address   - User activity feed`);
      console.log("=".repeat(60) + "\n");
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n👋 Shutting down gracefully...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n👋 Shutting down gracefully...");
  process.exit(0);
});
