"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { getGuests, addGuest, deleteGuest, updateGuestStatus } from "@/lib/actions/guest-actions";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";

interface Guest {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: string;
  mealPreference: string | null;
  guestCount: number;
  notes: string | null;
  hasAccessCard: boolean;
  flaggedByBouncer: boolean;
}

export function GuestListTab() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [newName, setNewName] = useState("");
  const [newStatus, setNewStatus] = useState("pending");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    loadGuests();
  }, []);

  async function loadGuests() {
    const data = await getGuests();
    setGuests(data);
  }

  function handleAdd() {
    if (!newName.trim()) return;
    const formData = new FormData();
    formData.set("name", newName);
    formData.set("status", newStatus);
    formData.set("guestCount", "1");

    startTransition(async () => {
      await addGuest(formData);
      setNewName("");
      await loadGuests();
      toast.success("Guest added");
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

  function handleStatusChange(id: string, status: string) {
    startTransition(async () => {
      await updateGuestStatus(id, status);
      await loadGuests();
    });
  }

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      attending: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
      declined: "bg-red-500/15 text-red-400 border-red-500/30",
      pending: "bg-gold/15 text-gold border-gold/30",
    };
    return styles[status] || styles.pending;
  };

  return (
    <div>
      {/* Add guest form */}
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_150px_auto] gap-3 mb-6 items-end">
        <div>
          <label className="text-[0.65rem] tracking-[0.2em] uppercase text-gold mb-1.5 block">Name</label>
          <Input
            placeholder="Guest name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            className="bg-deep-purple/60 border-gold/25 text-cream placeholder:text-gold-pale/30 focus:border-gold"
          />
        </div>
        <div>
          <label className="text-[0.65rem] tracking-[0.2em] uppercase text-gold mb-1.5 block">Status</label>
          <Select value={newStatus} onValueChange={(val) => val && setNewStatus(val)}>
            <SelectTrigger className="bg-deep-purple/60 border-gold/25 text-cream focus:border-gold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-deep-purple border-gold/25">
              <SelectItem value="pending" className="text-cream focus:bg-royal-purple/50 focus:text-cream">Pending</SelectItem>
              <SelectItem value="attending" className="text-cream focus:bg-royal-purple/50 focus:text-cream">Attending</SelectItem>
              <SelectItem value="declined" className="text-cream focus:bg-royal-purple/50 focus:text-cream">Declined</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={handleAdd}
          disabled={isPending}
          className="bg-gradient-to-r from-gold to-gold-light text-deep-purple font-[family-name:var(--font-display)] text-[0.7rem] tracking-[0.15em] uppercase h-10"
        >
          <Plus className="w-4 h-4 mr-1" /> Add
        </Button>
      </div>

      {/* Guest table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gold/20">
              <th className="font-[family-name:var(--font-display)] text-[0.6rem] tracking-[0.2em] uppercase text-gold py-3 px-3 text-left">#</th>
              <th className="font-[family-name:var(--font-display)] text-[0.6rem] tracking-[0.2em] uppercase text-gold py-3 px-3 text-left">Name</th>
              <th className="font-[family-name:var(--font-display)] text-[0.6rem] tracking-[0.2em] uppercase text-gold py-3 px-3 text-left hidden sm:table-cell">Email</th>
              <th className="font-[family-name:var(--font-display)] text-[0.6rem] tracking-[0.2em] uppercase text-gold py-3 px-3 text-left hidden md:table-cell">Phone</th>
              <th className="font-[family-name:var(--font-display)] text-[0.6rem] tracking-[0.2em] uppercase text-gold py-3 px-3 text-left">Status</th>
              <th className="font-[family-name:var(--font-display)] text-[0.6rem] tracking-[0.2em] uppercase text-gold py-3 px-3 text-left hidden lg:table-cell">Guests</th>
              <th className="font-[family-name:var(--font-display)] text-[0.6rem] tracking-[0.2em] uppercase text-gold py-3 px-3 text-left hidden lg:table-cell">Flagged</th>
              <th className="py-3 px-3"></th>
            </tr>
          </thead>
          <tbody>
            {guests.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-gold-pale/40 font-[family-name:var(--font-heading)] text-lg">
                  No guests yet
                </td>
              </tr>
            ) : (
              guests.map((g, i) => (
                <tr key={g.id} className="border-b border-royal-purple/50 hover:bg-royal-purple/20 transition-colors">
                  <td className="py-3 px-3 text-gold-pale/60">{i + 1}</td>
                  <td className="py-3 px-3 text-cream">{g.name}</td>
                  <td className="py-3 px-3 text-gold-pale/70 hidden sm:table-cell">{g.email || "—"}</td>
                  <td className="py-3 px-3 text-gold-pale/70 hidden md:table-cell">{g.phone || "—"}</td>
                  <td className="py-3 px-3">
                    <Select value={g.status} onValueChange={(val) => val && handleStatusChange(g.id, val)}>
                      <SelectTrigger className="border-0 bg-transparent p-0 h-auto w-auto">
                        <Badge className={`${statusBadge(g.status)} text-[0.6rem] tracking-wider uppercase cursor-pointer`}>
                          {g.status}
                        </Badge>
                      </SelectTrigger>
                      <SelectContent className="bg-deep-purple border-gold/25">
                        <SelectItem value="pending" className="text-cream focus:bg-royal-purple/50 focus:text-cream">Pending</SelectItem>
                        <SelectItem value="attending" className="text-cream focus:bg-royal-purple/50 focus:text-cream">Attending</SelectItem>
                        <SelectItem value="declined" className="text-cream focus:bg-royal-purple/50 focus:text-cream">Declined</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="py-3 px-3 text-gold-pale/70 hidden lg:table-cell">{g.guestCount}</td>
                  <td className="py-3 px-3 hidden lg:table-cell">
                    {g.flaggedByBouncer && <Badge className="bg-red-500/15 text-red-400 border-red-500/30 text-[0.55rem]">No Card</Badge>}
                  </td>
                  <td className="py-3 px-3">
                    <button
                      onClick={() => handleDelete(g.id, g.name)}
                      className="text-red-400/60 hover:text-red-400 transition-colors"
                    >
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
