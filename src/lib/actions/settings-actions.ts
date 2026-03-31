"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getSettings(): Promise<Record<string, string>> {
  const settings = await db.setting.findMany();
  const map: Record<string, string> = {};
  for (const s of settings) {
    map[s.key] = s.value;
  }
  return map;
}

export async function updateSettings(formData: FormData) {
  const keys = ["coupleName", "weddingDate", "venue", "ceremonyTime", "receptionTime"];

  for (const key of keys) {
    const value = formData.get(key) as string;
    if (value !== null && value !== undefined) {
      await db.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    }
  }

  revalidatePath("/");
  revalidatePath("/admin");
  return { success: true };
}
