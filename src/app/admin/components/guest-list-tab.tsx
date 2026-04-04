"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getGuests,
  addGuest,
  deleteGuest,
  generateGuestCard,
  generateAllGuestCards,
} from "@/lib/actions/guest-actions";
import { toast } from "sonner";
import { Trash2, Plus, Copy, CreditCard, Sparkles } from "lucide-react";

interface Guest {
  id: string;
  name: string;
  guestCount: number;
  serial: string | null;
  cardToken: string | null;
}

export function GuestListTab() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [newName, setNewName] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    loadGuests();
  }, []);

  async function loadGuests() {
    const data = await getGuests();
    setGuests(data);
  }

  function handleAdd() {
    if (!newName.trim()) {
      toast.error("Please enter a guest name");
      return;
    }
    const formData = new FormData();
    formData.set("name", newName);
    formData.set("guestCount", "1");
    startTransition(async () => {
      try {
        const result = await addGuest(formData);
        if (result && "error" in result) {
          toast.error("Failed to add guest");
          return;
        }
        setNewName("");
        await loadGuests();
        toast.success("Guest added");
      } catch {
        toast.error("Something went wrong — please try again");
      }
    });
  }

  function handleDelete(id: string, name: string) {
    if (!confirm(`Remove ${name}?`)) return;
    startTransition(async () => {
      await deleteGuest(id);
      await loadGuests();
      toast.success("Guest removed");
    });
  }

  function copyCardLink(cardToken: string, name: string) {
    const url = `${window.location.origin}/card/${cardToken}`;

    // Try modern Clipboard API first, fall back to execCommand
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(url).then(() => {
        toast.success(`Card link copied for ${name}`);
      }).catch(() => fallbackCopy(url, name));
    } else {
      fallbackCopy(url, name);
    }
  }

  function fallbackCopy(url: string, name: string) {
    const textarea = document.createElement("textarea");
    textarea.value = url;
    textarea.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
      document.execCommand("copy");
      toast.success(`Card link copied for ${name}`);
    } catch {
      // Last resort: show the URL in a toast so they can manually copy
      toast.info(url, { description: "Long-press to copy the link", duration: 8000 });
    } finally {
      document.body.removeChild(textarea);
    }
  }

  function handleGenerateCard(id: string, name: string) {
    startTransition(async () => {
      const result = await generateGuestCard(id);
      if (result && "error" in result) {
        toast.error(result.error);
        return;
      }
      await loadGuests();
      toast.success(`Card generated for ${name}`);
    });
  }

  function handleGenerateAll() {
    const missing = guests.filter((g) => !g.cardToken).length;
    if (missing === 0) {
      toast.info("All guests already have cards");
      return;
    }
    startTransition(async () => {
      const result = await generateAllGuestCards();
      await loadGuests();
      toast.success(`Generated cards for ${result.generated} guest${result.generated === 1 ? "" : "s"}`);
    });
  }

  const missingCards = guests.filter((g) => !g.cardToken).length;

  return (
    <div>
      {/* Add guest form */}
      <div className="flex gap-3 mb-6 items-end">
        <div className="flex-1">
          <label className="text-[0.65rem] tracking-[0.2em] uppercase text-gold mb-1.5 block">Name</label>
          <Input
            placeholder="Guest name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            className="bg-deep-purple/60 border-gold/25 text-cream placeholder:text-gold-pale/30 focus:border-gold"
          />
        </div>
        <Button
          onClick={handleAdd}
          disabled={isPending}
          className="bg-gradient-to-r from-gold to-gold-light text-deep-purple font-[family-name:var(--font-display)] text-[0.7rem] tracking-[0.15em] uppercase h-10 shrink-0"
        >
          <Plus className="w-4 h-4 mr-1" /> Add Guest
        </Button>
      </div>

      {/* Generate all cards banner */}
      {missingCards > 0 && (
        <div className="flex items-center justify-between bg-gold/8 border border-gold/20 rounded-lg px-4 py-3 mb-4 gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <CreditCard className="w-4 h-4 text-gold shrink-0" />
            <p className="text-gold-pale/70 text-xs">
              <span className="text-gold font-medium">{missingCards}</span> guest{missingCards === 1 ? "" : "s"} without an access card
            </p>
          </div>
          <Button
            size="sm"
            onClick={handleGenerateAll}
            disabled={isPending}
            className="bg-gradient-to-r from-gold to-gold-light text-deep-purple font-[family-name:var(--font-display)] text-[0.6rem] tracking-[0.1em] uppercase shrink-0 h-8 px-3"
          >
            <Sparkles className="w-3 h-3 mr-1" /> Generate All
          </Button>
        </div>
      )}

      {/* ── Mobile card list ── */}
      <div className="sm:hidden space-y-2">
        {guests.length === 0 ? (
          <p className="text-center py-12 text-gold-pale/40 font-[family-name:var(--font-heading)] text-lg">
            No guests yet
          </p>
        ) : (
          guests.map((g, i) => (
            <div
              key={g.id}
              className="bg-royal-purple/30 border border-gold/15 rounded-lg p-4 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 min-w-0">
                  <span className="text-[0.6rem] text-gold-pale/40 font-mono shrink-0 mt-1">{i + 1}.</span>
                  <div className="min-w-0">
                    <p className="text-cream font-medium truncate">{g.name}</p>
                    {g.serial && (
                      <p className="text-[0.6rem] font-mono text-gold/50 mt-0.5">{g.serial}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {g.cardToken ? (
                    <button
                      onClick={() => copyCardLink(g.cardToken!, g.name)}
                      className="text-gold/50 hover:text-gold transition-colors p-1.5 bg-gold/8 rounded border border-gold/15"
                      title="Copy card link"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleGenerateCard(g.id, g.name)}
                      disabled={isPending}
                      className="text-gold-pale/40 hover:text-gold transition-colors p-1.5 bg-gold/5 rounded border border-gold/10"
                      title="Generate card"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(g.id, g.name)}
                    className="text-red-400/50 hover:text-red-400 transition-colors p-1.5"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Desktop table ── */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gold/20">
              {["#", "Name", "Serial", "Guests", "Card", ""].map((h) => (
                <th
                  key={h}
                  className="font-[family-name:var(--font-display)] text-[0.6rem] tracking-[0.2em] uppercase text-gold py-3 px-3 text-left first:w-8"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {guests.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gold-pale/40 font-[family-name:var(--font-heading)] text-lg">
                  No guests yet
                </td>
              </tr>
            ) : (
              guests.map((g, i) => (
                <tr key={g.id} className="border-b border-royal-purple/50 hover:bg-royal-purple/20 transition-colors">
                  <td className="py-3 px-3 text-gold-pale/60">{i + 1}</td>
                  <td className="py-3 px-3 text-cream">{g.name}</td>
                  <td className="py-3 px-3 font-mono text-[0.7rem] text-gold/60">
                    {g.serial ?? <span className="text-gold-pale/25">—</span>}
                  </td>
                  <td className="py-3 px-3 text-gold-pale/70">{g.guestCount}</td>
                  <td className="py-3 px-3">
                    {g.cardToken ? (
                      <button
                        onClick={() => copyCardLink(g.cardToken!, g.name)}
                        className="flex items-center gap-1.5 text-[0.65rem] text-gold/60 hover:text-gold transition-colors bg-gold/8 border border-gold/15 px-2 py-1 rounded"
                      >
                        <Copy className="w-3 h-3" /> Copy Link
                      </button>
                    ) : (
                      <button
                        onClick={() => handleGenerateCard(g.id, g.name)}
                        disabled={isPending}
                        className="flex items-center gap-1.5 text-[0.65rem] text-gold-pale/40 hover:text-gold/60 transition-colors bg-gold/5 border border-gold/10 px-2 py-1 rounded"
                      >
                        <CreditCard className="w-3 h-3" /> Generate
                      </button>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <button onClick={() => handleDelete(g.id, g.name)} className="text-red-400/60 hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
