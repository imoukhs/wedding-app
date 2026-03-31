"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { submitTableOrders } from "@/lib/actions/table-actions";
import { toast } from "sonner";
import { Check, ChevronLeft, ChevronRight, Utensils, Users } from "lucide-react";

interface MenuCategory {
  id: string;
  name: string;
  items: { id: string; name: string }[];
}

interface OrderFormProps {
  tableUniqueId: string;
  tableNumber: number;
  categories: MenuCategory[];
  existingOrders: { personName: string; menuItemId: string }[];
}

export function OrderForm({ tableUniqueId, tableNumber, categories, existingOrders }: OrderFormProps) {
  const [step, setStep] = useState(existingOrders.length > 0 ? 0 : 1);
  const [guestCount, setGuestCount] = useState(1);
  const [menuSelections, setMenuSelections] = useState<string[]>([""]);
  const [isPending, startTransition] = useTransition();

  const allItems = categories.flatMap((c) => c.items);

  function handleCountSubmit() {
    setMenuSelections(Array.from({ length: guestCount }, () => ""));
    setStep(2);
  }

  function updateSelection(index: number, menuItemId: string) {
    setMenuSelections((prev) => {
      const next = [...prev];
      next[index] = menuItemId;
      return next;
    });
  }

  function handleReview() {
    const incomplete = menuSelections.some((id) => !id);
    if (incomplete) {
      toast.error("Please select a meal for everyone");
      return;
    }
    setStep(3);
  }

  function handleSubmit() {
    startTransition(async () => {
      const orders = menuSelections.map((menuItemId, i) => ({
        personName: `Person ${i + 1}`,
        menuItemId,
      }));
      const result = await submitTableOrders(tableUniqueId, orders);
      if (result && "error" in result) {
        toast.error("Failed to submit orders. Please try again.");
      } else {
        setStep(4);
      }
    });
  }

  // Already ordered state
  if (step === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto mb-6">
          <Check className="w-8 h-8 text-gold" />
        </div>
        <h3 className="font-[family-name:var(--font-heading)] text-2xl text-cream mb-2">
          Orders Already Placed
        </h3>
        <p className="text-gold-pale/60 mb-6">
          Table {tableNumber} has {existingOrders.length} order(s) placed.
        </p>
        <Button
          onClick={() => setStep(1)}
          className="bg-gradient-to-r from-gold to-gold-light text-deep-purple font-[family-name:var(--font-display)] text-xs tracking-[0.2em] uppercase px-8 py-5 hover:shadow-lg hover:shadow-gold/30 transition-all"
        >
          Update Orders
        </Button>
      </div>
    );
  }

  // Step 1: Guest count (max 10)
  if (step === 1) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto mb-6">
          <Users className="w-8 h-8 text-gold" />
        </div>
        <h3 className="font-[family-name:var(--font-heading)] text-2xl text-cream mb-2">
          How many people at this table?
        </h3>
        <p className="text-gold-pale/60 mb-8">Table {tableNumber}</p>

        <div className="flex items-center justify-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
            className="border-gold/30 text-gold hover:bg-gold/10 h-12 w-12"
          >
            -
          </Button>
          <span className="font-[family-name:var(--font-heading)] text-5xl text-cream w-20 text-center">
            {guestCount}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setGuestCount(Math.min(10, guestCount + 1))}
            className="border-gold/30 text-gold hover:bg-gold/10 h-12 w-12"
          >
            +
          </Button>
        </div>

        <Button
          onClick={handleCountSubmit}
          className="bg-gradient-to-r from-gold to-gold-light text-deep-purple font-[family-name:var(--font-display)] text-xs tracking-[0.2em] uppercase px-8 py-5 hover:shadow-lg hover:shadow-gold/30 transition-all"
        >
          Continue <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    );
  }

  // Step 2: Pick meals (no name input)
  if (step === 2) {
    return (
      <div>
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => setStep(1)}
            className="text-gold-pale/60 hover:text-gold"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <p className="text-gold-pale/60 text-sm">
            {menuSelections.length} {menuSelections.length === 1 ? "person" : "people"}
          </p>
        </div>

        <div className="space-y-6">
          {menuSelections.map((selectedId, i) => (
            <div
              key={i}
              className="bg-royal-purple/20 border border-gold/15 p-6 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent" />
              <p className="font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.3em] uppercase text-gold mb-4">
                Person {i + 1}
              </p>

              <label className="text-[0.7rem] tracking-[0.2em] uppercase text-gold mb-2 block">
                Meal Choice
              </label>
              <select
                value={selectedId}
                onChange={(e) => updateSelection(i, e.target.value)}
                className="w-full bg-deep-purple/60 border border-gold/25 text-cream py-3 px-4 text-sm outline-none transition-colors focus:border-gold appearance-none rounded-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23c9a227' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}
              >
                <option value="" disabled className="bg-deep-purple text-gold-pale/50">
                  Select a meal
                </option>
                {categories.map((cat) => (
                  <optgroup key={cat.id} label={cat.name} className="bg-deep-purple text-cream">
                    {cat.items.map((item) => (
                      <option key={item.id} value={item.id} className="bg-deep-purple text-cream">
                        {item.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          ))}
        </div>

        <Button
          onClick={handleReview}
          className="w-full mt-8 bg-gradient-to-r from-gold to-gold-light text-deep-purple font-[family-name:var(--font-display)] text-xs tracking-[0.2em] uppercase py-5 hover:shadow-lg hover:shadow-gold/30 transition-all"
        >
          Review Orders <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    );
  }

  // Step 3: Review
  if (step === 3) {
    return (
      <div>
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => setStep(2)}
            className="text-gold-pale/60 hover:text-gold"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Edit
          </Button>
          <p className="font-[family-name:var(--font-display)] text-[0.7rem] tracking-[0.3em] uppercase text-gold">
            Review
          </p>
        </div>

        <div className="space-y-3 mb-8">
          {menuSelections.map((menuItemId, i) => {
            const item = allItems.find((it) => it.id === menuItemId);
            return (
              <div
                key={i}
                className="flex items-center justify-between py-3 border-b border-gold/10 last:border-b-0"
              >
                <p className="text-cream font-[family-name:var(--font-heading)] text-lg">
                  Person {i + 1}
                </p>
                <p className="text-gold-pale/70 text-sm">{item?.name || "—"}</p>
              </div>
            );
          })}
        </div>

        <Button
          onClick={handleSubmit}
          disabled={isPending}
          className="w-full bg-gradient-to-r from-gold to-gold-light text-deep-purple font-[family-name:var(--font-display)] text-xs tracking-[0.2em] uppercase py-5 hover:shadow-lg hover:shadow-gold/30 transition-all disabled:opacity-50"
        >
          {isPending ? "Submitting..." : "Confirm Orders"}
        </Button>
      </div>
    );
  }

  // Step 4: Success
  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto mb-6">
        <Utensils className="w-8 h-8 text-gold" />
      </div>
      <div className="text-gold text-xl mb-2">&#10022; &#10022; &#10022;</div>
      <h3 className="font-[family-name:var(--font-heading)] text-3xl text-gold-light mb-2">
        Orders Placed!
      </h3>
      <p className="text-gold-pale/70">
        Table {tableNumber}&apos;s meal choices have been submitted. Enjoy the celebration!
      </p>
    </div>
  );
}
