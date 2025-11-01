import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Zap, TrendingUp, Award, Flame } from "lucide-react";
import { useWeb3 } from "../context/Web3Context";
import { questsApi, gasApi } from "../lib/api";
import { UserProgress } from "../types";
import { calculateProgress, formatNumber } from "../lib/utils";

const Dashboard: React.FC = () => {
  const { account, isConnected, balance } = useWeb3();
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [gasEligibility, setGasEligibility] = useState<string>("0");
  const [poolBalance, setPoolBalance] = useState<string>("0");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (account) {
      loadDashboardData();
    }
  }, [account]);

  const loadDashboardData = async () => {
    if (!account) return;

    setLoading(true);
    try {
      const [progressData, eligibilityData, poolData] = await Promise.all([
        questsApi.getProgress(account),
        gasApi.getEligibility(account),
        gasApi.getPoolBalance(),
      ]);

      setUserProgress(progressData.progress);
      setGasEligibility(eligibilityData.eligibleAmount);
      setPoolBalance(poolData.poolBalance);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <Zap className="w-24 h-24 mx-auto text-purple-400 mb-6" />
          <h2 className="text-3xl font-bold mb-4">Welcome to MONSpark</h2>
          <p className="text-gray-400 mb-8 max-w-md">
            Connect your wallet to start earning MON Sparks and unlock gas for
            your micro transactions
          </p>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card-glow p-6 h-48 shimmer" />
        ))}
      </div>
    );
  }

  const xpProgress = userProgress
    ? calculateProgress(
        parseInt(userProgress.totalXP),
        parseInt(userProgress.totalXP) + parseInt(userProgress.xpToNextLevel)
      )
    : 0;

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          Your MONSpark Dashboard
        </h1>
        <p className="text-gray-400">
          Complete quests to earn XP and unlock MON gas for transactions
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Wallet Balance */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="card-glow p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Wallet Balance</p>
                <p className="text-2xl font-bold">{balance} MON</p>
              </div>
            </div>
          </div>
          <div className="flex items-center text-sm text-green-400">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>Available for use</span>
          </div>
        </motion.div>

        {/* Gas Eligibility */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="card-glow p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Gas Eligible</p>
                <p className="text-2xl font-bold">{gasEligibility} MON</p>
              </div>
            </div>
          </div>
          <div className="text-sm text-purple-400">
            {parseFloat(gasEligibility) > 0
              ? "Ready to claim!"
              : "Complete quests to earn"}
          </div>
        </motion.div>

        {/* Level & XP */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="card-glow p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Level</p>
                <p className="text-2xl font-bold">
                  {userProgress?.level || "0"}
                </p>
              </div>
            </div>
          </div>
          <div className="text-sm text-blue-400">
            {formatNumber(userProgress?.totalXP || "0")} Total XP
          </div>
        </motion.div>
      </div>

      {/* XP Progress Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card-glow p-6"
      >
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">Level Progress</h3>
            <span className="text-sm text-gray-400">
              {userProgress?.totalXP || "0"} /{" "}
              {parseInt(userProgress?.totalXP || "0") +
                parseInt(userProgress?.xpToNextLevel || "0")}{" "}
              XP
            </span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-4 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${xpProgress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-400 rounded-full relative"
            >
              <div className="absolute inset-0 bg-white/20 animate-shimmer" />
            </motion.div>
          </div>
          <p className="text-sm text-gray-400 mt-2">
            {userProgress?.xpToNextLevel || "0"} XP to next level
          </p>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="card-glow p-6"
        >
          <h3 className="text-lg font-semibold mb-4">Quest Stats</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Completed</span>
              <span className="text-xl font-bold text-purple-400">
                {userProgress?.completedQuests || "0"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Total XP Earned</span>
              <span className="text-xl font-bold text-blue-400">
                {formatNumber(userProgress?.totalXP || "0")}
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="card-glow p-6"
        >
          <h3 className="text-lg font-semibold mb-4">Gas Pool Stats</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Pool Balance</span>
              <span className="text-xl font-bold text-green-400">
                {poolBalance} MON
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Your Eligibility</span>
              <span className="text-xl font-bold text-purple-400">
                {gasEligibility} MON
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
