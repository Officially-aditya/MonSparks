import React from "react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
//error
import {
  Zap,
  Trophy,
  Activity,
  Wallet,
  LogOut,
  Archive,
  Target,
} from "lucide-react";
import { useWeb3 } from "../context/Web3Context";
import { shortenAddress } from "../lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { account, isConnected, connect, disconnect, balance } = useWeb3();

  const navItems = [
    { to: "/", label: "Dashboard", icon: Zap },
    { to: "/quests", label: "Quests", icon: Trophy },
    { to: "/missions", label: "Missions", icon: Target },
    { to: "/bridge", label: "Bridge", icon: Archive },
    { to: "/activity", label: "Activity", icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-gradient-dark text-white">
      {/* Header */}
      <header className="border-b border-purple-500/20 backdrop-blur-lg bg-gray-900/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  MONSpark
                </h1>
                <p className="text-xs text-gray-400">Ignite Your Assets</p>
              </div>
            </motion.div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                      isActive
                        ? "bg-purple-600 text-white"
                        : "text-gray-300 hover:bg-gray-800"
                    }`
                  }
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>

            {/* Wallet Connect */}
            <div className="flex items-center space-x-4">
              {isConnected ? (
                <>
                  <div className="hidden sm:flex items-center space-x-2 bg-gray-800 px-4 py-2 rounded-lg border border-purple-500/20">
                    <Wallet className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-medium">{balance} MON</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-gray-800 px-4 py-2 rounded-lg border border-purple-500/20">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium">
                      {shortenAddress(account!)}
                    </span>
                    <button
                      onClick={disconnect}
                      className="ml-2 text-gray-400 hover:text-white transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={connect}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Wallet className="w-4 h-4" />
                  <span>Connect Wallet</span>
                </motion.button>
              )}
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden mt-4 flex justify-around border-t border-purple-500/20 pt-4">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-all ${
                    isActive
                      ? "bg-purple-600 text-white"
                      : "text-gray-400 hover:text-white"
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span className="text-xs">{item.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">{children}</main>

      {/* Footer */}
      <footer className="border-t border-purple-500/20 mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-gray-400">
          <p className="text-sm">
            Built for Monad Hackathon with ⚡ by the MONSpark team
          </p>
          <p className="text-xs mt-2">
            Powered by Monad • x402 • Hardhat • React
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
