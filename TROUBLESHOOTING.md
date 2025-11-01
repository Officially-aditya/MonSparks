# 🔧 MONSpark Troubleshooting Guide

## Fixed Issues

All critical bugs have been resolved in the latest version:

### ✅ Contract Deployment Issues
- **Fixed**: OpenZeppelin v5 import paths updated
  - `security/ReentrancyGuard.sol` → `utils/ReentrancyGuard.sol`
- **Fixed**: Ownable constructor now properly initialized with `msg.sender`
- **Fixed**: Hardhat config cleaned up (removed deprecated imports)
- **Fixed**: package.json syntax errors corrected

### ✅ NPM Installation Issues
- **Fixed**: All package dependencies are now properly formatted
- **Fixed**: TypeChain version conflicts resolved
- **Fixed**: OpenZeppelin contracts moved to dependencies

## Installation & Deployment Guide

### Step 1: Clean Install (if you had errors)

```bash
# Navigate to contracts directory
cd contracts

# Remove old installations
rm -rf node_modules package-lock.json

# Install fresh
npm install
```

### Step 2: Compile Contracts

```bash
# In contracts directory
npx hardhat compile
```

**Expected output:**
```
Compiled 3 Solidity files successfully
```

### Step 3: Start Hardhat Node

```bash
# In a new terminal, in contracts directory
npx hardhat node
```

**Expected output:**
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/

Accounts
========
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
...
```

### Step 4: Deploy Contracts

```bash
# In another terminal, in contracts directory
npx hardhat run scripts/deploy.ts --network localhost
```

**Expected output:**
```
🚀 Deploying MONSpark contracts...

📍 Deploying contracts with account: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
💰 Account balance: 10000.0 ETH

1️⃣  Deploying GasManager...
✅ GasManager deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
💸 Funding GasManager pool with 10 ETH...
✅ Pool funded successfully

2️⃣  Deploying QuestHub...
✅ QuestHub deployed to: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
🔗 Linking QuestHub to GasManager...
✅ QuestHub linked to GasManager

3️⃣  Deploying BridgeManager...
✅ BridgeManager deployed to: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0

4️⃣  Creating quests...

Creating 37 quests...

  ✅ Created 5/37 quests...
  ✅ Created 10/37 quests...
  ✅ Created 15/37 quests...
  ✅ Created 20/37 quests...
  ✅ Created 25/37 quests...
  ✅ Created 30/37 quests...
  ✅ Created 35/37 quests...
  ✅ All 37 quests created successfully!

🎉 Deployment completed successfully!
```

### Step 5: Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 6: Configure Backend

```bash
# Copy environment file
cp .env.example .env
```

The default `.env` values work perfectly for local development:
```env
PORT=5000
NODE_ENV=development
RPC_URL=http://127.0.0.1:8545
CHAIN_ID=1337
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

### Step 7: Start Backend

```bash
# In backend directory
npm run dev
```

**Expected output:**
```
🔄 Initializing contract service...
✅ Contract service initialized
   GasManager: 0x5FbDB2315678afecb367f032d93F642f64180aa3
   QuestHub: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
   BridgeManager: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
✅ Services initialized successfully

============================================================
🚀 MONSpark Backend Server
============================================================
📍 Server running on: http://localhost:5000
🌍 Environment: development
🔗 RPC URL: http://127.0.0.1:8545
============================================================
```

### Step 8: Install Frontend Dependencies

```bash
cd frontend
npm install
```

### Step 9: Configure Frontend

```bash
# Copy environment file
cp .env.example .env
```

Content:
```env
VITE_API_URL=http://localhost:5000/api
```

### Step 10: Start Frontend

```bash
# In frontend directory
npm run dev
```

**Expected output:**
```
VITE v5.0.8  ready in 423 ms

➜  Local:   http://localhost:8080/
➜  Network: use --host to expose
```

## Common Errors & Solutions

### Error: "Cannot find module '@openzeppelin/contracts/security/ReentrancyGuard.sol'"

**Solution:** ✅ FIXED - Smart contracts updated to use correct import paths

If you still see this, run:
```bash
cd contracts
rm -rf node_modules package-lock.json cache artifacts
npm install
npx hardhat compile
```

### Error: "Ownable: caller is not the owner"

**Solution:** ✅ FIXED - Constructor now properly sets initial owner

The constructor is now:
```solidity
constructor() Ownable(msg.sender) {
    // initialization
}
```

### Error: "Failed to fetch quests"

**Causes:**
1. Backend not running
2. Contracts not deployed
3. Wrong RPC URL

**Solution:**
```bash
# Check backend is running
curl http://localhost:5000/health
# Should return: {"status":"healthy","timestamp":"..."}

# Check contracts are deployed
ls backend/src/contracts/deployments.json
# File should exist

# Restart backend
cd backend
npm run dev
```

### Error: "Cannot connect wallet"

**Causes:**
1. MetaMask not installed
2. Wrong network configuration
3. Hardhat node not running

**Solution:**

1. Install MetaMask browser extension
2. Add Hardhat Local network:
   - Network Name: `Hardhat Local`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `1337`
   - Currency Symbol: `ETH`

3. Import test account:
   - Private Key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`

### Error: "Quest completion failed"

**Causes:**
1. Quest already completed
2. Insufficient gas
3. Contract not linked properly

**Solution:**
```bash
# Check if quest is already completed
curl "http://localhost:5000/api/quests/1?address=YOUR_ADDRESS"

# Check gas balance
# User should have ETH in wallet

# Verify contracts are linked
# Backend logs should show contract addresses on startup
```

### Error: "Module not found" in TypeScript files

**Solution:**
```bash
# Backend
cd backend
rm -rf node_modules package-lock.json dist
npm install
npm run dev

# Frontend
cd frontend
rm -rf node_modules package-lock.json dist
npm install
npm run dev
```

### Error: Port already in use

**Backend (Port 5000):**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

**Frontend (Port 8080):**
```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:8080 | xargs kill -9
```

## Verification Steps

### 1. Verify Contracts Deployed

```bash
cat backend/src/contracts/deployments.json
```

Should show:
```json
{
  "network": "unknown",
  "chainId": "1337",
  "deployer": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  "timestamp": "...",
  "contracts": {
    "GasManager": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    "QuestHub": "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
    "BridgeManager": "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"
  }
}
```

### 2. Verify Backend Running

```bash
curl http://localhost:5000/health
```

Expected response:
```json
{"status":"healthy","timestamp":"2024-01-15T10:30:00.000Z"}
```

### 3. Verify Quests Loaded

```bash
curl http://localhost:5000/api/quests
```

Should return array of 37 quests.

### 4. Verify Frontend Accessible

Open browser: http://localhost:8080

Should see MONSpark dashboard.

## Clean Reinstall (Nuclear Option)

If all else fails:

```bash
# Stop all processes (Ctrl+C in all terminals)

# Clean everything
rm -rf contracts/node_modules contracts/package-lock.json contracts/cache contracts/artifacts
rm -rf backend/node_modules backend/package-lock.json backend/dist backend/data
rm -rf frontend/node_modules frontend/package-lock.json frontend/dist

# Reinstall
cd contracts && npm install
cd ../backend && npm install
cd ../frontend && npm install

# Redeploy from scratch
cd ../contracts
npx hardhat node  # Terminal 1
npx hardhat run scripts/deploy.ts --network localhost  # Terminal 2

cd ../backend
npm run dev  # Terminal 3

cd ../frontend
npm run dev  # Terminal 4
```

## Performance Tips

### Faster Quest Loading

The frontend loads all 37 quests. To optimize:

1. **Enable Caching**: Backend caches quest data for 5 minutes
2. **Pagination**: Load quests in batches (10 per page)
3. **Lazy Loading**: Only load quest details when category is selected

### Faster Deployment

To speed up quest creation during deployment:

1. Reduce number of quests for testing
2. Use batch creation (already implemented)
3. Deploy to mainnet only once

## Development Mode

### Hot Reload Issues

If hot reload stops working:

**Backend:**
```bash
# Kill and restart
cd backend
npm run dev
```

**Frontend:**
```bash
# Kill and restart
cd frontend
npm run dev
```

### TypeScript Errors

If TypeScript shows errors but code runs:

```bash
# Rebuild TypeScript
npm run build

# Or ignore errors temporarily (not recommended)
npm run dev -- --no-check
```

## Production Deployment

### Environment Variables

**Backend (.env):**
```env
PORT=5000
NODE_ENV=production
RPC_URL=https://your-rpc-url.com
CHAIN_ID=your-chain-id
PRIVATE_KEY=your-secure-private-key
```

**Frontend (.env):**
```env
VITE_API_URL=https://your-api-domain.com/api
```

### Build for Production

```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm run preview
```

## Support

If you encounter issues not covered here:

1. Check the logs in each terminal
2. Verify all services are running
3. Check network connectivity
4. Ensure correct Node.js version (v18+)
5. Try the clean reinstall procedure

---

**All major bugs have been fixed!** The system should now work smoothly from installation to deployment. 🎉
