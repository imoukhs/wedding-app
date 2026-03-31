"use client";

import { motion } from "framer-motion";

interface HeroProps {
  coupleName: string;
  weddingDate: string;
  venue: string;
  ceremonyTime: string;
  receptionTime: string;
}

export function Hero({ coupleName, weddingDate, venue, ceremonyTime, receptionTime }: HeroProps) {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-8 py-24 text-center">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(107,33,168,0.6)_0%,transparent_70%),radial-gradient(ellipse_60%_40%_at_80%_80%,rgba(61,15,107,0.8)_0%,transparent_60%),radial-gradient(ellipse_50%_50%_at_20%_60%,rgba(26,5,51,0.9)_0%,transparent_60%)]" />

      {/* Decorative orbs */}
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[radial-gradient(circle,#6b21a8,transparent)] blur-[60px] opacity-40 animate-float pointer-events-none" />
      <div className="absolute bottom-0 -right-20 w-72 h-72 rounded-full bg-[radial-gradient(circle,#c9a227,transparent)] blur-[60px] opacity-40 animate-float pointer-events-none" style={{ animationDelay: "-4s" }} />
      <div className="absolute top-[40%] left-[20%] w-48 h-48 rounded-full bg-[radial-gradient(circle,#a855f7,transparent)] blur-[60px] opacity-40 animate-float pointer-events-none" style={{ animationDelay: "-2s" }} />

      {/* Content */}
      <motion.p
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative z-10 font-[family-name:var(--font-display)] text-[0.7rem] tracking-[0.4em] uppercase text-gold"
      >
        They said yes. Now it&apos;s time to
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="relative z-10 font-[family-name:var(--font-heading)] text-[clamp(3.5rem,8vw,7rem)] font-light leading-none text-cream"
      >
        <em className="italic text-gold-light">#LOCKin</em>
        <br />
        2026
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.4 }}
        className="relative z-10 font-[family-name:var(--font-display)] text-[clamp(1.4rem,3vw,2.2rem)] font-semibold tracking-wider text-white mt-2"
      >
        {coupleName}
      </motion.div>

      {/* Gold divider */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="relative z-10 flex items-center gap-4 my-6"
      >
        <span className="block h-px w-20 bg-gradient-to-r from-transparent via-gold to-transparent" />
        <span className="text-gold text-sm">&#10022;</span>
        <span className="block h-px w-20 bg-gradient-to-r from-transparent via-gold to-transparent" />
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.6 }}
        className="relative z-10 text-[0.85rem] tracking-[0.25em] text-gold-pale/70"
      >
        {weddingDate}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.8 }}
        className="relative z-10 flex gap-12 mt-12 flex-wrap justify-center"
      >
        <div className="text-center">
          <div className="text-[0.65rem] tracking-[0.3em] uppercase text-gold mb-1">Ceremony</div>
          <div className="font-[family-name:var(--font-heading)] text-lg text-cream">{ceremonyTime}</div>
        </div>
        <div className="text-center">
          <div className="text-[0.65rem] tracking-[0.3em] uppercase text-gold mb-1">Venue</div>
          <div className="font-[family-name:var(--font-heading)] text-lg text-cream">{venue}</div>
        </div>
        <div className="text-center">
          <div className="text-[0.65rem] tracking-[0.3em] uppercase text-gold mb-1">Reception</div>
          <div className="font-[family-name:var(--font-heading)] text-lg text-cream">{receptionTime}</div>
        </div>
      </motion.div>
    </section>
  );
}
