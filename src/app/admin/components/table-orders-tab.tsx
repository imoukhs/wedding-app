"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { getTables, addTable, deleteTable } from "@/lib/actions/table-actions";
import { toast } from "sonner";
import { Plus, Trash2, QrCode, Utensils, Users } from "lucide-react";
import { QrGenerator } from "./qr-generator";

interface TableOrder {
  id: string;
  personName: string;
  menuItem: { id: string; name: string };
}

interface WeddingTable {
  id: string;
  number: number;
  uniqueId: string;
  guestCount: number;
  orders: TableOrder[];
}

export function TableOrdersTab() {
  const [tables, setTables] = useState<WeddingTable[]>([]);
  const [showQr, setShowQr] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    loadTables();
  }, []);

  async function loadTables() {
    const data = await getTables();
    setTables(data);
  }

  function handleAddTable() {
    startTransition(async () => {
      await addTable();
      await loadTables();
      toast.success("Table added");
    });
  }

  function handleDeleteTable(id: string, number: number) {
    if (!confirm(`Delete Table ${number} and all its orders?`)) return;
    startTransition(async () => {
      await deleteTable(id);
      await loadTables();
      toast.success("Table deleted");
    });
  }

  if (showQr) {
    return (
      <div>
        <Button
          variant="ghost"
          onClick={() => setShowQr(false)}
          className="text-gold-pale/60 hover:text-gold mb-4"
        >
          &larr; Back to Tables
        </Button>
        <QrGenerator tables={tables} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Button
          onClick={handleAddTable}
          disabled={isPending}
          className="bg-gradient-to-r from-gold to-gold-light text-deep-purple font-[family-name:var(--font-display)] text-[0.7rem] tracking-[0.15em] uppercase"
        >
          <Plus className="w-4 h-4 mr-1" /> Add Table
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowQr(true)}
          className="border-gold/30 text-gold hover:bg-gold/10 font-[family-name:var(--font-display)] text-[0.7rem] tracking-[0.15em] uppercase"
        >
          <QrCode className="w-4 h-4 mr-1" /> QR Codes
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tables.map((table) => (
          <div key={table.id} className="bg-royal-purple/30 border border-gold/15 p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent" />

            <div className="flex items-center justify-between mb-3">
              <h3 className="font-[family-name:var(--font-display)] text-xs tracking-[0.2em] uppercase text-gold">
                Table {table.number}
              </h3>
              <button
                onClick={() => handleDeleteTable(table.id, table.number)}
                className="text-red-400/40 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-4 mb-3 text-sm">
              <span className="flex items-center gap-1 text-gold-pale/60">
                <Users className="w-3.5 h-3.5" /> {table.guestCount}
              </span>
              <span className="flex items-center gap-1 text-gold-pale/60">
                <Utensils className="w-3.5 h-3.5" /> {table.orders.length} orders
              </span>
            </div>

            {table.orders.length > 0 ? (
              <div className="space-y-1.5">
                {table.orders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between text-sm border-b border-gold/5 pb-1.5 last:border-b-0">
                    <span className="text-cream">{order.personName}</span>
                    <span className="text-gold-pale/50 text-xs">{order.menuItem.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gold-pale/30 text-sm italic">No orders yet</p>
            )}
          </div>
        ))}
      </div>

      {tables.length === 0 && (
        <p className="text-center py-12 text-gold-pale/40 font-[family-name:var(--font-heading)] text-lg">
          No tables created yet
        </p>
      )}
    </div>
  );
}
