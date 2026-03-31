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
import { Lock, ArrowLeft } from "lucide-react";
import Link from "next/link";

export function AdminPanel() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleLogin() {
    startTransition(async () => {
      const valid = await verifyAdminPassword(password);
      if (valid) {
        setAuthenticated(true);
        setError(false);
      } else {
        setError(true);
      }
    });
  }

  // Login gate
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

            {error && (
              <p className="text-destructive text-sm text-center mb-4">Incorrect password</p>
            )}

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

  // Admin dashboard
  return (
    <div className="min-h-screen px-4 sm:px-8 pt-8 pb-12 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gold/20 flex-wrap gap-4">
        <h1 className="font-[family-name:var(--font-display)] text-lg tracking-[0.2em] text-gold-light">
          WEDDING ADMIN
        </h1>
        <Link href="/">
          <Button
            variant="outline"
            className="border-gold/30 text-gold hover:bg-gold/10 font-[family-name:var(--font-display)] text-[0.7rem] tracking-[0.15em]"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Invitation
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <DashboardStats />

      {/* Tabs */}
      <Tabs defaultValue="guests">
        <TabsList className="bg-transparent border-b border-gold/20 rounded-none w-full justify-start gap-0 h-auto p-0 mb-6">
          {[
            { value: "guests", label: "Guest List" },
            { value: "menu", label: "Menu" },
            { value: "tables", label: "Table Orders" },
            { value: "schedule", label: "Schedule" },
            { value: "settings", label: "Settings" },
            { value: "trivia", label: "Trivia" },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-gold data-[state=active]:text-gold text-gold-pale/50 bg-transparent font-[family-name:var(--font-body)] text-xs tracking-[0.15em] uppercase px-4 sm:px-6 py-3 transition-colors hover:text-gold-pale/80 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              {tab.label}
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
  );
}
