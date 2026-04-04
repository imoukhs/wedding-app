import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getGuestByCardToken } from "@/lib/actions/guest-actions";
import { CardView } from "./card-view";

export const dynamic = "force-dynamic";

async function getSettings() {
  const rows = await db.setting.findMany();
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return {
    coupleName: map.coupleName || "Lauretta Ojo & Caleb Kadiri",
    weddingDate: map.weddingDate || "Saturday, 25th April, 2026",
    venue: map.venue || "Royal Gardens, Lagos",
  };
}

export default async function CardPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const [guest, settings] = await Promise.all([
    getGuestByCardToken(token),
    getSettings(),
  ]);

  if (!guest) notFound();

  return (
    <CardView
      token={token}
      guest={guest}
      settings={settings}
    />
  );
}
