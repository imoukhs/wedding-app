"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updatePassword } from "@/lib/actions/settings-actions";
import { toast } from "sonner";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";

interface PasswordSectionProps {
  label: string;
  description: string;
  passwordKey: "adminPassword" | "bouncerPin" | "catererPin";
  inputMode?: "text" | "numeric";
}

function PasswordSection({ label, description, passwordKey, inputMode = "text" }: PasswordSectionProps) {
  const [value, setValue] = useState("");
  const [show, setShow] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    if (!value.trim()) {
      toast.error("Please enter a new password");
      return;
    }
    startTransition(async () => {
      const result = await updatePassword(passwordKey, value.trim());
      if (result && "error" in result) {
        toast.error(result.error as string);
        return;
      }
      setValue("");
      toast.success(`${label} updated`);
    });
  }

  return (
    <div className="bg-royal-purple/20 border border-gold/15 rounded-lg p-5 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
      <div className="mb-4">
        <p className="font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.2em] uppercase text-gold mb-0.5">
          {label}
        </p>
        <p className="text-gold-pale/40 text-xs">{description}</p>
      </div>
      <div className="flex gap-3 items-center">
        <div className="relative flex-1">
          <Input
            type={show ? "text" : "password"}
            inputMode={inputMode}
            placeholder="New password"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            className="bg-deep-purple/60 border-gold/25 text-cream placeholder:text-gold-pale/30 focus:border-gold pr-10"
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gold-pale/50 hover:text-gold transition-colors"
            tabIndex={-1}
          >
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <Button
          onClick={handleSave}
          disabled={isPending}
          className="bg-gradient-to-r from-gold to-gold-light text-deep-purple font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.15em] uppercase shrink-0 h-10"
        >
          {isPending ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}

export function SecurityTab() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <ShieldCheck className="w-4 h-4 text-gold" />
        <h2 className="font-[family-name:var(--font-display)] text-[0.7rem] tracking-[0.2em] uppercase text-gold">
          Access Passwords
        </h2>
      </div>
      <div className="space-y-4">
        <PasswordSection
          label="Admin Password"
          description="Password to access the admin panel"
          passwordKey="adminPassword"
        />
        <PasswordSection
          label="Bouncer PIN"
          description="PIN for the door check-in screen"
          passwordKey="bouncerPin"
          inputMode="numeric"
        />
        <PasswordSection
          label="Caterer PIN"
          description="PIN for the kitchen orders screen"
          passwordKey="catererPin"
          inputMode="numeric"
        />
      </div>
      <p className="text-gold-pale/30 text-xs mt-6 text-center">
        Changes take effect immediately on all devices
      </p>
    </div>
  );
}
