import { notFound } from "next/navigation";
import { getTableByUniqueId } from "@/lib/actions/table-actions";
import { getMenuCategories } from "@/lib/actions/menu-actions";
import { OrderForm } from "./order-form";

export default async function TableOrderPage({
  params,
}: {
  params: Promise<{ tableId: string }>;
}) {
  const { tableId } = await params;
  const [table, categories] = await Promise.all([
    getTableByUniqueId(tableId),
    getMenuCategories(),
  ]);

  if (!table) notFound();

  const existingOrders = table.orders.map((o) => ({
    personName: o.personName,
    menuItemId: o.menuItemId,
  }));

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      {/* Background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(107,33,168,0.4)_0%,transparent_70%)] pointer-events-none" />

      <div className="relative w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="font-[family-name:var(--font-display)] text-[0.7rem] tracking-[0.4em] uppercase text-gold mb-2">
            {table.section ? `${table.section} · ` : ""}Table {table.number}
          </p>
          <h1 className="font-[family-name:var(--font-heading)] text-[clamp(2rem,5vw,3rem)] font-light text-cream">
            Place Your <em className="italic text-gold-light">Order</em>
          </h1>
        </div>

        {/* Form container */}
        <div className="bg-royal-purple/25 border border-gold/20 p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent" />
          <OrderForm
            tableUniqueId={table.uniqueId}
            tableNumber={table.number}
            categories={categories}
            existingOrders={existingOrders}
          />
        </div>
      </div>
    </main>
  );
}
