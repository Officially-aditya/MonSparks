import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trophy, Zap, Check, AlertCircle } from "lucide-react";

interface MiniGameProps {
  gameType: "puzzle" | "trivia" | "memory" | "blockchain-quiz";
  onComplete: (success: boolean, score: number) => void;
  onClose: () => void;
}

// Blockchain Trivia Game
const BlockchainTrivia: React.FC<{
  onComplete: (correct: boolean) => void;
}> = ({ onComplete }) => {
  const questions = [
    {
      q: "What does 'gas' refer to in blockchain?",
      options: ["Fuel for cars", "Transaction fee", "A type of token", "Mining reward"],
      correct: 1,
    },
    {
      q: "What is Monad's key innovation?",
      options: ["High throughput", "Low fees", "Parallel execution", "All of above"],
      correct: 3,
    },
    {
      q: "What does 'x402' enable?",
      options: ["Mining", "Staking", "Micropayments", "NFT minting"],
      correct: 2,
    },
    {
      q: "What is a 'smart contract'?",
      options: [
        "A legal document",
        "Self-executing code on blockchain",
        "A type of wallet",
        "A mining algorithm",
      ],
      correct: 1,
    },
    {
      q: "What does EVM stand for?",
      options: [
        "Ethereum Virtual Machine",
        "Electronic Value Method",
        "Encrypted Verification Model",
        "Exchange Value Metric",
      ],
      correct: 0,
    },
  ];

  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleAnswer = (index: number) => {
    setSelected(index);
    const isCorrect = index === questions[currentQ].correct;
    if (isCorrect) setScore(score + 1);
    setShowResult(true);

    setTimeout(() => {
      if (currentQ < questions.length - 1) {
        setCurrentQ(currentQ + 1);
        setSelected(null);
        setShowResult(false);
      } else {
        onComplete(score + (isCorrect ? 1 : 0) >= 3);
      }
    }, 1500);
  };

  const question = questions[currentQ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-sm text-gray-400 mb-2">
          Question {currentQ + 1} of {questions.length}
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-600 to-blue-600"
            initial={{ width: 0 }}
            animate={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="bg-gray-800/50 rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-6">{question.q}</h3>
        <div className="space-y-3">
          {question.options.map((option, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: selected === null ? 1.02 : 1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => !showResult && handleAnswer(index)}
              disabled={showResult}
              className={`w-full p-4 rounded-lg text-left transition-all ${
                showResult
                  ? index === question.correct
                    ? "bg-green-600 border-2 border-green-400"
                    : selected === index
                    ? "bg-red-600 border-2 border-red-400"
                    : "bg-gray-700 opacity-50"
                  : selected === index
                  ? "bg-purple-600 border-2 border-purple-400"
                  : "bg-gray-700 hover:bg-gray-600 border-2 border-transparent"
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{option}</span>
                {showResult && index === question.correct && (
                  <Check className="w-5 h-5 text-green-300" />
                )}
                {showResult && selected === index && index !== question.correct && (
                  <X className="w-5 h-5 text-red-300" />
                )}
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="text-center text-gray-400">
        Score: {score}/{currentQ + (showResult ? 1 : 0)}
      </div>
    </div>
  );
};

// Blockchain Puzzle Game
const BlockchainPuzzle: React.FC<{
  onComplete: (correct: boolean) => void;
}> = ({ onComplete }) => {
  const puzzles = [
    {
      question: "Rearrange to form the correct transaction flow:",
      pieces: ["User signs", "Transaction sent", "Miner validates", "Block confirmed"],
      correct: [0, 1, 2, 3],
    },
    {
      question: "Order the blockchain consensus steps:",
      pieces: ["Propose block", "Validate transactions", "Reach consensus", "Add to chain"],
      correct: [0, 1, 2, 3],
    },
  ];

  const [currentPuzzle, setCurrentPuzzle] = useState(0);
  const [pieces, setPieces] = useState([...puzzles[0].pieces].sort(() => Math.random() - 0.5));
  const [selectedPieces, setSelectedPieces] = useState<number[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const puzzle = puzzles[currentPuzzle];

  const handlePieceClick = (index: number) => {
    if (selectedPieces.includes(index)) {
      setSelectedPieces(selectedPieces.filter((i) => i !== index));
    } else {
      const newSelected = [...selectedPieces, index];
      setSelectedPieces(newSelected);

      if (newSelected.length === pieces.length) {
        checkAnswer(newSelected);
      }
    }
  };

  const checkAnswer = (selected: number[]) => {
    const userOrder = selected.map((i) => pieces[i]);
    const correctOrder = puzzle.correct.map((i) => puzzle.pieces[i]);
    const correct = JSON.stringify(userOrder) === JSON.stringify(correctOrder);
    setIsCorrect(correct);

    setTimeout(() => {
      if (correct && currentPuzzle < puzzles.length - 1) {
        setCurrentPuzzle(currentPuzzle + 1);
        setPieces([...puzzles[currentPuzzle + 1].pieces].sort(() => Math.random() - 0.5));
        setSelectedPieces([]);
        setIsCorrect(null);
      } else {
        onComplete(correct);
      }
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">{puzzle.question}</h3>
        <p className="text-sm text-gray-400">Click pieces in the correct order</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {pieces.map((piece, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handlePieceClick(index)}
            className={`p-6 rounded-xl transition-all ${
              selectedPieces.includes(index)
                ? "bg-purple-600 border-2 border-purple-400"
                : "bg-gray-700 hover:bg-gray-600 border-2 border-transparent"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-left">{piece}</span>
              {selectedPieces.includes(index) && (
                <span className="ml-2 w-6 h-6 bg-white text-purple-600 rounded-full flex items-center justify-center text-sm font-bold">
                  {selectedPieces.indexOf(index) + 1}
                </span>
              )}
            </div>
          </motion.button>
        ))}
      </div>

      {isCorrect !== null && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg text-center ${
            isCorrect ? "bg-green-600/20 text-green-300" : "bg-red-600/20 text-red-300"
          }`}
        >
          {isCorrect ? "✓ Correct! Well done!" : "✗ Not quite. Try again!"}
        </motion.div>
      )}
    </div>
  );
};

// Memory Game
const MemoryGame: React.FC<{
  onComplete: (correct: boolean) => void;
}> = ({ onComplete }) => {
  const symbols = ["⚡", "🔥", "💎", "🚀", "🎯", "⭐"];
  const [cards, setCards] = useState<string[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);

  useEffect(() => {
    const gameCards = [...symbols, ...symbols].sort(() => Math.random() - 0.5);
    setCards(gameCards);
  }, []);

  const handleCardClick = (index: number) => {
    if (flipped.length === 2 || flipped.includes(index) || matched.includes(index)) return;

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(moves + 1);
      if (cards[newFlipped[0]] === cards[newFlipped[1]]) {
        setMatched([...matched, ...newFlipped]);
        setFlipped([]);

        if (matched.length + 2 === cards.length) {
          setTimeout(() => onComplete(moves <= 12), 500);
        }
      } else {
        setTimeout(() => setFlipped([]), 1000);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">Memory Match</h3>
        <p className="text-sm text-gray-400">Find all matching pairs - Moves: {moves}</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {cards.map((card, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleCardClick(index)}
            className={`aspect-square rounded-xl text-4xl flex items-center justify-center transition-all ${
              flipped.includes(index) || matched.includes(index)
                ? "bg-gradient-to-br from-purple-600 to-blue-600"
                : "bg-gray-700"
            }`}
          >
            {flipped.includes(index) || matched.includes(index) ? card : "?"}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

// Main Mini Game Component
const MiniGames: React.FC<MiniGameProps> = ({ gameType, onComplete, onClose }) => {
  const [gameComplete, setGameComplete] = useState(false);
  const [success, setSuccess] = useState(false);
  const [score, setScore] = useState(0);

  const handleGameComplete = (isSuccess: boolean, gameScore?: number) => {
    setSuccess(isSuccess);
    setScore(gameScore || (isSuccess ? 100 : 0));
    setGameComplete(true);

    setTimeout(() => {
      onComplete(isSuccess, gameScore || (isSuccess ? 100 : 0));
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-purple-500/30 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-gray-900/90 backdrop-blur-sm border-b border-purple-500/20 p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Mini Challenge</h2>
              <p className="text-sm text-gray-400">Complete to earn rewards</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Game Content */}
        <div className="p-6">
          {!gameComplete ? (
            <>
              {gameType === "trivia" && (
                <BlockchainTrivia onComplete={(c) => handleGameComplete(c)} />
              )}
              {gameType === "puzzle" && (
                <BlockchainPuzzle onComplete={(c) => handleGameComplete(c)} />
              )}
              {gameType === "memory" && (
                <MemoryGame onComplete={(c) => handleGameComplete(c)} />
              )}
              {gameType === "blockchain-quiz" && (
                <BlockchainTrivia onComplete={(c) => handleGameComplete(c)} />
              )}
            </>
          ) : (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-12"
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 0.5 }}
                className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${
                  success ? "bg-green-600" : "bg-red-600"
                }`}
              >
                {success ? (
                  <Check className="w-12 h-12" />
                ) : (
                  <AlertCircle className="w-12 h-12" />
                )}
              </motion.div>
              <h3 className="text-2xl font-bold mb-2">
                {success ? "Challenge Complete! 🎉" : "Try Again!"}
              </h3>
              <p className="text-gray-400 mb-4">
                {success
                  ? `You earned ${score} points!`
                  : "Don't worry, you can retry anytime"}
              </p>
              <div className="flex items-center justify-center space-x-2 text-purple-400">
                <Zap className="w-5 h-5" />
                <span className="font-semibold">
                  {success ? "+15 XP" : "+5 XP for trying"}
                </span>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MiniGames;
