"use client";

import { motion } from "framer-motion";

interface ScheduleEvent {
  id: string;
  time: string;
  event: string;
  location: string | null;
}

export function Schedule({ events }: { events: ScheduleEvent[] }) {
  return (
    <section className="max-w-[900px] mx-auto px-8 py-24">
      <p className="font-[family-name:var(--font-display)] text-[0.7rem] tracking-[0.4em] uppercase text-gold text-center mb-2">
        Order of Events
      </p>
      <h2 className="font-[family-name:var(--font-heading)] text-[clamp(2rem,4vw,3rem)] font-light text-center text-cream mb-12">
        The <em className="italic text-gold-light">Programme</em>
      </h2>

      <div className="relative flex flex-col">
        {/* Center line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gold/40 to-transparent -translate-x-1/2 hidden md:block" />
        <div className="absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gold/40 to-transparent md:hidden" />

        {events.map((event, i) => {
          const isEven = i % 2 === 1;

          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="relative grid grid-cols-[24px_1fr] md:grid-cols-[1fr_60px_1fr] items-center gap-4 my-4"
            >
              {/* Desktop layout */}
              <div className={`hidden md:block ${isEven ? "order-3" : "order-1"} ${isEven ? "text-left" : "text-right"}`}>
                <div className="font-[family-name:var(--font-display)] text-[0.7rem] tracking-[0.2em] text-gold mb-1">
                  {event.time}
                </div>
                <div className="font-[family-name:var(--font-heading)] text-xl text-cream mb-0.5">
                  {event.event}
                </div>
                {event.location && (
                  <div className="text-[0.78rem] text-gold-pale/50 tracking-wider">
                    {event.location}
                  </div>
                )}
              </div>

              <div className="hidden md:flex order-2 items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-gold shadow-[0_0_0_4px_rgba(201,162,39,0.2)]" />
              </div>

              <div className={`hidden md:block ${isEven ? "order-1" : "order-3"}`} />

              {/* Mobile layout */}
              <div className="flex items-center justify-start md:hidden">
                <div className="w-3 h-3 rounded-full bg-gold shadow-[0_0_0_4px_rgba(201,162,39,0.2)]" />
              </div>
              <div className="md:hidden">
                <div className="font-[family-name:var(--font-display)] text-[0.7rem] tracking-[0.2em] text-gold mb-1">
                  {event.time}
                </div>
                <div className="font-[family-name:var(--font-heading)] text-xl text-cream mb-0.5">
                  {event.event}
                </div>
                {event.location && (
                  <div className="text-[0.78rem] text-gold-pale/50 tracking-wider">
                    {event.location}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
