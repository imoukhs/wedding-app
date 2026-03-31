"use client";

import { useEffect, useState } from "react";
import { getGuestStats } from "@/lib/actions/guest-actions";
import { Users, UserCheck, AlertTriangle } from "lucide-react";

interface Stats {
  total: number;
  totalGuests: number;
  flagged: number;
}

export function DashboardStats() {
  const [stats, setStats] = useState<Stats>({ total: 0, totalGuests: 0, flagged: 0 });

  useEffect(() => { getGuestStats().then(setStats); }, []);

  const cards = [
    { label: "Guest Records", value: stats.total,       icon: Users,         color: "text-gold-light",  bg: "bg-gold/10",       border: "border-gold/20" },
    { label: "Total People",  value: stats.totalGuests, icon: UserCheck,     color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    { label: "Flagged",       value: stats.flagged,     icon: AlertTriangle, color: "text-orange-400",  bg: "bg-orange-500/10", border: "border-orange-500/20" },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 mb-8">
      {cards.map((card) => (
        <div key={card.label} className={`${card.bg} border ${card.border} p-4 text-center rounded-sm`}>
          <card.icon className={`w-4 h-4 mx-auto mb-2 ${card.color}`} />
          <div className={`font-[family-name:var(--font-heading)] text-3xl ${card.color}`}>
            {card.value}
          </div>
          <div className="text-[0.6rem] tracking-[0.2em] uppercase text-gold-pale/50 mt-1 leading-tight">
            {card.label}
          </div>
        </div>
      ))}
    </div>
  );
}
