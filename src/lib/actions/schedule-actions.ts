"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getSchedule() {
  return db.scheduleEvent.findMany({
    orderBy: { order: "asc" },
  });
}

export async function addScheduleEvent(formData: FormData) {
  const time = formData.get("time") as string;
  const event = formData.get("event") as string;
  const location = formData.get("location") as string;

  if (!time || !event) return { error: "Time and event are required" };

  const maxOrder = await db.scheduleEvent.aggregate({ _max: { order: true } });
  await db.scheduleEvent.create({
    data: {
      time,
      event,
      location: location || null,
      order: (maxOrder._max.order ?? -1) + 1,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/");
  return { success: true };
}

export async function updateScheduleEvent(
  id: string,
  data: { time?: string; event?: string; location?: string }
) {
  await db.scheduleEvent.update({ where: { id }, data });
  revalidatePath("/admin");
  revalidatePath("/");
}

export async function deleteScheduleEvent(id: string) {
  await db.scheduleEvent.delete({ where: { id } });
  revalidatePath("/admin");
  revalidatePath("/");
}
