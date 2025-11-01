import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying MONSpark contracts...\n");

  const [deployer] = await ethers.getSigners();
  console.log("📍 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH\n");

  // Deploy GasManager
  console.log("1️⃣  Deploying GasManager...");
  const GasManager = await ethers.getContractFactory("GasManager");
  const gasManager = await GasManager.deploy();
  await gasManager.waitForDeployment();
  const gasManagerAddress = await gasManager.getAddress();
  console.log("✅ GasManager deployed to:", gasManagerAddress);

  // Fund the gas pool with 10 ETH (or MON in production)
  console.log("💸 Funding GasManager pool with 10 ETH...");
  const fundTx = await gasManager.fundPool({ value: ethers.parseEther("10") });
  await fundTx.wait();
  console.log("✅ Pool funded successfully\n");

  // Deploy QuestHub
  console.log("2️⃣  Deploying QuestHub...");
  const QuestHub = await ethers.getContractFactory("QuestHub");
  const questHub = await QuestHub.deploy();
  await questHub.waitForDeployment();
  const questHubAddress = await questHub.getAddress();
  console.log("✅ QuestHub deployed to:", questHubAddress);

  // Set GasManager address in QuestHub
  console.log("🔗 Linking QuestHub to GasManager...");
  const linkTx = await questHub.setGasManager(gasManagerAddress);
  await linkTx.wait();
  console.log("✅ QuestHub linked to GasManager\n");

  // Deploy BridgeManager
  console.log("3️⃣  Deploying BridgeManager...");
  const BridgeManager = await ethers.getContractFactory("BridgeManager");
  const bridgeManager = await BridgeManager.deploy();
  await bridgeManager.waitForDeployment();
  const bridgeManagerAddress = await bridgeManager.getAddress();
  console.log("✅ BridgeManager deployed to:", bridgeManagerAddress, "\n");

  // Create initial quests
  console.log("4️⃣  Creating quests...\n");

  const quests = [
    // 🎯 On-Chain Activity Quests
    {
      name: "🪙 First Spark",
      description: "Make your first on-chain transaction using x402",
      xpReward: 10,
      gasReward: ethers.parseEther("0.005"),
      requiredAction: 2,
    },
    {
      name: "🔁 Three in a Row",
      description: "Complete 3 microtransactions in one day",
      xpReward: 15,
      gasReward: ethers.parseEther("0.008"),
      requiredAction: 2,
    },
    {
      name: "💸 Fair Tipper",
      description: "Tip any verified creator using x402 at least once",
      xpReward: 8,
      gasReward: ethers.parseEther("0.004"),
      requiredAction: 2,
    },
    {
      name: "🎗️ Kind Donor",
      description: "Donate to a listed charity wallet using x402",
      xpReward: 12,
      gasReward: ethers.parseEther("0.006"),
      requiredAction: 2,
    },
    {
      name: "🛠️ Bridge Builder",
      description: "Successfully bridge your earned MON Sparks to another supported chain token",
      xpReward: 20,
      gasReward: ethers.parseEther("0.01"),
      requiredAction: 2,
    },
    {
      name: "⚡ Quick Transaction",
      description: "Complete a microtransaction under 3 seconds confirmation time",
      xpReward: 5,
      gasReward: ethers.parseEther("0.003"),
      requiredAction: 2,
    },

    // 🧩 Progression & Skill Quests
    {
      name: "🔥 Consistency Spark",
      description: "Use the platform for 3 consecutive days",
      xpReward: 10,
      gasReward: ethers.parseEther("0.005"),
      requiredAction: 1,
    },
    {
      name: "📈 Streak Master",
      description: "Maintain a 7-day streak of quest completions",
      xpReward: 25,
      gasReward: ethers.parseEther("0.012"),
      requiredAction: 1,
    },
    {
      name: "🎮 Daily Player",
      description: "Complete at least one game or quest daily",
      xpReward: 10,
      gasReward: ethers.parseEther("0.005"),
      requiredAction: 3,
    },
    {
      name: "🧠 Smart User",
      description: "Optimize 2 transactions by using x402 batching",
      xpReward: 12,
      gasReward: ethers.parseEther("0.006"),
      requiredAction: 2,
    },
    {
      name: "⛓️ Chain Explorer",
      description: "Perform transactions on 2 different networks (via bridge)",
      xpReward: 20,
      gasReward: ethers.parseEther("0.01"),
      requiredAction: 2,
    },

    // 🧱 Social & Community Quests
    {
      name: "🤝 Invite Spark",
      description: "Refer one new user who completes at least one transaction",
      xpReward: 15,
      gasReward: ethers.parseEther("0.008"),
      requiredAction: 1,
    },
    {
      name: "🗳️ Community Voice",
      description: "Vote in any on-chain poll or proposal hosted on MONSpark",
      xpReward: 10,
      gasReward: ethers.parseEther("0.005"),
      requiredAction: 1,
    },
    {
      name: "💬 Spark Contributor",
      description: "Post a helpful tip or transaction story on the community dashboard",
      xpReward: 5,
      gasReward: ethers.parseEther("0.003"),
      requiredAction: 1,
    },
    {
      name: "🎁 Spark Exchange",
      description: "Gift Sparks to another user (micro-transfer via x402)",
      xpReward: 10,
      gasReward: ethers.parseEther("0.005"),
      requiredAction: 2,
    },
    {
      name: "🌟 Featured Creator",
      description: "Become a verified creator eligible for tips",
      xpReward: 30,
      gasReward: ethers.parseEther("0.015"),
      requiredAction: 1,
    },

    // 💰 Value-Driven & Impact Quests
    {
      name: "💖 Change Maker",
      description: "Donate at least 0.001 MON worth to a verified NGO wallet",
      xpReward: 20,
      gasReward: ethers.parseEther("0.01"),
      requiredAction: 2,
    },
    {
      name: "🎨 Creator Supporter",
      description: "Tip 3 different creators",
      xpReward: 10,
      gasReward: ethers.parseEther("0.005"),
      requiredAction: 2,
    },
    {
      name: "🌍 Global Impact",
      description: "Participate in the 'World Giving Week' donation challenge",
      xpReward: 25,
      gasReward: ethers.parseEther("0.012"),
      requiredAction: 2,
    },
    {
      name: "🏫 EduSpark",
      description: "Fund any educational content or campaign (x402 payment)",
      xpReward: 15,
      gasReward: ethers.parseEther("0.008"),
      requiredAction: 2,
    },
    {
      name: "🧘 Zen Transaction",
      description: "Send an exact round-number payment (e.g., 0.0010 MON)",
      xpReward: 7,
      gasReward: ethers.parseEther("0.004"),
      requiredAction: 2,
    },

    // 🎰 Random & Game-Based Quests
    {
      name: "🎲 Lucky Roller",
      description: "Spin the daily Spark Wheel for a random bonus",
      xpReward: 15,
      gasReward: ethers.parseEther("0.008"),
      requiredAction: 3,
    },
    {
      name: "🪄 Mystery Quest",
      description: "Complete a surprise quest that appears randomly",
      xpReward: 10,
      gasReward: ethers.parseEther("0.005"),
      requiredAction: 3,
    },
    {
      name: "🕹️ Mini-Game Hero",
      description: "Play any integrated on-chain mini-game (e.g., puzzle or trivia)",
      xpReward: 15,
      gasReward: ethers.parseEther("0.008"),
      requiredAction: 3,
    },
    {
      name: "🧩 Quest Combo",
      description: "Complete 3 unique quests in a single day",
      xpReward: 20,
      gasReward: ethers.parseEther("0.01"),
      requiredAction: 1,
    },
    {
      name: "🏆 Spark Champion",
      description: "Be among the top 10 quest completers of the week",
      xpReward: 30,
      gasReward: ethers.parseEther("0.015"),
      requiredAction: 1,
    },

    // 🧱 Transaction-Level Quests
    {
      name: "⚙️ Gas Recycler",
      description: "Successfully complete a transaction where the MON gas is reverted correctly",
      xpReward: 10,
      gasReward: ethers.parseEther("0.005"),
      requiredAction: 2,
    },
    {
      name: "🔄 Efficient User",
      description: "Use exactly the required amount of MON for a transaction (no wastage)",
      xpReward: 12,
      gasReward: ethers.parseEther("0.006"),
      requiredAction: 2,
    },
    {
      name: "🧾 Record Keeper",
      description: "Execute 10 microtransactions without any failure",
      xpReward: 25,
      gasReward: ethers.parseEther("0.012"),
      requiredAction: 2,
    },
    {
      name: "💼 Portfolio Pioneer",
      description: "Hold at least 3 different token types in your wallet",
      xpReward: 10,
      gasReward: ethers.parseEther("0.005"),
      requiredAction: 1,
    },
    {
      name: "🧱 Build Together",
      description: "Join a team quest to complete a shared milestone (e.g., community donation goal)",
      xpReward: 25,
      gasReward: ethers.parseEther("0.012"),
      requiredAction: 1,
    },

    // ⚡ Ecosystem Expansion Quests
    {
      name: "🔗 Monad Citizen",
      description: "Register your wallet as a verified Monad ID",
      xpReward: 10,
      gasReward: ethers.parseEther("0.005"),
      requiredAction: 1,
    },
    {
      name: "🧩 App Connector",
      description: "Integrate MONSpark with another Monad dApp using x402 API",
      xpReward: 30,
      gasReward: ethers.parseEther("0.015"),
      requiredAction: 1,
    },
    {
      name: "💼 Developer Mode",
      description: "Deploy a custom quest using the MONSpark Quest SDK",
      xpReward: 40,
      gasReward: ethers.parseEther("0.02"),
      requiredAction: 1,
    },
    {
      name: "🌉 Bridge Booster",
      description: "Use bridge at least 5 times successfully without failure",
      xpReward: 20,
      gasReward: ethers.parseEther("0.01"),
      requiredAction: 2,
    },
  ];

  console.log(`Creating ${quests.length} quests...\n`);

  let created = 0;
  for (const quest of quests) {
    const tx = await questHub.createQuest(
      quest.name,
      quest.description,
      quest.xpReward,
      quest.gasReward,
      quest.requiredAction
    );
    await tx.wait();
    created++;
    if (created % 5 === 0) {
      console.log(`  ✅ Created ${created}/${quests.length} quests...`);
    }
  }

  console.log(`  ✅ All ${quests.length} quests created successfully!`);

  console.log("\n🎉 Deployment completed successfully!\n");

  console.log("📝 Contract Addresses:");
  console.log("━".repeat(60));
  console.log("GasManager:    ", gasManagerAddress);
  console.log("QuestHub:      ", questHubAddress);
  console.log("BridgeManager: ", bridgeManagerAddress);
  console.log("━".repeat(60));

  // Save deployment addresses to a JSON file
  const fs = require("fs");
  const deploymentInfo = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId.toString(),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      GasManager: gasManagerAddress,
      QuestHub: questHubAddress,
      BridgeManager: bridgeManagerAddress,
    },
  };

  const deploymentsDir = "../backend/src/contracts";
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  fs.writeFileSync(
    `${deploymentsDir}/deployments.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\n💾 Deployment info saved to backend/src/contracts/deployments.json");
  console.log("\n🚀 Ready to start the backend and frontend!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
