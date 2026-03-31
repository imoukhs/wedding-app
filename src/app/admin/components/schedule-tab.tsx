"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getSchedule,
  addScheduleEvent,
  updateScheduleEvent,
  deleteScheduleEvent,
} from "@/lib/actions/schedule-actions";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

interface ScheduleEvent {
  id: string;
  time: string;
  event: string;
  location: string | null;
  order: number;
}

export function ScheduleTab() {
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    loadSchedule();
  }, []);

  async function loadSchedule() {
    const data = await getSchedule();
    setEvents(data);
  }

  function handleAdd() {
    const formData = new FormData();
    formData.set("time", "12:00 PM");
    formData.set("event", "New Event");
    formData.set("location", "Venue");
    startTransition(async () => {
      await addScheduleEvent(formData);
      await loadSchedule();
      toast.success("Event added");
    });
  }

  function handleUpdate(id: string, field: string, value: string) {
    startTransition(async () => {
      await updateScheduleEvent(id, { [field]: value });
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteScheduleEvent(id);
      await loadSchedule();
      toast.success("Event deleted");
    });
  }

  return (
    <div>
      <div className="space-y-3">
        {events.map((event) => (
          <div key={event.id} className="grid grid-cols-[100px_1fr_1fr_auto] gap-3 items-center">
            <Input
              defaultValue={event.time}
              onBlur={(e) => handleUpdate(event.id, "time", e.target.value)}
              placeholder="Time"
              className="bg-deep-purple/60 border-gold/25 text-cream focus:border-gold text-sm"
            />
            <Input
              defaultValue={event.event}
              onBlur={(e) => handleUpdate(event.id, "event", e.target.value)}
              placeholder="Event"
              className="bg-deep-purple/60 border-gold/25 text-cream focus:border-gold text-sm"
            />
            <Input
              defaultValue={event.location || ""}
              onBlur={(e) => handleUpdate(event.id, "location", e.target.value)}
              placeholder="Location"
              className="bg-deep-purple/60 border-gold/25 text-cream focus:border-gold text-sm"
            />
            <button
              onClick={() => handleDelete(event.id)}
              className="text-red-400/40 hover:text-red-400 transition-colors p-2"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <Button
        onClick={handleAdd}
        disabled={isPending}
        className="mt-4 bg-gradient-to-r from-gold to-gold-light text-deep-purple font-[family-name:var(--font-display)] text-[0.7rem] tracking-[0.15em] uppercase"
      >
        <Plus className="w-4 h-4 mr-1" /> Add Event
      </Button>
    </div>
  );
}
