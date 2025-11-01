import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  CheckCircle,
  Zap,
  Users,
  GamepadIcon,
  ArrowRight,
} from "lucide-react";
import { useWeb3 } from "../context/Web3Context";
import { questsApi } from "../lib/api";
import { Quest } from "../types";
import { formatNumber } from "../lib/utils";

const QuestCenter: React.FC = () => {
  const { account, isConnected } = useWeb3();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState<number | null>(null);

  useEffect(() => {
    loadQuests();
  }, [account]);

  //error
  const loadQuests = async () => {
    setLoading(true);
    try {
      const data = await questsApi.getAll(account ?? undefined);
      setQuests(data.quests);
    } catch (error) {
      console.error("Error loading quests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteQuest = async (questId: number) => {
    if (!account || completing) return;

    setCompleting(questId);
    try {
      await questsApi.complete(questId, account);
      // Reload quests to update completion status
      await loadQuests();
      alert("Quest completed! Rewards claimed.");
    } catch (error: any) {
      console.error("Error completing quest:", error);
      alert(error.response?.data?.error || "Failed to complete quest");
    } finally {
      setCompleting(null);
    }
  };

  const getQuestIcon = (requiredAction: number) => {
    switch (requiredAction) {
      case 1:
        return Users;
      case 2:
        return Zap;
      case 3:
        return GamepadIcon;
      default:
        return Trophy;
    }
  };

  const getQuestColor = (requiredAction: number) => {
    switch (requiredAction) {
      case 1:
        return "from-blue-500 to-cyan-500";
      case 2:
        return "from-purple-500 to-pink-500";
      case 3:
        return "from-orange-500 to-red-500";
      default:
        return "from-green-500 to-emerald-500";
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Trophy className="w-24 h-24 text-purple-400 mb-6" />
        <h2 className="text-3xl font-bold mb-4">Quest Center</h2>
        <p className="text-gray-400">Connect your wallet to view quests</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="card-glow p-6 h-64 shimmer" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          Quest Center
        </h1>
        <p className="text-gray-400">
          Complete quests to earn XP and MON gas eligibility
        </p>
      </motion.div>

      {/* Quests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quests.map((quest, index) => {
          const QuestIcon = getQuestIcon(parseInt(quest.completionCount) % 3 + 1);
          const colorGradient = getQuestColor(
            parseInt(quest.completionCount) % 3 + 1
          );

          return (
            <motion.div
              key={quest.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className={`card-glow p-6 relative overflow-hidden ${
                quest.completed ? "opacity-75" : ""
              }`}
            >
              {/* Background Gradient */}
              <div
                className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colorGradient} opacity-10 rounded-full blur-3xl`}
              />

              {/* Completion Badge */}
              {quest.completed && (
                <div className="absolute top-4 right-4">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              )}

              {/* Quest Icon */}
              <div
                className={`w-16 h-16 bg-gradient-to-br ${colorGradient} rounded-xl flex items-center justify-center mb-4 relative`}
              >
                <QuestIcon className="w-8 h-8" />
                {!quest.completed && (
                  <div className="absolute inset-0 bg-white/20 animate-pulse rounded-xl" />
                )}
              </div>

              {/* Quest Info */}
              <h3 className="text-xl font-bold mb-2">{quest.name}</h3>
              <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                {quest.description}
              </p>

              {/* Rewards */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">XP Reward</span>
                  <span className="text-blue-400 font-semibold">
                    +{formatNumber(quest.xpReward)} XP
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Gas Reward</span>
                  <span className="text-purple-400 font-semibold">
                    {quest.gasReward} MON
                  </span>
                </div>
              </div>

              {/* Completion Count */}
              <div className="text-xs text-gray-500 mb-4">
                {quest.completionCount} completions
              </div>

              {/* Action Button */}
              {quest.completed ? (
                <div className="flex items-center justify-center py-3 bg-green-500/20 rounded-lg text-green-400 font-semibold">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Completed
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleCompleteQuest(quest.id)}
                  disabled={completing === quest.id}
                  className={`w-full btn-primary flex items-center justify-center ${
                    completing === quest.id ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {completing === quest.id ? (
                    <span>Completing...</span>
                  ) : (
                    <>
                      <span>Complete Quest</span>
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </motion.button>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {quests.length === 0 && (
        <div className="text-center py-16">
          <Trophy className="w-24 h-24 mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400">No quests available at the moment</p>
        </div>
      )}
    </div>
  );
};

export default QuestCenter;
