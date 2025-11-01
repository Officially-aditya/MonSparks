import * as fs from "fs";
import * as path from "path";

const DATA_DIR = path.join(__dirname, "../../data");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export interface UserData {
  address: string;
  questProgress: { [questId: number]: boolean };
  transactions: Transaction[];
  allocations: GasAllocation[];
  createdAt: string;
  lastActive: string;
}

export interface Transaction {
  id: string;
  type: "tip" | "donation" | "transfer" | "bridge";
  amount: string;
  to?: string;
  from?: string;
  timestamp: string;
  status: "pending" | "completed" | "failed";
  txHash?: string;
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

class Storage {
  private usersFile = path.join(DATA_DIR, "users.json");
  private activitiesFile = path.join(DATA_DIR, "activities.json");

  constructor() {
    this.initializeFiles();
  }

  private initializeFiles() {
    if (!fs.existsSync(this.usersFile)) {
      fs.writeFileSync(this.usersFile, JSON.stringify({}, null, 2));
    }
    if (!fs.existsSync(this.activitiesFile)) {
      fs.writeFileSync(this.activitiesFile, JSON.stringify([], null, 2));
    }
  }

  // User methods
  getUser(address: string): UserData | null {
    const users = this.getAllUsers();
    return users[address.toLowerCase()] || null;
  }

  createUser(address: string): UserData {
    const users = this.getAllUsers();
    const lowerAddress = address.toLowerCase();

    if (users[lowerAddress]) {
      return users[lowerAddress];
    }

    const newUser: UserData = {
      address: lowerAddress,
      questProgress: {},
      transactions: [],
      allocations: [],
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
    };

    users[lowerAddress] = newUser;
    this.saveUsers(users);
    return newUser;
  }

  updateUser(address: string, updates: Partial<UserData>): UserData {
    const users = this.getAllUsers();
    const lowerAddress = address.toLowerCase();

    if (!users[lowerAddress]) {
      users[lowerAddress] = this.createUser(address);
    }

    users[lowerAddress] = {
      ...users[lowerAddress],
      ...updates,
      lastActive: new Date().toISOString(),
    };

    this.saveUsers(users);
    return users[lowerAddress];
  }

  getAllUsers(): { [address: string]: UserData } {
    try {
      const data = fs.readFileSync(this.usersFile, "utf-8");
      return JSON.parse(data);
    } catch {
      return {};
    }
  }

  private saveUsers(users: { [address: string]: UserData }) {
    fs.writeFileSync(this.usersFile, JSON.stringify(users, null, 2));
  }

  // Quest progress methods
  markQuestCompleted(address: string, questId: number) {
    const user = this.getUser(address) || this.createUser(address);
    user.questProgress[questId] = true;
    this.updateUser(address, user);
  }

  hasCompletedQuest(address: string, questId: number): boolean {
    const user = this.getUser(address);
    return user?.questProgress[questId] || false;
  }

  // Transaction methods
  addTransaction(address: string, transaction: Transaction) {
    const user = this.getUser(address) || this.createUser(address);
    user.transactions.push(transaction);
    this.updateUser(address, user);
  }

  getTransactions(address: string): Transaction[] {
    const user = this.getUser(address);
    return user?.transactions || [];
  }

  updateTransaction(address: string, transactionId: string, updates: Partial<Transaction>) {
    const user = this.getUser(address);
    if (!user) return;

    const txIndex = user.transactions.findIndex((tx) => tx.id === transactionId);
    if (txIndex !== -1) {
      user.transactions[txIndex] = {
        ...user.transactions[txIndex],
        ...updates,
      };
      this.updateUser(address, user);
    }
  }

  // Gas allocation methods
  addAllocation(address: string, allocation: GasAllocation) {
    const user = this.getUser(address) || this.createUser(address);
    user.allocations.push(allocation);
    this.updateUser(address, user);
  }

  updateAllocation(address: string, allocationId: string, updates: Partial<GasAllocation>) {
    const user = this.getUser(address);
    if (!user) return;

    const allocationIndex = user.allocations.findIndex(
      (alloc) => alloc.allocationId === allocationId
    );
    if (allocationIndex !== -1) {
      user.allocations[allocationIndex] = {
        ...user.allocations[allocationIndex],
        ...updates,
      };
      this.updateUser(address, user);
    }
  }

  // Activity feed methods
  addActivity(activity: Activity) {
    const activities = this.getAllActivities();
    activities.unshift(activity); // Add to beginning
    // Keep only last 100 activities
    if (activities.length > 100) {
      activities.splice(100);
    }
    this.saveActivities(activities);
  }

  getAllActivities(): Activity[] {
    try {
      const data = fs.readFileSync(this.activitiesFile, "utf-8");
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  getUserActivities(address: string, limit: number = 20): Activity[] {
    const activities = this.getAllActivities();
    return activities
      .filter((activity) => activity.userAddress.toLowerCase() === address.toLowerCase())
      .slice(0, limit);
  }

  private saveActivities(activities: Activity[]) {
    fs.writeFileSync(this.activitiesFile, JSON.stringify(activities, null, 2));
  }

  // Utility methods
  generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default new Storage();
