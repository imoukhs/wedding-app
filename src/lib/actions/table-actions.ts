"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const OrderSchema = z.object({
  personName: z.string().min(1, "Name is required"),
  menuItemId: z.string().min(1, "Please select a meal"),
});

const SubmitOrdersSchema = z.object({
  tableUniqueId: z.string(),
  orders: z.array(OrderSchema).min(1, "At least one order is required"),
});

export async function getTables() {
  return db.weddingTable.findMany({
    include: { orders: { include: { menuItem: true } } },
    orderBy: { number: "asc" },
  });
}

export async function getTablesForCaterer() {
  return db.weddingTable.findMany({
    where: { orders: { some: {} } },
    include: { orders: { include: { menuItem: { include: { category: true } } } } },
    orderBy: { number: "asc" },
  });
}

export async function getTableByUniqueId(uniqueId: string) {
  return db.weddingTable.findUnique({
    where: { uniqueId },
    include: { orders: { include: { menuItem: true } } },
  });
}

export async function addTable() {
  const maxNumber = await db.weddingTable.aggregate({ _max: { number: true } });
  const nextNumber = (maxNumber._max.number ?? 0) + 1;
  const table = await db.weddingTable.create({ data: { number: nextNumber } });
  revalidatePath("/admin");
  return table;
}

export async function deleteTable(id: string) {
  await db.weddingTable.delete({ where: { id } });
  revalidatePath("/admin");
}

export async function submitTableOrders(
  tableUniqueId: string,
  orders: { personName: string; menuItemId: string }[]
) {
  const parsed = SubmitOrdersSchema.safeParse({ tableUniqueId, orders });
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const table = await db.weddingTable.findUnique({ where: { uniqueId: tableUniqueId } });
  if (!table) return { error: "Table not found" };

  await db.$transaction(async (tx) => {
    await tx.tableOrder.deleteMany({ where: { tableId: table.id } });
    for (const order of parsed.data.orders) {
      await tx.tableOrder.create({
        data: { tableId: table.id, personName: order.personName, menuItemId: order.menuItemId },
      });
    }
    await tx.weddingTable.update({
      where: { id: table.id },
      data: { guestCount: parsed.data.orders.length },
    });
  });

  revalidatePath("/admin");
  revalidatePath("/caterer");
  return { success: true };
}

export async function markTableServed(tableId: string) {
  await db.weddingTable.update({
    where: { id: tableId },
    data: { served: true, servedAt: new Date() },
  });
  revalidatePath("/caterer");
  revalidatePath("/admin");
}

export async function unmarkTableServed(tableId: string) {
  await db.weddingTable.update({
    where: { id: tableId },
    data: { served: false, servedAt: null },
  });
  revalidatePath("/caterer");
  revalidatePath("/admin");
}
