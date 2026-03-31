"use server";

import { db } from "@/lib/db";

async function getSetting(key: string): Promise<string | null> {
  const s = await db.setting.findUnique({ where: { key } });
  return s?.value ?? null;
}

export async function verifyBouncerPin(pin: string): Promise<boolean> {
  const stored = (await getSetting("bouncerPin")) ?? process.env.BOUNCER_PIN;
  return pin === stored;
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  const stored = (await getSetting("adminPassword")) ?? process.env.ADMIN_PASSWORD;
  return password === stored;
}

export async function verifyCatererPin(pin: string): Promise<boolean> {
  const stored = (await getSetting("catererPin")) ?? process.env.CATERER_PIN;
  return pin === stored;
}
