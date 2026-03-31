"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Trophy } from "lucide-react";

interface LeaderboardEntry {
  tableId: string;
  tableNumber: number;
  totalPoints: number;
  correct: number;
  total: number;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  isFullScreen?: boolean;
  isFinal?: boolean;
}

export function Leaderboard({
  entries,
  isFullScreen = false,
  isFinal = false,
}: LeaderboardProps) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gold-pale/40 text-sm">No scores yet</p>
      </div>
    );
  }

  const rankColors = ["text-gold-light", "text-gray-300", "text-amber-700"];
  const rankBg = [
    "bg-gold/10 border-gold/30",
    "bg-gray-400/10 border-gray-400/20",
    "bg-amber-800/10 border-amber-700/20",
  ];

  return (
    <div
      className={`${isFullScreen ? "flex flex-col items-center justify-center min-h-[60vh]" : ""}`}
    >
      {isFinal && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.8 }}
          className="text-center mb-8"
        >
          <Trophy className="w-12 h-12 text-gold mx-auto mb-2" />
          <h2
            className={`font-[family-name:var(--font-heading)] text-gold-light ${isFullScreen ? "text-4xl" : "text-2xl"}`}
          >
            Final Results
          </h2>
        </motion.div>
      )}

      <div
        className={`w-full ${isFullScreen ? "max-w-xl" : "max-w-md"} mx-auto space-y-2`}
      >
        <AnimatePresence>
          {entries.map((entry, i) => (
            <motion.div
              key={entry.tableId}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1, duration: 0.3 }}
              className={`flex items-center gap-4 p-4 border relative overflow-hidden ${
                i < 3 ? rankBg[i] : "bg-royal-purple/20 border-gold/10"
              }`}
            >
              {/* Rank */}
              <div
                className={`font-[family-name:var(--font-heading)] ${
                  isFullScreen ? "text-3xl" : "text-2xl"
                } w-10 text-center ${i < 3 ? rankColors[i] : "text-gold-pale/40"}`}
              >
                {i + 1}
              </div>

              {/* Table info */}
              <div className="flex-1">
                <p
                  className={`font-[family-name:var(--font-display)] tracking-[0.15em] uppercase ${
                    isFullScreen ? "text-sm" : "text-xs"
                  } ${i === 0 ? "text-gold-light" : "text-cream"}`}
                >
                  Table {entry.tableNumber}
                </p>
                <p className="text-gold-pale/40 text-xs">
                  {entry.correct}/{entry.total} correct
                </p>
              </div>

              {/* Points */}
              <div
                className={`font-[family-name:var(--font-heading)] ${
                  isFullScreen ? "text-3xl" : "text-2xl"
                } ${i === 0 ? "text-gold-light" : "text-gold"}`}
              >
                {entry.totalPoints}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
