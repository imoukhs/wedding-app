"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getMenuCategories,
  addMenuCategory,
  updateMenuCategory,
  deleteMenuCategory,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from "@/lib/actions/menu-actions";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

interface MenuItem {
  id: string;
  name: string;
}

interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
}

export function MenuTab() {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    loadMenu();
  }, []);

  async function loadMenu() {
    const data = await getMenuCategories();
    setCategories(data);
  }

  function handleAddCategory() {
    const formData = new FormData();
    formData.set("name", "New Category");
    startTransition(async () => {
      await addMenuCategory(formData);
      await loadMenu();
      toast.success("Category added");
    });
  }

  function handleUpdateCategory(id: string, name: string) {
    startTransition(async () => {
      await updateMenuCategory(id, name);
    });
  }

  function handleDeleteCategory(id: string) {
    if (!confirm("Delete this category and all its items?")) return;
    startTransition(async () => {
      await deleteMenuCategory(id);
      await loadMenu();
      toast.success("Category deleted");
    });
  }

  function handleAddItem(categoryId: string) {
    startTransition(async () => {
      await addMenuItem(categoryId, "New Item");
      await loadMenu();
    });
  }

  function handleUpdateItem(id: string, name: string) {
    startTransition(async () => {
      await updateMenuItem(id, name);
    });
  }

  function handleDeleteItem(id: string) {
    startTransition(async () => {
      await deleteMenuItem(id);
      await loadMenu();
    });
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-royal-purple/30 border border-gold/15 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Input
                defaultValue={cat.name}
                onBlur={(e) => handleUpdateCategory(cat.id, e.target.value)}
                className="bg-deep-purple/60 border-gold/25 text-cream focus:border-gold flex-1 font-[family-name:var(--font-display)] text-xs tracking-[0.15em] uppercase"
              />
              <button
                onClick={() => handleDeleteCategory(cat.id)}
                className="text-red-400/60 hover:text-red-400 transition-colors p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              {cat.items.map((item) => (
                <div key={item.id} className="flex items-center gap-2">
                  <Input
                    defaultValue={item.name}
                    onBlur={(e) => handleUpdateItem(item.id, e.target.value)}
                    className="bg-deep-purple/60 border-gold/20 text-cream focus:border-gold text-sm"
                  />
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="text-red-400/40 hover:text-red-400 transition-colors p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAddItem(cat.id)}
              disabled={isPending}
              className="mt-3 w-full border-gold/20 text-gold hover:bg-gold/10 text-xs"
            >
              <Plus className="w-3 h-3 mr-1" /> Item
            </Button>
          </div>
        ))}
      </div>

      <Button
        onClick={handleAddCategory}
        disabled={isPending}
        className="mt-4 bg-gradient-to-r from-gold to-gold-light text-deep-purple font-[family-name:var(--font-display)] text-[0.7rem] tracking-[0.15em] uppercase"
      >
        <Plus className="w-4 h-4 mr-1" /> Add Category
      </Button>
    </div>
  );
}
