export interface Quest {
  id: number;
  name: string;
  description: string;
  xpReward: string;
  gasReward: string;
  isActive: boolean;
  completionCount: string;
  completed?: boolean;
}

export interface UserProgress {
  totalXP: string;
  completedQuests: string;
  level: string;
  xpToNextLevel: string;
  questsCompleted?: { [key: number]: boolean };
}

export interface GasAllocation {
  allocationId: string;
  amount: string;
  timestamp: string;
  status: "active" | "reverted";
  transactionId?: string;
}

export interface Activity {
  id: string;
  userAddress: string;
  type: "quest_completed" | "gas_allocated" | "gas_reverted" | "transaction" | "level_up";
  description: string;
  timestamp: string;
  metadata?: any;
}

export interface BridgeRequest {
  requestId: string;
  userAddress: string;
  amount: string;
  targetChain: string;
  targetToken: string;
  timestamp: string;
  status: "pending" | "completed" | "failed";
}

export interface SupportedChain {
  name: string;
  chainId: number;
  icon: string;
}

export interface SupportedToken {
  symbol: string;
  name: string;
  decimals: number;
}
