"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { randomUUID } from "crypto";

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

  // Auto-assign serial: count existing guests with a serial, increment
  const existingCount = await db.guest.count({ where: { serial: { not: null } } });
  const serial = `LK2026-${String(existingCount + 1).padStart(3, "0")}`;
  const cardToken = randomUUID();

  await db.guest.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      status: "attending",
      guestCount: parsed.data.guestCount,
      notes: parsed.data.notes || null,
      serial,
      cardToken,
    },
  });

  revalidatePath("/admin");
  return { success: true };
}

export async function generateGuestCard(id: string) {
  const guest = await db.guest.findUnique({ where: { id } });
  if (!guest) return { error: "Guest not found" };
  if (guest.cardToken) return { error: "Card already generated" };

  const count = await db.guest.count({ where: { serial: { not: null } } });
  const serial = `LK2026-${String(count + 1).padStart(3, "0")}`;
  const cardToken = randomUUID();

  await db.guest.update({ where: { id }, data: { serial, cardToken } });
  revalidatePath("/admin");
  return { success: true, serial, cardToken };
}

export async function generateAllGuestCards() {
  const guests = await db.guest.findMany({ where: { cardToken: null } });
  let counter = await db.guest.count({ where: { serial: { not: null } } });

  for (const guest of guests) {
    counter++;
    await db.guest.update({
      where: { id: guest.id },
      data: {
        serial: `LK2026-${String(counter).padStart(3, "0")}`,
        cardToken: randomUUID(),
      },
    });
  }

  revalidatePath("/admin");
  return { success: true, generated: guests.length };
}

// ── Card validation ──────────────────────────────────────────────

export async function getGuestByCardToken(token: string) {
  return db.guest.findUnique({
    where: { cardToken: token },
    select: {
      id: true,
      name: true,
      serial: true,
      cardViewed: true,
      deviceToken: true,
    },
  });
}

export async function activateCard(token: string): Promise<string | null> {
  const guest = await db.guest.findUnique({ where: { cardToken: token } });
  if (!guest) return null;
  if (guest.cardViewed) return null; // race: already activated

  const deviceToken = randomUUID();
  await db.guest.update({
    where: { cardToken: token },
    data: { cardViewed: true, deviceToken },
  });
  return deviceToken;
}

export async function validateCard(token: string, deviceToken: string): Promise<boolean> {
  const guest = await db.guest.findUnique({ where: { cardToken: token } });
  if (!guest) return false;
  return guest.deviceToken === deviceToken;
}

// ── Existing actions ─────────────────────────────────────────────

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
