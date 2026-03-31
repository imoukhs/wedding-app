"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { isTriviaOpen } from "@/lib/actions/trivia-actions";

export function GuestNav() {
  const pathname = usePathname();
  const [triviaOpen, setTriviaOpen] = useState(false);

  useEffect(() => {
    async function check() {
      const open = await isTriviaOpen();
      setTriviaOpen(open);
    }
    check();
    const interval = setInterval(check, 10000);
    return () => clearInterval(interval);
  }, []);

  const links = [
    { href: "/", label: "Home" },
    { href: "/menu", label: "Menu" },
    ...(triviaOpen ? [{ href: "/trivia", label: "Trivia" }] : []),
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-10 py-4 bg-deep-purple/85 backdrop-blur-xl border-b border-gold/20">
      <div className="font-[family-name:var(--font-display)] text-sm tracking-[0.3em] uppercase text-gold-light">
        #LOCKin 2026
      </div>
      <div className="flex gap-8">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "text-[0.8rem] tracking-[0.15em] uppercase transition-colors",
              pathname === link.href
                ? "text-gold-light"
                : "text-gold-pale/70 hover:text-gold-light"
            )}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
