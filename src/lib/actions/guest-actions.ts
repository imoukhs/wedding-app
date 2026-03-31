"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const AddGuestSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  guestCount: z.coerce.number().int().min(1).default(1),
  notes: z.string().optional().or(z.literal("")),
});

export async function getGuests() {
  return db.guest.findMany({ orderBy: { createdAt: "desc" } });
}

export async function getGuestStats() {
  const guests = await db.guest.findMany();
  const total = guests.length;
  const totalGuests = guests.reduce((sum, g) => sum + (g.guestCount || 1), 0);
  const flagged = guests.filter((g) => g.flaggedByBouncer).length;
  return { total, attending: total, declined: 0, pending: 0, totalGuests, flagged };
}

export async function addGuest(formData: FormData) {
  const raw = {
    name: (formData.get("name") as string) || "",
    email: (formData.get("email") as string) || "",
    phone: (formData.get("phone") as string) || "",
    guestCount: (formData.get("guestCount") as string) || "1",
    notes: (formData.get("notes") as string) || "",
  };

  const parsed = AddGuestSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  await db.guest.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      status: "attending",
      guestCount: parsed.data.guestCount,
      notes: parsed.data.notes || null,
    },
  });

  revalidatePath("/admin");
  return { success: true };
}

export async function updateGuestStatus(id: string, status: string) {
  await db.guest.update({ where: { id }, data: { status } });
  revalidatePath("/admin");
  revalidatePath("/bouncer");
}

export async function deleteGuest(id: string) {
  await db.guest.delete({ where: { id } });
  revalidatePath("/admin");
}

export async function flagGuest(id: string, flagged: boolean) {
  await db.guest.update({ where: { id }, data: { flaggedByBouncer: flagged } });
  revalidatePath("/bouncer");
  revalidatePath("/admin");
}

export async function checkInGuest(id: string, checkedIn: boolean) {
  await db.guest.update({
    where: { id },
    data: { checkedIn, checkedInAt: checkedIn ? new Date() : null },
  });
  revalidatePath("/bouncer");
  revalidatePath("/admin");
}
