"use client";

import { useState, useEffect, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { verifyCatererPin } from "@/lib/actions/auth-actions";
import {
  getTablesForCaterer,
  markTableServed,
  unmarkTableServed,
} from "@/lib/actions/table-actions";
import { toast } from "sonner";
import {
  ChefHat,
  Check,
  Utensils,
  Users,
  Clock,
  Undo2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface TableOrder {
  id: string;
  personName: string;
  menuItem: { id: string; name: string; category: { id: string; name: string } };
}

interface CatererTable {
  id: string;
  number: number;
  guestCount: number;
  served: boolean;
  servedAt: string | null;
  orders: TableOrder[];
}

export function CatererPanel() {
  const [authenticated, setAuthenticated] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const [tables, setTables] = useState<CatererTable[]>([]);
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (authenticated) {
      loadTables();
      // Auto-refresh every 5 seconds
      const interval = setInterval(loadTables, 5000);
      return () => clearInterval(interval);
    }
  }, [authenticated]);

  async function loadTables() {
    const data = await getTablesForCaterer();
    setTables(
      data.map((t) => ({
        ...t,
        servedAt: t.servedAt ? t.servedAt.toISOString() : null,
      }))
    );
  }

  async function handleLogin() {
    const valid = await verifyCatererPin(pin);
    if (valid) {
      setAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  }

  function handleMarkServed(tableId: string, tableNumber: number) {
    startTransition(async () => {
      await markTableServed(tableId);
      await loadTables();
      toast.success(`Table ${tableNumber} marked as served`);
    });
  }

  function handleUnmarkServed(tableId: string, tableNumber: number) {
    startTransition(async () => {
      await unmarkTableServed(tableId);
      await loadTables();
      toast.success(`Table ${tableNumber} unmarked`);
    });
  }

  function toggleExpand(tableId: string) {
    setExpandedTables((prev) => {
      const next = new Set(prev);
      if (next.has(tableId)) {
        next.delete(tableId);
      } else {
        next.add(tableId);
      }
      return next;
    });
  }

  function getMealSummary(orders: TableOrder[]) {
    const counts: Record<string, number> = {};
    for (const order of orders) {
      const name = order.menuItem.name;
      counts[name] = (counts[name] || 0) + 1;
    }
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }

  const pendingTables = tables.filter((t) => !t.served);
  const servedTables = tables.filter((t) => t.served);

  // PIN entry screen
  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto mb-4">
              <ChefHat className="w-8 h-8 text-gold" />
            </div>
            <h1 className="font-[family-name:var(--font-display)] text-xl tracking-[0.2em] text-gold-light mb-1">
              KITCHEN ACCESS
            </h1>
            <p className="text-gold-pale/50 text-sm">Enter PIN to view orders</p>
          </div>

          <div className="bg-royal-purple/25 border border-gold/20 p-8 relative">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent" />

            <Input
              type="password"
              inputMode="numeric"
              placeholder="Enter PIN"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setPinError(false);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="bg-deep-purple/60 border-gold/25 text-cream text-center text-2xl tracking-[0.5em] placeholder:text-gold-pale/30 focus:border-gold mb-4 h-14"
            />

            {pinError && (
              <p className="text-destructive text-sm text-center mb-4">
                Incorrect PIN
              </p>
            )}

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

  // Kitchen dashboard
  return (
    <div className="min-h-screen px-4 pt-6 pb-12 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="font-[family-name:var(--font-display)] text-sm tracking-[0.3em] text-gold-light uppercase">
          Kitchen Orders
        </h1>
        <p className="text-gold-pale/50 text-xs mt-1">
          Auto-refreshes every 5 seconds
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-royal-purple/30 border border-gold/15 p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Utensils className="w-3.5 h-3.5 text-gold" />
          </div>
          <div className="font-[family-name:var(--font-heading)] text-2xl text-gold-light">
            {tables.length}
          </div>
          <div className="text-[0.6rem] tracking-[0.2em] uppercase text-gold-pale/50">
            Total Orders
          </div>
        </div>
        <div className="bg-royal-purple/30 border border-gold/15 p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="font-[family-name:var(--font-heading)] text-2xl text-amber-400">
            {pendingTables.length}
          </div>
          <div className="text-[0.6rem] tracking-[0.2em] uppercase text-gold-pale/50">
            Pending
          </div>
        </div>
        <div className="bg-royal-purple/30 border border-gold/15 p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="font-[family-name:var(--font-heading)] text-2xl text-emerald-400">
            {servedTables.length}
          </div>
          <div className="text-[0.6rem] tracking-[0.2em] uppercase text-gold-pale/50">
            Served
          </div>
        </div>
      </div>

      {/* Pending Orders */}
      {pendingTables.length > 0 && (
        <div className="mb-8">
          <h2 className="font-[family-name:var(--font-display)] text-[0.7rem] tracking-[0.3em] uppercase text-amber-400 mb-4">
            Pending Orders
          </h2>
          <div className="space-y-4">
            {pendingTables.map((table) => {
              const summary = getMealSummary(table.orders);
              const isExpanded = expandedTables.has(table.id);

              return (
                <div
                  key={table.id}
                  className="bg-royal-purple/30 border border-gold/15 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

                  <div className="p-5">
                    {/* Table header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <h3 className="font-[family-name:var(--font-display)] text-xs tracking-[0.2em] uppercase text-gold">
                          Table {table.number}
                        </h3>
                        <span className="flex items-center gap-1 text-gold-pale/60 text-sm">
                          <Users className="w-3.5 h-3.5" /> {table.guestCount}
                        </span>
                      </div>
                      <Button
                        onClick={() =>
                          handleMarkServed(table.id, table.number)
                        }
                        disabled={isPending}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.15em] uppercase px-4 py-2"
                      >
                        <Check className="w-3.5 h-3.5 mr-1" /> Complete
                      </Button>
                    </div>

                    {/* Meal summary */}
                    <div className="space-y-1.5 mb-3">
                      {summary.map(({ name, count }) => (
                        <div
                          key={name}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-cream">{name}</span>
                          <span className="text-gold font-[family-name:var(--font-heading)] text-lg">
                            x{count}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Expand/collapse person breakdown */}
                    <button
                      onClick={() => toggleExpand(table.id)}
                      className="flex items-center gap-1 text-gold-pale/40 hover:text-gold-pale/70 text-xs transition-colors"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-3.5 h-3.5" /> Hide details
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3.5 h-3.5" /> Show
                          person-by-person
                        </>
                      )}
                    </button>

                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-gold/10 space-y-1.5">
                        {table.orders.map((order) => (
                          <div
                            key={order.id}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-gold-pale/60">
                              {order.personName}
                            </span>
                            <span className="text-gold-pale/50 text-xs">
                              {order.menuItem.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Served Orders */}
      {servedTables.length > 0 && (
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-[0.7rem] tracking-[0.3em] uppercase text-emerald-400/70 mb-4">
            Served
          </h2>
          <div className="space-y-3">
            {servedTables.map((table) => {
              const summary = getMealSummary(table.orders);

              return (
                <div
                  key={table.id}
                  className="bg-royal-purple/15 border border-gold/8 relative overflow-hidden opacity-60"
                >
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-[family-name:var(--font-display)] text-xs tracking-[0.2em] uppercase text-gold/60">
                          Table {table.number}
                        </h3>
                        <span className="flex items-center gap-1 text-emerald-400/60 text-xs">
                          <Check className="w-3 h-3" /> Served
                          {table.servedAt && (
                            <span className="ml-1">
                              {new Date(table.servedAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          )}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleUnmarkServed(table.id, table.number)
                        }
                        disabled={isPending}
                        className="text-gold-pale/30 hover:text-gold-pale/60 text-xs"
                      >
                        <Undo2 className="w-3 h-3 mr-1" /> Undo
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gold-pale/40">
                      {summary.map(({ name, count }) => (
                        <span key={name}>
                          {count}x {name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tables.length === 0 && (
        <div className="text-center py-16">
          <ChefHat className="w-12 h-12 text-gold-pale/20 mx-auto mb-4" />
          <p className="font-[family-name:var(--font-heading)] text-lg text-gold-pale/40">
            No orders yet
          </p>
          <p className="text-gold-pale/30 text-sm mt-1">
            Orders will appear here when guests submit them
          </p>
        </div>
      )}

      {/* Built by credit */}
      <div className="text-center mt-12 pt-6 border-t border-gold/10">
        <p className="text-gold-pale/25 text-[0.6rem] tracking-[0.2em] uppercase">
          Built by King &mdash; the last born / bride&apos;s brother
        </p>
      </div>
    </div>
  );
}
