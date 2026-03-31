"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getGuests, addGuest, deleteGuest } from "@/lib/actions/guest-actions";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";

interface Guest {
  id: string;
  name: string;
  guestCount: number;
}

export function GuestListTab() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [newName, setNewName] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => { loadGuests(); }, []);

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

              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[0.6rem] text-gold-pale/40 font-mono shrink-0">{i + 1}.</span>
                  <span className="text-cream font-medium truncate">{g.name}</span>
                  <span className="text-[0.6rem] text-gold-pale/35 shrink-0">
                    · {g.guestCount} {g.guestCount === 1 ? "person" : "people"}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(g.id, g.name)}
                  className="text-red-400/50 hover:text-red-400 transition-colors shrink-0 p-1.5 -mr-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
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
              {["#", "Name", "Guests", ""].map((h) => (
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
                <td colSpan={4} className="text-center py-12 text-gold-pale/40 font-[family-name:var(--font-heading)] text-lg">
                  No guests yet
                </td>
              </tr>
            ) : (
              guests.map((g, i) => (
                <tr key={g.id} className="border-b border-royal-purple/50 hover:bg-royal-purple/20 transition-colors">
                  <td className="py-3 px-3 text-gold-pale/60">{i + 1}</td>
                  <td className="py-3 px-3 text-cream">{g.name}</td>
                  <td className="py-3 px-3 text-gold-pale/70">{g.guestCount}</td>
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
