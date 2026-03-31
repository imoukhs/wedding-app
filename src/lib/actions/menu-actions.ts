"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getMenuCategories() {
  return db.menuCategory.findMany({
    include: { items: true },
    orderBy: { order: "asc" },
  });
}

export async function addMenuCategory(formData: FormData) {
  const name = formData.get("name") as string;
  if (!name) return { error: "Name is required" };

  const maxOrder = await db.menuCategory.aggregate({ _max: { order: true } });
  await db.menuCategory.create({
    data: { name, order: (maxOrder._max.order ?? -1) + 1 },
  });

  revalidatePath("/admin");
  revalidatePath("/menu");
  return { success: true };
}

export async function updateMenuCategory(id: string, name: string) {
  await db.menuCategory.update({ where: { id }, data: { name } });
  revalidatePath("/admin");
  revalidatePath("/menu");
}

export async function deleteMenuCategory(id: string) {
  await db.menuCategory.delete({ where: { id } });
  revalidatePath("/admin");
  revalidatePath("/menu");
}

export async function addMenuItem(categoryId: string, name: string) {
  await db.menuItem.create({ data: { name, categoryId } });
  revalidatePath("/admin");
  revalidatePath("/menu");
}

export async function updateMenuItem(id: string, name: string) {
  await db.menuItem.update({ where: { id }, data: { name } });
  revalidatePath("/admin");
  revalidatePath("/menu");
}

export async function deleteMenuItem(id: string) {
  await db.menuItem.delete({ where: { id } });
  revalidatePath("/admin");
  revalidatePath("/menu");
}
