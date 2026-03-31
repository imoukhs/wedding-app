"use client";

import { useEffect, useState } from "react";
import { getGuestStats } from "@/lib/actions/guest-actions";
import { Users, UserCheck, UserX, Clock } from "lucide-react";

interface Stats {
  total: number;
  attending: number;
  declined: number;
  pending: number;
  totalGuests: number;
  flagged: number;
}

export function DashboardStats() {
  const [stats, setStats] = useState<Stats>({
    total: 0, attending: 0, declined: 0, pending: 0, totalGuests: 0, flagged: 0,
  });

  useEffect(() => {
    getGuestStats().then(setStats);
  }, []);

  const cards = [
    { label: "Total RSVPs", value: stats.total, icon: Users, color: "text-gold-light" },
    { label: "Attending", value: stats.attending, icon: UserCheck, color: "text-emerald-400" },
    { label: "Declined", value: stats.declined, icon: UserX, color: "text-red-400" },
    { label: "Pending", value: stats.pending, icon: Clock, color: "text-gold" },
    { label: "Total Guests", value: stats.totalGuests, icon: Users, color: "text-gold-light" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
      {cards.map((card) => (
        <div key={card.label} className="bg-royal-purple/40 border border-gold/15 p-4 text-center">
          <card.icon className={`w-4 h-4 mx-auto mb-2 ${card.color}`} />
          <div className={`font-[family-name:var(--font-heading)] text-3xl ${card.color}`}>
            {card.value}
          </div>
          <div className="text-[0.6rem] tracking-[0.2em] uppercase text-gold-pale/50 mt-1">
            {card.label}
          </div>
        </div>
      ))}
    </div>
  );
}
