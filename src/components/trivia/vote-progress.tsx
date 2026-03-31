"use client";

import { Users } from "lucide-react";

interface VoteProgressProps {
  votedCount: number;
  votedNames: string[];
  guestName: string;
}

export function VoteProgress({
  votedCount,
  votedNames,
  guestName,
}: VoteProgressProps) {
  const hasVoted = votedNames.includes(guestName);

  return (
    <div className="bg-royal-purple/20 border border-gold/10 p-4 text-center">
      <div className="flex items-center justify-center gap-2 mb-2">
        <Users className="w-4 h-4 text-gold" />
        <span className="font-[family-name:var(--font-heading)] text-xl text-gold-light">
          {votedCount}
        </span>
        <span className="text-gold-pale/50 text-sm">voted at your table</span>
      </div>

      {hasVoted && (
        <p className="text-emerald-400/70 text-xs">
          Your vote is in! Waiting for others...
        </p>
      )}
    </div>
  );
}
