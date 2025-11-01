import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
//error
import { Archive, ArrowRight, ArrowDown, Info } from "lucide-react";
import { useWeb3 } from "../context/Web3Context";
import { bridgeApi } from "../lib/api";
import { SupportedChain, SupportedToken } from "../types";

const BridgePanel: React.FC = () => {
  const { account, isConnected, balance } = useWeb3();
  const [amount, setAmount] = useState("");
  const [targetChain, setTargetChain] = useState("");
  const [targetToken, setTargetToken] = useState("");
  const [chains, setChains] = useState<SupportedChain[]>([]);
  const [tokens, setTokens] = useState<SupportedToken[]>([]);
  const [outputAmount, setOutputAmount] = useState("");
  const [fee, setFee] = useState("");
  const [bridging, setBridging] = useState(false);

  useEffect(() => {
    loadSupportedAssets();
  }, []);

  useEffect(() => {
    if (amount && targetToken && parseFloat(amount) > 0) {
      calculateOutput();
    } else {
      setOutputAmount("");
      setFee("");
    }
  }, [amount, targetToken]);

  const loadSupportedAssets = async () => {
    try {
      const data = await bridgeApi.getSupported();
      setChains(data.chains);
      setTokens(data.tokens);

      // Set defaults
      if (data.chains.length > 0) setTargetChain(data.chains[0].name);
      if (data.tokens.length > 0) setTargetToken(data.tokens[0].symbol);
    } catch (error) {
      console.error("Error loading supported assets:", error);
    }
  };

  const calculateOutput = async () => {
    if (!amount || !targetToken) return;

    try {
      const data = await bridgeApi.calculate(amount, targetToken);
      setOutputAmount(data.outputAmount);
      setFee(data.fee);
    } catch (error) {
      console.error("Error calculating output:", error);
    }
  };

  const handleBridge = async () => {
    if (!account || !amount || !targetChain || !targetToken) return;

    setBridging(true);
    try {
      const result = await bridgeApi.initiate(
        account,
        amount,
        targetChain,
        targetToken
      );
      alert(`Bridge initiated! Request ID: ${result.requestId}`);
      setAmount("");
      setOutputAmount("");
      setFee("");
    } catch (error: any) {
      console.error("Error initiating bridge:", error);
      alert(error.response?.data?.error || "Failed to initiate bridge");
    } finally {
      setBridging(false);
    }
  };

  if (!isConnected) {
    return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Archive className="w-24 h-24 text-purple-400 mb-6" />
        <h2 className="text-3xl font-bold mb-4">Bridge Panel</h2>
        <p className="text-gray-400">Connect your wallet to bridge tokens</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          Bridge Panel
        </h1>
        <p className="text-gray-400">
          Bridge your MON to other chains and tokens
        </p>
      </motion.div>

      {/* Bridge Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card-glow p-8"
      >
        {/* From Section */}
        <div className="mb-6">
          <label className="text-sm text-gray-400 mb-2 block">From</label>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Monad</span>
              <span className="text-sm text-gray-400">
                Balance: {balance} MON
              </span>
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              className="w-full bg-transparent text-3xl font-bold outline-none"
              step="0.001"
              min="0"
            />
            <div className="mt-2">
              <span className="text-lg font-semibold">MON</span>
            </div>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex justify-center -my-3 relative z-10">
          <div className="bg-gradient-to-br from-purple-600 to-blue-600 p-3 rounded-full">
            <ArrowDown className="w-6 h-6" />
          </div>
        </div>

        {/* To Section */}
        <div className="mb-6">
          <label className="text-sm text-gray-400 mb-2 block">To</label>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <select
                value={targetChain}
                onChange={(e) => setTargetChain(e.target.value)}
                className="bg-gray-700 text-white px-3 py-1 rounded-lg text-sm outline-none"
              >
                {chains.map((chain) => (
                  <option key={chain.chainId} value={chain.name}>
                    {chain.name}
                  </option>
                ))}
              </select>
              <span className="text-sm text-gray-400">
                {outputAmount ? `≈ ${outputAmount}` : "--"}
              </span>
            </div>
            <div className="text-3xl font-bold text-gray-500">
              {outputAmount || "0.0"}
            </div>
            <div className="mt-2">
              <select
                value={targetToken}
                onChange={(e) => setTargetToken(e.target.value)}
                className="bg-gray-700 text-white px-3 py-2 rounded-lg text-lg font-semibold outline-none"
              >
                {tokens.map((token) => (
                  <option key={token.symbol} value={token.symbol}>
                    {token.symbol}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Bridge Info */}
        {fee && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6"
          >
            <div className="flex items-start space-x-2">
              <Info className="w-5 h-5 text-blue-400 mt-0.5" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Bridge Fee</span>
                  <span className="text-white font-semibold">{fee} MON</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Estimated Time</span>
                  <span className="text-white font-semibold">2-5 minutes</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">You will receive</span>
                  <span className="text-green-400 font-semibold">
                    {outputAmount} {targetToken}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Bridge Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleBridge}
          disabled={
            !amount ||
            parseFloat(amount) <= 0 ||
            parseFloat(amount) > parseFloat(balance) ||
            bridging
          }
          className={`w-full btn-primary flex items-center justify-center ${
            !amount ||
            parseFloat(amount) <= 0 ||
            parseFloat(amount) > parseFloat(balance) ||
            bridging
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
        >
          {bridging ? (
            <span>Bridging...</span>
          ) : (
            <>
              <Archive className="w-5 h-5 mr-2" />
              <span>Bridge Tokens</span>
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </motion.button>
      </motion.div>

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-glow p-6"
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Info className="w-5 h-5 mr-2 text-blue-400" />
          How it works
        </h3>
        <ul className="space-y-3 text-sm text-gray-400">
          <li className="flex items-start">
            <span className="text-purple-400 mr-2">1.</span>
            Enter the amount of MON you want to bridge
          </li>
          <li className="flex items-start">
            <span className="text-purple-400 mr-2">2.</span>
            Select your target chain and token
          </li>
          <li className="flex items-start">
            <span className="text-purple-400 mr-2">3.</span>
            Review the conversion rate and fees
          </li>
          <li className="flex items-start">
            <span className="text-purple-400 mr-2">4.</span>
            Confirm the bridge transaction and wait for completion
          </li>
        </ul>
      </motion.div>
    </div>
  );
};

export default BridgePanel;
