# 🚀 MONSpark Quick Start Guide

Get MONSpark up and running in 5 minutes!

## Prerequisites

- Node.js v18+ installed
- MetaMask browser extension
- Terminal/Command Prompt

## Step 1: Install Dependencies (2 min)

Open your terminal in the project root and run:

```bash
npm run install:all
```

This will install all dependencies for contracts, backend, and frontend.

## Step 2: Start Hardhat Node (1 terminal)

Open a new terminal window and run:

```bash
npm run node
```

Keep this terminal running. You'll see 20 test accounts with private keys.

**Important**: Copy one of the private keys - you'll need it to import into MetaMask!

## Step 3: Deploy Contracts (new terminal)

Open another terminal window and run:

```bash
npm run deploy
```

This will:
- Deploy GasManager, QuestHub, and BridgeManager contracts
- Fund the gas pool with 10 ETH
- Create 5 initial quests
- Save deployment info to `backend/src/contracts/deployments.json`

## Step 4: Configure Backend

```bash
cd backend
cp .env.example .env
```

The default `.env` values work for local development!

## Step 5: Configure Frontend

```bash
cd frontend
cp .env.example .env
```

Again, defaults work fine!

## Step 6: Start Backend & Frontend (2 terminals)

### Terminal 3 - Backend:
```bash
npm run backend
```

Backend will start on `http://localhost:5000`

### Terminal 4 - Frontend:
```bash
npm run frontend
```

Frontend will start on `http://localhost:8080`

**OR** use one terminal with:
```bash
npm run dev
```

## Step 7: Connect MetaMask

1. Open MetaMask
2. Click the network dropdown → "Add Network" → "Add a network manually"
3. Enter these details:
   - **Network Name**: Hardhat Local
   - **RPC URL**: http://127.0.0.1:8545
   - **Chain ID**: 1337
   - **Currency Symbol**: ETH

4. Import a test account:
   - Click your account icon → "Import Account"
   - Paste one of the private keys from Step 2
   - Default first account key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`

## Step 8: Use MONSpark! 🎉

1. Open `http://localhost:8080` in your browser
2. Click "Connect Wallet"
3. Approve the MetaMask connection
4. Start completing quests!

## 🎮 What to Try

### Complete Your First Quest
1. Go to **Quest Center**
2. Click "Complete Quest" on any quest
3. Watch your XP increase on the **Dashboard**

### Check Your Progress
1. Visit the **Dashboard**
2. See your XP, level, and gas eligibility
3. Track your quest completion stats

### Bridge Tokens
1. Navigate to **Bridge Panel**
2. Enter amount and select target token
3. See the conversion calculation

### View Activity
1. Check the **Activity Feed**
2. See all your completed quests and transactions
3. Toggle between personal and global activity

## 🐛 Troubleshooting

### "Failed to fetch quests"
- Make sure backend is running on port 5000
- Check that contracts are deployed

### "Cannot connect wallet"
- Verify MetaMask is installed
- Check network is set to Hardhat Local (Chain ID 1337)
- Confirm RPC URL is http://127.0.0.1:8545

### "Quest completion failed"
- Ensure you have ETH in your wallet (test accounts start with 10,000 ETH)
- Check backend logs for errors
- Verify contract deployment was successful

### Port already in use
- Frontend: Change port in `frontend/vite.config.ts`
- Backend: Change PORT in `backend/.env`

## 📂 Running Processes

You should have these terminals running:

1. **Hardhat Node** - `npm run node`
2. **Backend** - `npm run backend`
3. **Frontend** - `npm run frontend`

## 🎯 Next Steps

- Complete all quests to reach Level 5
- Experiment with the bridge feature
- Check out the Activity Feed
- Explore the smart contract code in `contracts/`

## 💡 Tips

- The first test account has unlimited ETH for gas fees
- Quests can only be completed once per account
- Gas eligibility increases with each quest completed
- All data resets when you restart the Hardhat node

---

**Need help?** Check the full README.md for detailed documentation.

**Happy Sparking! 🔥**
