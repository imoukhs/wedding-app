"use client";

import { motion } from "framer-motion";

interface MenuCategory {
  id: string;
  name: string;
  items: { id: string; name: string }[];
}

export function MenuDisplay({ categories }: { categories: MenuCategory[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {categories.map((cat, i) => (
        <motion.div
          key={cat.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: i * 0.1 }}
          className="relative bg-royal-purple/30 border border-gold/15 p-8 overflow-hidden"
        >
          {/* Top gold line */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent" />

          <h3 className="font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.3em] uppercase text-gold mb-5">
            {cat.name}
          </h3>

          <ul className="space-y-0">
            {cat.items.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-3 py-3 border-b border-gold/10 last:border-b-0 font-[family-name:var(--font-heading)] text-lg text-cream"
              >
                <span className="text-gold text-[0.4rem] flex-shrink-0">&#9670;</span>
                {item.name}
              </li>
            ))}
          </ul>
        </motion.div>
      ))}
    </div>
  );
}
