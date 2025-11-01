import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target,
  Book,
  Puzzle,
  Code,
  Rocket,
  Award,
  Clock,
  Zap,
  Play,
} from "lucide-react";
import { useWeb3 } from "../context/Web3Context";
import MiniGames from "../components/MiniGames";
import missions from "../data/missions";

interface Mission {
  id: number;
  title: string;
  description: string;
  type: "game" | "study" | "code" | "explore";
  difficulty: "easy" | "medium" | "hard";
  xpReward: number;
  timeEstimate: string;
  gameType?: "trivia" | "puzzle" | "memory" | "blockchain-quiz";
  completed: boolean;
}

const Missions: React.FC = () => {
  const { isConnected } = useWeb3();
  const [activeMission, setActiveMission] = useState<Mission | null>(null);
  const [showMiniGame, setShowMiniGame] = useState(false);
  // keep missions in local state so UI updates when a mission is completed
  const [missionList, setMissionList] = useState<Mission[]>(missions);

  // using shared missions list from data/missions

  const handleStartMission = (mission: Mission) => {
    setActiveMission(mission);
    if (mission.gameType) {
      setShowMiniGame(true);
    }
  };

  const handleMissionComplete = (success: boolean, _score?: number) => {
    if (success && activeMission) {
      // Mark mission as completed in local state (demo)
      setMissionList((prev) =>
        prev.map((m) => (m.id === activeMission.id ? { ...m, completed: true } : m))
      );
      alert(`Mission Complete! +${activeMission.xpReward} XP`);
      // Notify other parts of the app (dashboard/progress) that a mission was completed
      try {
        window.dispatchEvent(
          new CustomEvent("mission:completed", {
            detail: { missionId: activeMission.id, xp: activeMission.xpReward },
          })
        );
      } catch (e) {
        // ignore if CustomEvent not supported
      }
      // Persist completion locally so other pages (dashboard) can pick it up
      try {
        const KEY = "monspark.completedMissions";
        const existing = JSON.parse(localStorage.getItem(KEY) || "[]");
        existing.push({ missionId: activeMission.id, xp: activeMission.xpReward, ts: Date.now() });
        localStorage.setItem(KEY, JSON.stringify(existing));
      } catch (e) {
        // ignore storage errors
      }
    }
    setShowMiniGame(false);
    setActiveMission(null);
  };

  const getMissionIcon = (type: string) => {
    switch (type) {
      case "game":
        return Puzzle;
      case "study":
        return Book;
      case "code":
        return Code;
      case "explore":
        return Rocket;
      default:
        return Target;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "text-green-400 bg-green-400/10";
      case "medium":
        return "text-yellow-400 bg-yellow-400/10";
      case "hard":
        return "text-red-400 bg-red-400/10";
      default:
        return "text-gray-400 bg-gray-400/10";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "game":
        return "from-purple-500 to-pink-500";
      case "study":
        return "from-blue-500 to-cyan-500";
      case "code":
        return "from-orange-500 to-red-500";
      case "explore":
        return "from-green-500 to-emerald-500";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Target className="w-24 h-24 text-purple-400 mb-6" />
        <h2 className="text-3xl font-bold mb-4">Missions</h2>
        <p className="text-gray-400">Connect your wallet to start missions</p>
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
          Interactive Missions
        </h1>
        <p className="text-gray-400">
          Complete challenges, learn about Monad, and earn XP through gamified missions
        </p>
      </motion.div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            label: "Completed",
            value: missionList.filter((m) => m.completed).length,
            total: missionList.length,
            icon: Award,
          },
          {
            label: "Total XP Available",
            value: missionList.reduce((sum, m) => sum + m.xpReward, 0),
            icon: Zap,
          },
          {
            label: "Active Missions",
            value: missionList.filter((m) => !m.completed).length,
            icon: Target,
          },
          {
            label: "Completion Rate",
            value: `${Math.round(
              (missionList.filter((m) => m.completed).length / missionList.length) * 100
            )}%`,
            icon: Target,
          },
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card-glow p-4"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">{stat.label}</p>
                <p className="text-xl font-bold">
                  {stat.value}
                  {stat.total && (
                    <span className="text-sm text-gray-400">/{stat.total}</span>
                  )}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Missions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {missionList.map((mission, index) => {
          const Icon = getMissionIcon(mission.type);
          const typeColor = getTypeColor(mission.type);

          return (
            <motion.div
              key={mission.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -5 }}
              className={`card-glow p-6 relative overflow-hidden ${
                mission.completed ? "opacity-75" : ""
              }`}
            >
              {/* Background Gradient */}
              <div
                className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${typeColor} opacity-10 rounded-full blur-3xl`}
              />

              {/* Mission Icon */}
              <div
                className={`w-16 h-16 bg-gradient-to-br ${typeColor} rounded-xl flex items-center justify-center mb-4 relative`}
              >
                <Icon className="w-8 h-8" />
              </div>

              {/* Mission Info */}
              <h3 className="text-lg font-bold mb-2">{mission.title}</h3>
              <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                {mission.description}
              </p>

              {/* Meta Info */}
              <div className="flex items-center space-x-2 mb-4">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(
                    mission.difficulty
                  )}`}
                >
                  {mission.difficulty.toUpperCase()}
                </span>
                <span className="text-xs text-gray-500 flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{mission.timeEstimate}</span>
                </span>
              </div>

              {/* Reward */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2 text-purple-400">
                  <Zap className="w-4 h-4" />
                  <span className="font-semibold">+{mission.xpReward} XP</span>
                </div>
              </div>

              {/* Action Button */}
              {mission.completed ? (
                <div className="flex items-center justify-center py-3 bg-green-500/20 rounded-lg text-green-400 font-semibold">
                  <Award className="w-4 h-4 mr-2" />
                  Completed
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleStartMission(mission)}
                  className="w-full btn-primary flex items-center justify-center"
                >
                  <Play className="w-4 h-4 mr-2" />
                  <span>Start Mission</span>
                </motion.button>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Mini Game Modal */}
      <AnimatePresence>
        {showMiniGame && activeMission?.gameType && (
          <MiniGames
            gameType={activeMission.gameType}
            onComplete={handleMissionComplete}
            onClose={() => {
              setShowMiniGame(false);
              setActiveMission(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Missions;
