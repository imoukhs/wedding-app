"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { verifyAdminPassword } from "@/lib/actions/auth-actions";
import { DashboardStats } from "./components/dashboard-stats";
import { GuestListTab } from "./components/guest-list-tab";
import { MenuTab } from "./components/menu-tab";
import { TableOrdersTab } from "./components/table-orders-tab";
import { ScheduleTab } from "./components/schedule-tab";
import { SettingsTab } from "./components/settings-tab";
import { TriviaTab } from "./components/trivia-tab";
import {
  Lock, Menu, X, Users, UtensilsCrossed,
  TableProperties, Calendar, Settings, Gamepad2,
} from "lucide-react";

const TABS = [
  { value: "guests",   label: "Guests",   Icon: Users },
  { value: "menu",     label: "Menu",     Icon: UtensilsCrossed },
  { value: "tables",   label: "Tables",   Icon: TableProperties },
  { value: "schedule", label: "Schedule", Icon: Calendar },
  { value: "settings", label: "Settings", Icon: Settings },
  { value: "trivia",   label: "Trivia",   Icon: Gamepad2 },
];

export function AdminPanel() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState("guests");
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogin() {
    startTransition(async () => {
      const valid = await verifyAdminPassword(password);
      if (valid) { setAuthenticated(true); setError(false); }
      else { setError(true); }
    });
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-gold" />
            </div>
            <h1 className="font-[family-name:var(--font-display)] text-xl tracking-[0.2em] text-gold-light mb-1">
              ADMIN ACCESS
            </h1>
            <p className="text-gold-pale/50 text-sm">Enter password to continue</p>
          </div>

          <div className="bg-royal-purple/25 border border-gold/20 p-8 relative">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent" />
            <Input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(false); }}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="bg-deep-purple/60 border-gold/25 text-cream placeholder:text-gold-pale/30 focus:border-gold mb-4"
            />
            {error && <p className="text-destructive text-sm text-center mb-4">Incorrect password</p>}
            <Button
              onClick={handleLogin}
              disabled={isPending}
              className="w-full bg-gradient-to-r from-gold to-gold-light text-deep-purple font-[family-name:var(--font-display)] text-xs tracking-[0.2em] uppercase py-5"
            >
              {isPending ? "Verifying..." : "Enter"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12">
      {/* ── Header ── */}
      <div className="sticky top-0 z-40 bg-deep-purple/95 backdrop-blur border-b border-gold/20 px-4 sm:px-8 py-3 flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-display)] text-sm tracking-[0.2em] text-gold-light">
          WEDDING ADMIN
        </h1>
        {/* Desktop: current tab label */}
        <span className="hidden sm:block font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.2em] uppercase text-gold/50">
          {TABS.find(t => t.value === activeTab)?.label}
        </span>
        {/* Mobile: burger */}
        <button
          onClick={() => setMenuOpen(o => !o)}
          className="sm:hidden text-gold p-1.5 hover:bg-gold/10 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* ── Mobile slide-down menu ── */}
      {menuOpen && (
        <div className="sm:hidden fixed inset-0 z-30 bg-deep-purple/95 backdrop-blur-md pt-16">
          <nav className="px-6 py-8 space-y-1">
            {TABS.map(({ value, label, Icon }) => {
              const active = activeTab === value;
              return (
                <button
                  key={value}
                  onClick={() => { setActiveTab(value); setMenuOpen(false); }}
                  className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all text-left ${
                    active
                      ? "bg-gold/15 text-gold border border-gold/25"
                      : "text-gold-pale/50 hover:text-gold-pale/80 hover:bg-royal-purple/30"
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="font-[family-name:var(--font-display)] text-sm tracking-[0.15em] uppercase">
                    {label}
                  </span>
                  {active && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-gold" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      )}

      <div className="px-4 sm:px-8 pt-6 max-w-6xl mx-auto">
        {/* Stats */}
        <DashboardStats />

        {/* Tabs — desktop only top bar */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Desktop tab bar */}
          <TabsList className="hidden sm:flex bg-transparent border-b border-gold/20 rounded-none w-full justify-start gap-0 h-auto p-0 mb-6">
            {TABS.map(({ value, label }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-gold data-[state=active]:text-gold text-gold-pale/50 bg-transparent font-[family-name:var(--font-body)] text-xs tracking-[0.15em] uppercase px-5 py-3 transition-colors hover:text-gold-pale/80 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="guests"><GuestListTab /></TabsContent>
          <TabsContent value="menu"><MenuTab /></TabsContent>
          <TabsContent value="tables"><TableOrdersTab /></TabsContent>
          <TabsContent value="schedule"><ScheduleTab /></TabsContent>
          <TabsContent value="settings"><SettingsTab /></TabsContent>
          <TabsContent value="trivia"><TriviaTab /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
