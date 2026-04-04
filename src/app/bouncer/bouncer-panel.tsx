"use client";

import { useState, useEffect, useTransition, useOptimistic } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { verifyBouncerPin } from "@/lib/actions/auth-actions";
import { getGuests, getGuestStats, checkInGuest } from "@/lib/actions/guest-actions";
import { toast } from "sonner";
import { Shield, Search, Users, CheckCircle, UserCheck, Eye, EyeOff } from "lucide-react";

interface Guest {
  id: string;
  name: string;
  email: string | null;
  guestCount: number;
  status: string;
  checkedIn: boolean;
  checkedInAt: Date | null;
  serial: string | null;
}

interface Stats {
  total: number;
  attending: number;
  totalGuests: number;
}

export function BouncerPanel() {
  const [authenticated, setAuthenticated] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, attending: 0, totalGuests: 0 });
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  const [showPin, setShowPin] = useState(false);

  const [optimisticGuests, setOptimisticGuests] = useOptimistic(
    guests,
    (state, action: { type: "checkin"; id: string; checkedIn: boolean }) =>
      state.map((g) => g.id === action.id ? { ...g, checkedIn: action.checkedIn } : g)
  );

  useEffect(() => {
    if (authenticated) loadData();
  }, [authenticated]);

  async function loadData() {
    const [guestData, statsData] = await Promise.all([getGuests(), getGuestStats()]);
    setGuests(guestData);
    setStats(statsData);
  }

  async function handleLogin() {
    const valid = await verifyBouncerPin(pin);
    if (valid) { setAuthenticated(true); setPinError(false); }
    else { setPinError(true); }
  }

  function handleCheckIn(guestId: string, guestName: string, checkedIn: boolean) {
    startTransition(async () => {
      setOptimisticGuests({ type: "checkin", id: guestId, checkedIn });
      await checkInGuest(guestId, checkedIn);
      await loadData();
      toast.success(checkedIn ? `${guestName} checked in` : `${guestName} check-in undone`);
    });
  }

  const attendingGuests = optimisticGuests.filter((g) => g.status === "attending");
  const filteredGuests = attendingGuests.filter((g) => {
    const q = search.toLowerCase();
    return g.name.toLowerCase().includes(q) || (g.serial?.toLowerCase().includes(q) ?? false);
  });
  const checkedInCount = attendingGuests.filter((g) => g.checkedIn).length;

  const sortedGuests = [...filteredGuests].sort((a, b) => {
    if (a.checkedIn === b.checkedIn) return 0;
    return a.checkedIn ? 1 : -1;
  });

  // PIN entry
  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-gold" />
            </div>
            <h1 className="font-[family-name:var(--font-display)] text-xl tracking-[0.2em] text-gold-light mb-1">
              BOUNCER ACCESS
            </h1>
            <p className="text-gold-pale/50 text-sm">Enter PIN to continue</p>
          </div>

          <div className="bg-royal-purple/25 border border-gold/20 p-8 relative">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent" />
            <div className="relative mb-4">
              <Input
                type={showPin ? "text" : "password"}
                inputMode="numeric"
                placeholder="Enter PIN"
                value={pin}
                onChange={(e) => { setPin(e.target.value); setPinError(false); }}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="bg-deep-purple/60 border-gold/25 text-cream text-center text-2xl tracking-[0.5em] placeholder:text-gold-pale/30 focus:border-gold h-14 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPin(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gold-pale/50 hover:text-gold transition-colors"
                tabIndex={-1}
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {pinError && <p className="text-destructive text-sm text-center mb-4">Incorrect PIN</p>}
            <Button
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-gold to-gold-light text-deep-purple font-[family-name:var(--font-display)] text-xs tracking-[0.2em] uppercase py-5"
            >
              Enter
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 pt-6 pb-12 max-w-lg mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="font-[family-name:var(--font-display)] text-sm tracking-[0.3em] text-gold-light uppercase">
          Door Check-In
        </h1>
      </div>

      {/* Stats — 3 cards */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <div className="bg-royal-purple/30 border border-gold/15 p-3 text-center">
          <div className="flex items-center justify-center mb-1">
            <Users className="w-3.5 h-3.5 text-gold" />
          </div>
          <div className="font-[family-name:var(--font-heading)] text-2xl text-gold-light">
            {stats.attending}
          </div>
          <div className="text-[0.55rem] tracking-[0.15em] uppercase text-gold-pale/50">Expected</div>
        </div>
        <div className="bg-royal-purple/30 border border-gold/15 p-3 text-center">
          <div className="flex items-center justify-center mb-1">
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="font-[family-name:var(--font-heading)] text-2xl text-emerald-400">
            {checkedInCount}
          </div>
          <div className="text-[0.55rem] tracking-[0.15em] uppercase text-gold-pale/50">Checked In</div>
        </div>
        <div className="bg-royal-purple/30 border border-gold/15 p-3 text-center">
          <div className="flex items-center justify-center mb-1">
            <CheckCircle className="w-3.5 h-3.5 text-gold" />
          </div>
          <div className="font-[family-name:var(--font-heading)] text-2xl text-gold-light">
            {stats.totalGuests}
          </div>
          <div className="text-[0.55rem] tracking-[0.15em] uppercase text-gold-pale/50">Total</div>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-pale/40" />
        <Input
          placeholder="Search by name or serial (LK2026-001)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-deep-purple/60 border-gold/25 text-cream placeholder:text-gold-pale/30 focus:border-gold pl-10"
        />
      </div>

      {/* Guest list */}
      <div className="space-y-2">
        {sortedGuests.length === 0 ? (
          <p className="text-center text-gold-pale/40 py-8 font-[family-name:var(--font-heading)] text-lg">
            No guests found
          </p>
        ) : (
          sortedGuests.map((guest) => (
            <div
              key={guest.id}
              className={`flex items-center justify-between p-4 border transition-all ${
                guest.checkedIn
                  ? "bg-royal-purple/10 border-gold/8 opacity-50"
                  : "bg-royal-purple/20 border-gold/15"
              }`}
            >
              <div
                className="flex-1 min-w-0 cursor-pointer"
                onClick={() => handleCheckIn(guest.id, guest.name, !guest.checkedIn)}
              >
                <p className={`font-[family-name:var(--font-heading)] text-lg truncate transition-all ${
                  guest.checkedIn ? "text-gold-pale/40 line-through" : "text-cream"
                }`}>
                  {guest.name}
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-gold-pale/50">
                    {guest.guestCount} {guest.guestCount === 1 ? "person" : "people"}
                  </p>
                  {guest.serial && (
                    <span className="font-mono text-[0.6rem] text-gold/50">{guest.serial}</span>
                  )}
                  {guest.checkedIn && (
                    <span className="text-[0.6rem] text-emerald-400/60 flex items-center gap-0.5">
                      <CheckCircle className="w-2.5 h-2.5" /> In
                    </span>
                  )}
                </div>
              </div>

              <div className="ml-3">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isPending}
                  onClick={() => handleCheckIn(guest.id, guest.name, !guest.checkedIn)}
                  className={`text-xs font-[family-name:var(--font-display)] tracking-wider min-h-[44px] px-4 ${
                    guest.checkedIn
                      ? "border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10"
                      : "border-gold/30 text-gold hover:bg-gold/10"
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5 mr-1" />
                  {guest.checkedIn ? "Undo" : "Check In"}
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="text-center mt-12 pt-6 border-t border-gold/10">
        <p className="text-gold-pale/25 text-[0.6rem] tracking-[0.2em] uppercase">
          Built by King &mdash; the last born / bride&apos;s brother
        </p>
      </div>
    </div>
  );
}
