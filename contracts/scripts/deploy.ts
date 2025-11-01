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
  console.log("4️⃣  Creating initial quests...");

  const quests = [
    {
      name: "First Steps",
      description: "Connect your wallet and complete profile setup",
      xpReward: 50,
      gasReward: ethers.parseEther("0.01"),
      requiredAction: 1,
    },
    {
      name: "Social Butterfly",
      description: "Follow MONSpark on Twitter and Discord",
      xpReward: 75,
      gasReward: ethers.parseEther("0.015"),
      requiredAction: 1,
    },
    {
      name: "Transaction Master",
      description: "Complete your first microtransaction",
      xpReward: 100,
      gasReward: ethers.parseEther("0.02"),
      requiredAction: 2,
    },
    {
      name: "Game Champion",
      description: "Complete the memory matching game",
      xpReward: 150,
      gasReward: ethers.parseEther("0.03"),
      requiredAction: 3,
    },
    {
      name: "Bridge Explorer",
      description: "Bridge MON to another chain",
      xpReward: 200,
      gasReward: ethers.parseEther("0.05"),
      requiredAction: 2,
    },
  ];

  for (const quest of quests) {
    const tx = await questHub.createQuest(
      quest.name,
      quest.description,
      quest.xpReward,
      quest.gasReward,
      quest.requiredAction
    );
    await tx.wait();
    console.log(`  ✅ Created quest: "${quest.name}"`);
  }

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
