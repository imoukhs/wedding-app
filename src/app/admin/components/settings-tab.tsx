"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSettings, updateSettings } from "@/lib/actions/settings-actions";
import { toast } from "sonner";

export function SettingsTab() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getSettings().then(setSettings);
  }, []);

  function handleSave() {
    const formData = new FormData();
    Object.entries(settings).forEach(([key, value]) => {
      formData.set(key, value);
    });

    startTransition(async () => {
      await updateSettings(formData);
      toast.success("Settings saved");
    });
  }

  const fields = [
    { key: "coupleName", label: "Couple Names" },
    { key: "weddingDate", label: "Wedding Date (display text)" },
    { key: "venue", label: "Venue" },
    { key: "ceremonyTime", label: "Ceremony Time" },
    { key: "receptionTime", label: "Reception Time" },
  ];

  return (
    <div className="max-w-lg">
      <div className="space-y-5">
        {fields.map((field) => (
          <div key={field.key}>
            <Label className="text-[0.65rem] tracking-[0.2em] uppercase text-gold mb-1.5 block">
              {field.label}
            </Label>
            <Input
              value={settings[field.key] || ""}
              onChange={(e) => setSettings((prev) => ({ ...prev, [field.key]: e.target.value }))}
              className="bg-deep-purple/60 border-gold/25 text-cream focus:border-gold"
            />
          </div>
        ))}
      </div>

      <Button
        onClick={handleSave}
        disabled={isPending}
        className="mt-6 bg-gradient-to-r from-gold to-gold-light text-deep-purple font-[family-name:var(--font-display)] text-xs tracking-[0.2em] uppercase px-8 py-5"
      >
        {isPending ? "Saving..." : "Save Settings"}
      </Button>
    </div>
  );
}
