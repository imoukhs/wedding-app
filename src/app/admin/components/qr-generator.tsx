"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import QRCode from "qrcode";
import { Download } from "lucide-react";

interface WeddingTable {
  id: string;
  number: number;
  uniqueId: string;
}

export function QrGenerator({ tables }: { tables: WeddingTable[] }) {
  const [qrCodes, setQrCodes] = useState<Record<string, string>>({});
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  useEffect(() => {
    async function generateAll() {
      const codes: Record<string, string> = {};
      for (const table of tables) {
        const url = `${baseUrl}/table/${table.uniqueId}`;
        codes[table.id] = await QRCode.toDataURL(url, {
          width: 300,
          margin: 2,
          color: {
            dark: "#1a0533",
            light: "#fdf8f0",
          },
        });
      }
      setQrCodes(codes);
    }
    if (baseUrl) generateAll();
  }, [tables, baseUrl]);

  function downloadQr(tableNumber: number, dataUrl: string) {
    const link = document.createElement("a");
    link.download = `table-${tableNumber}-qr.png`;
    link.href = dataUrl;
    link.click();
  }

  async function downloadAll() {
    for (const table of tables) {
      const dataUrl = qrCodes[table.id];
      if (dataUrl) {
        downloadQr(table.number, dataUrl);
        await new Promise((r) => setTimeout(r, 200)); // Small delay between downloads
      }
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-[family-name:var(--font-display)] text-sm tracking-[0.2em] uppercase text-gold-light">
          Table QR Codes
        </h3>
        <Button
          onClick={downloadAll}
          variant="outline"
          className="border-gold/30 text-gold hover:bg-gold/10 text-xs"
        >
          <Download className="w-3.5 h-3.5 mr-1" /> Download All
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {tables.map((table) => (
          <div key={table.id} className="bg-royal-purple/20 border border-gold/15 p-4 text-center">
            <p className="font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.3em] uppercase text-gold mb-3">
              Table {table.number}
            </p>

            {qrCodes[table.id] ? (
              <img
                src={qrCodes[table.id]}
                alt={`QR code for Table ${table.number}`}
                className="w-full max-w-[200px] mx-auto mb-3 rounded"
              />
            ) : (
              <div className="w-[200px] h-[200px] mx-auto mb-3 bg-deep-purple/40 animate-pulse" />
            )}

            <p className="text-[0.6rem] text-gold-pale/40 mb-3 break-all">
              /table/{table.uniqueId}
            </p>

            <Button
              variant="outline"
              size="sm"
              onClick={() => qrCodes[table.id] && downloadQr(table.number, qrCodes[table.id])}
              className="border-gold/20 text-gold hover:bg-gold/10 text-xs w-full"
            >
              <Download className="w-3 h-3 mr-1" /> Download
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
