import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity as ActivityIcon,
  Trophy,
  Zap,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import { useWeb3 } from "../context/Web3Context";
import { activityApi } from "../lib/api";
import { Activity } from "../types";
import { timeAgo } from "../lib/utils";

const ActivityFeed: React.FC = () => {
  const { account, isConnected } = useWeb3();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGlobal, setShowGlobal] = useState(false);

  useEffect(() => {
    loadActivities();
  }, [account, showGlobal]);

  const loadActivities = async () => {
    setLoading(true);
    try {
      const data = showGlobal
        ? await activityApi.getAll(50)
        : account
        ? await activityApi.getByUser(account, 50)
        : await activityApi.getAll(50);

      setActivities(data.activities);
    } catch (error) {
      console.error("Error loading activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "quest_completed":
        return Trophy;
      case "gas_allocated":
      case "gas_reverted":
        return Zap;
      case "level_up":
        return TrendingUp;
      case "transaction":
        return ArrowUpRight;
      default:
        return ActivityIcon;
    }
  };

  const getActivityColor = (type: Activity["type"]) => {
    switch (type) {
      case "quest_completed":
        return "from-yellow-500 to-orange-500";
      case "gas_allocated":
        return "from-purple-500 to-pink-500";
      case "gas_reverted":
        return "from-blue-500 to-cyan-500";
      case "level_up":
        return "from-green-500 to-emerald-500";
      case "transaction":
        return "from-indigo-500 to-purple-500";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  if (!isConnected && !showGlobal) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <ActivityIcon className="w-24 h-24 text-purple-400 mb-6" />
        <h2 className="text-3xl font-bold mb-4">Activity Feed</h2>
        <p className="text-gray-400 mb-4">
          Connect your wallet to view your activity
        </p>
        <button
          onClick={() => setShowGlobal(true)}
          className="btn-secondary"
        >
          View Global Activity
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="card-glow p-4 h-24 shimmer" />
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
          Activity Feed
        </h1>
        <p className="text-gray-400">
          {showGlobal ? "Global platform activity" : "Your recent activity"}
        </p>
      </motion.div>

      {/* Toggle */}
      {isConnected && (
        <div className="flex justify-center">
          <div className="inline-flex bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setShowGlobal(false)}
              className={`px-6 py-2 rounded-lg transition-all ${
                !showGlobal
                  ? "bg-purple-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              My Activity
            </button>
            <button
              onClick={() => setShowGlobal(true)}
              className={`px-6 py-2 rounded-lg transition-all ${
                showGlobal
                  ? "bg-purple-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Global
            </button>
          </div>
        </div>
      )}

      {/* Activity List */}
      <div className="space-y-4">
        {activities.map((activity, index) => {
          const Icon = getActivityIcon(activity.type);
          const colorGradient = getActivityColor(activity.type);

          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="card-glow p-4 flex items-center space-x-4"
            >
              {/* Icon */}
              <div
                className={`w-12 h-12 bg-gradient-to-br ${colorGradient} rounded-xl flex items-center justify-center flex-shrink-0`}
              >
                <Icon className="w-6 h-6" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">
                  {activity.description}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-sm text-gray-400">
                    {timeAgo(activity.timestamp)}
                  </span>
                  {showGlobal && (
                    <>
                      <span className="text-gray-600">•</span>
                      <span className="text-sm text-gray-500 truncate">
                        {activity.userAddress.substring(0, 6)}...
                        {activity.userAddress.substring(38)}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Metadata */}
              {activity.metadata && (
                <div className="text-right flex-shrink-0">
                  {activity.metadata.xpEarned && (
                    <div className="text-blue-400 font-semibold text-sm">
                      +{activity.metadata.xpEarned} XP
                    </div>
                  )}
                  {activity.metadata.amount && (
                    <div className="text-purple-400 font-semibold text-sm">
                      {activity.metadata.amount} MON
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {activities.length === 0 && (
        <div className="text-center py-16">
          <ActivityIcon className="w-24 h-24 mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400">
            {showGlobal
              ? "No global activity yet"
              : "No activity yet. Complete quests to get started!"}
          </p>
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;
