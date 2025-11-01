# 🔥 MONSpark - Ignite Your Micro Assets

**Built for the Monad Hackathon**

MONSpark is a gamified on-chain platform that solves the "frozen balance" problem for micro-asset holders. Users complete quests and mini-games to earn temporary MON gas credits, enabling them to perform microtransactions without needing to buy gas separately.

## 🎯 Problem Statement

Millions of users on various blockchain networks have small crypto rewards that remain unusable because they lack native gas tokens (ETH, MON, BNB, etc.) for transactions. Buying gas for such tiny assets is often not economical, leaving these wallets inactive.

## 💡 Solution

MONSpark enables users to:
1. **Complete on-chain quests** and mini-games to earn XP and MON Spark rewards
2. **Earn temporary gas credits** based on quest completion
3. **Perform microtransactions** using temporarily allocated MON from the protocol pool
4. **Automatic gas reversion** - The gas is returned to the pool after transaction completion
5. **Bridge MON to other tokens** for cross-chain compatibility
6. **x402 micropayments** for tipping creators, charity donations, and in-game rewards

## 🏗️ Architecture

### Smart Contracts (Solidity + Hardhat)
- **GasManager.sol** - Handles temporary MON gas allocation and automatic reversion
- **QuestHub.sol** - Manages quests, user progress, XP, and rewards
- **BridgeManager.sol** - Bridges MON to target chain tokens (demo implementation)

### Backend (Express + TypeScript + Ethers.js)
- RESTful API for quest management, gas allocation, and bridging
- Event monitoring for automatic gas reversion
- JSON-based storage for user data and activity tracking

### Frontend (Vite + React + TypeScript)
- Modern, futuristic UI with Framer Motion animations
- Wallet connection via ethers.js
- Real-time dashboard showing XP, level, and gas eligibility
- Quest Center with interactive quest cards
- Bridge Panel for token conversion
- Activity Feed for transaction history

## 📁 Project Structure

```
monSpark/
├── contracts/              # Smart contracts
│   ├── GasManager.sol
│   ├── QuestHub.sol
│   ├── BridgeManager.sol
│   ├── scripts/deploy.ts
│   └── hardhat.config.ts
├── backend/                # Express backend
│   ├── src/
│   │   ├── index.ts
│   │   ├── routes/         # API routes
│   │   │   ├── quests.ts
│   │   │   ├── gas.ts
│   │   │   ├── bridge.ts
│   │   │   └── activity.ts
│   │   └── utils/          # Utilities
│   │       ├── contracts.ts
│   │       └── storage.ts
│   └── package.json
└── frontend/               # React frontend
    ├── src/
    │   ├── components/     # Reusable components
    │   ├── pages/          # Page components
    │   ├── context/        # React contexts
    │   ├── lib/            # Utilities and API
    │   └── App.tsx
    └── package.json
```

## 🚀 Quick Start

### Prerequisites

- Node.js v18+ and npm
- MetaMask or another Web3 wallet
- Git

### 1. Clone the Repository

```bash
git clone <repository-url>
cd MonSparks
```

### 2. Install Dependencies

```bash
# Install contract dependencies
cd contracts
npm install

# Install backend dependencies
cd ../backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Deploy Smart Contracts

Start a local Hardhat node in one terminal:

```bash
cd contracts
npx hardhat node
```

In another terminal, deploy the contracts:

```bash
cd contracts
npx hardhat run scripts/deploy.ts --network localhost
```

This will:
- Deploy all three contracts
- Fund the GasManager pool with 10 ETH
- Create 5 initial quests
- Save deployment addresses to `backend/src/contracts/deployments.json`

### 4. Configure Backend

Create a `.env` file in the `backend` directory:

```bash
cd backend
cp .env.example .env
```

The `.env` file should contain:

```env
PORT=5000
NODE_ENV=development
RPC_URL=http://127.0.0.1:8545
CHAIN_ID=1337
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

> **Note**: The private key shown is the default Hardhat test account #0. Never use this in production!

### 5. Start Backend Server

```bash
cd backend
npm run dev
```

The backend will start on `http://localhost:5000`

### 6. Start Frontend

```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:8080`

### 7. Connect Wallet

1. Open `http://localhost:8080` in your browser
2. Click "Connect Wallet"
3. Connect MetaMask to the Hardhat local network:
   - Network Name: Hardhat Local
   - RPC URL: http://127.0.0.1:8545
   - Chain ID: 1337
   - Currency Symbol: ETH

Import a test account to MetaMask using one of the private keys displayed when you started the Hardhat node.

## 🎮 Using MONSpark

### Complete Quests

1. Navigate to the **Quest Center**
2. View available quests with their XP and gas rewards
3. Click "Complete Quest" to claim rewards
4. Watch your XP and level progress increase

### Allocate Gas

1. Complete quests to earn gas eligibility
2. On the **Dashboard**, check your "Gas Eligible" amount
3. Use the backend API to allocate gas when needed:

```bash
curl -X POST http://localhost:5000/api/gas/allocate \
  -H "Content-Type: application/json" \
  -d '{"userAddress": "YOUR_WALLET_ADDRESS"}'
```

### Bridge Tokens

1. Navigate to the **Bridge Panel**
2. Enter the amount of MON to bridge
3. Select target chain and token
4. Review the conversion rate and fees
5. Click "Bridge Tokens"

### Track Activity

1. Navigate to the **Activity Feed**
2. View your personal activity or switch to global feed
3. See quest completions, gas allocations, and transactions

## 🔌 API Endpoints

### Quests
- `GET /api/quests` - List all quests
- `GET /api/quests/:id` - Get quest details
- `POST /api/quests/:id/complete` - Complete a quest
- `GET /api/quests/progress/:address` - Get user progress

### Gas
- `GET /api/gas/eligibility/:address` - Check gas eligibility
- `POST /api/gas/allocate` - Allocate temporary gas
- `POST /api/gas/revert` - Revert gas to pool
- `GET /api/gas/pool` - Get pool balance
- `GET /api/gas/allocations/:address` - Get allocation history

### Bridge
- `POST /api/bridge/calculate` - Calculate bridge output
- `POST /api/bridge/initiate` - Initiate bridge request
- `GET /api/bridge/request/:requestId` - Get request details
- `GET /api/bridge/supported` - Get supported chains/tokens

### Activity
- `GET /api/activity` - Get global activity feed
- `GET /api/activity/:address` - Get user activity

## 🎨 Tech Stack

### Blockchain
- Solidity 0.8.20
- Hardhat
- OpenZeppelin Contracts
- Ethers.js v6

### Backend
- Node.js + TypeScript
- Express.js
- CORS, Helmet, Morgan

### Frontend
- React 18
- TypeScript
- Vite
- TailwindCSS
- Framer Motion (animations)
- Lucide React (icons)
- React Router

## 🔐 Security Considerations

### Implemented
- ReentrancyGuard on critical contract functions
- Access control with Ownable pattern
- Input validation on all endpoints
- Gas allocation timeout mechanism

### For Production
- Implement proper authentication/authorization
- Add rate limiting
- Use a proper database instead of JSON files
- Implement comprehensive event monitoring
- Add multi-signature wallet for pool management
- Conduct security audits

## 🌟 x402 Integration

MONSpark integrates with x402 for seamless micropayments:

- **Creator Tips**: Tip content creators using your earned gas
- **Charity Donations**: Donate small amounts to verified causes
- **In-Game Rewards**: Earn and spend micro-rewards in games
- **Automatic Gas Management**: x402 transactions trigger gas verification flow

## 📝 Future Enhancements

- [ ] NFT-based achievement system
- [ ] Social features (leaderboards, friends)
- [ ] More quest types (DeFi interactions, social tasks)
- [ ] Mobile app
- [ ] Multi-chain support
- [ ] Governance token for MONSpark DAO
- [ ] Advanced bridge with real cross-chain messaging
- [ ] Integration with more x402 use cases

## 🤝 Contributing

This is a hackathon project, but contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 👥 Team

Built with ⚡ for the Monad Hackathon

## 🔗 Links

- [Monad](https://monad.xyz/)
- [x402](https://x402.org/)
- [Hardhat](https://hardhat.org/)
- [Ethers.js](https://docs.ethers.org/)

---

**Happy Sparking! 🔥**
