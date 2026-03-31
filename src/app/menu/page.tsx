import { GuestNav } from "@/components/guest-nav";
import { MenuDisplay } from "@/components/menu-display";
import { Footer } from "@/components/footer";
import { getMenuCategories } from "@/lib/actions/menu-actions";
import { getSettings } from "@/lib/actions/settings-actions";

export default async function MenuPage() {
  const [categories, settings] = await Promise.all([
    getMenuCategories(),
    getSettings(),
  ]);

  return (
    <>
      <GuestNav />
      <main className="flex-1 pt-20 pb-16">
        <div className="max-w-[900px] mx-auto px-8 py-24">
          <p className="font-[family-name:var(--font-display)] text-[0.7rem] tracking-[0.4em] uppercase text-gold text-center mb-2">
            Culinary Experience
          </p>
          <h2 className="font-[family-name:var(--font-heading)] text-[clamp(2rem,4vw,3rem)] font-light text-center text-cream mb-12">
            The Wedding <em className="italic text-gold-light">Menu</em>
          </h2>
          <MenuDisplay categories={categories} />
        </div>
      </main>
      <Footer coupleName={settings.coupleName} />
    </>
  );
}
