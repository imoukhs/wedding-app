"use client";

import { useEffect, useState } from "react";

interface CountdownTimerProps {
  timerEndsAt: string | null;
  serverTime: string;
  totalSeconds?: number;
  size?: "sm" | "md" | "lg";
  onExpired?: () => void;
}

export function CountdownTimer({
  timerEndsAt,
  serverTime,
  totalSeconds = 20,
  size = "md",
  onExpired,
}: CountdownTimerProps) {
  const [remaining, setRemaining] = useState(totalSeconds);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (!timerEndsAt) {
      setRemaining(0);
      return;
    }

    // Calculate clock offset between server and client
    const serverNow = new Date(serverTime).getTime();
    const clientNow = Date.now();
    const offset = serverNow - clientNow;

    function tick() {
      const endTime = new Date(timerEndsAt!).getTime();
      const now = Date.now() + offset;
      const diff = Math.max(0, Math.ceil((endTime - now) / 1000));
      setRemaining(diff);

      if (diff <= 0 && !expired) {
        setExpired(true);
        onExpired?.();
      }
    }

    tick();
    const interval = setInterval(tick, 100);
    return () => clearInterval(interval);
  }, [timerEndsAt, serverTime, onExpired, expired]);

  const progress = remaining / totalSeconds;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference * (1 - progress);

  const sizeMap = {
    sm: { container: "w-16 h-16", text: "text-xl", stroke: 4 },
    md: { container: "w-24 h-24", text: "text-3xl", stroke: 5 },
    lg: { container: "w-36 h-36", text: "text-5xl", stroke: 6 },
  };

  const s = sizeMap[size];
  const color =
    remaining <= 5
      ? "text-red-400 stroke-red-400"
      : remaining <= 10
        ? "text-amber-400 stroke-amber-400"
        : "text-gold stroke-gold";

  return (
    <div className={`relative ${s.container} mx-auto`}>
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth={s.stroke}
          className="text-gold/10"
        />
        {/* Progress circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          strokeWidth={s.stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className={`${color} transition-all duration-200`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className={`font-[family-name:var(--font-heading)] ${s.text} ${color.split(" ")[0]}`}
        >
          {remaining}
        </span>
      </div>
    </div>
  );
}
