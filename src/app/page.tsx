import { Hero } from "@/components/hero";
import { Schedule } from "@/components/schedule";
import { Footer } from "@/components/footer";
import { GuestNav } from "@/components/guest-nav";
import { getSettings } from "@/lib/actions/settings-actions";
import { getSchedule } from "@/lib/actions/schedule-actions";

export default async function HomePage() {
  const [settings, schedule] = await Promise.all([
    getSettings(),
    getSchedule(),
  ]);

  return (
    <>
      <GuestNav />
      <main className="flex-1">
        <Hero
          coupleName={settings.coupleName || "Lauretta & Caleb"}
          weddingDate={settings.weddingDate || "SATURDAY, THE 25TH OF APRIL, 2026"}
          venue={settings.venue || "Royal Garden, Lagos"}
          ceremonyTime={settings.ceremonyTime || "2:00 PM"}
          receptionTime={settings.receptionTime || "5:00 PM"}
        />
        <Schedule events={schedule} />
      </main>
      <Footer coupleName={settings.coupleName} />
    </>
  );
}
