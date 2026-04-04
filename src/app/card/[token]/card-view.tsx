"use client";

import { useEffect, useState } from "react";
import { activateCard, validateCard } from "@/lib/actions/guest-actions";
import { Shield, MapPin, Calendar, Users } from "lucide-react";

type Status = "loading" | "valid" | "blocked";

interface Props {
  token: string;
  guest: {
    id: string;
    name: string;
    serial: string | null;
    cardViewed: boolean;
    deviceToken: string | null;
  };
  settings: {
    coupleName: string;
    weddingDate: string;
    venue: string;
  };
}

export function CardView({ token, guest, settings }: Props) {
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    async function init() {
      const storageKey = `lockin_card_${token}`;

      if (!guest.cardViewed) {
        // First time — activate and bind this device
        const deviceToken = await activateCard(token);
        if (!deviceToken) {
          // Race: another device just activated it in the same instant
          setStatus("blocked");
          return;
        }
        localStorage.setItem(storageKey, deviceToken);
        setStatus("valid");
      } else {
        // Already activated — check if this is the same device
        const stored = localStorage.getItem(storageKey);
        if (!stored) {
          setStatus("blocked");
          return;
        }
        const valid = await validateCard(token, stored);
        setStatus(valid ? "valid" : "blocked");
      }
    }
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.venue)}`;

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-deep-purple">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-gold/30 border-t-gold rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gold-pale/50 text-xs tracking-[0.3em] uppercase">Verifying</p>
        </div>
      </div>
    );
  }

  if (status === "blocked") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-deep-purple px-6">
        <div className="max-w-sm w-full text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-sm tracking-[0.3em] uppercase text-red-400 mb-3">
            Access Denied
          </h1>
          <p className="text-gold-pale/60 text-sm leading-relaxed mb-2">
            This access card has already been activated on another device.
          </p>
          <p className="text-gold-pale/40 text-xs leading-relaxed">
            If you believe this is an error, please speak to a member of the
            wedding team at the entrance.
          </p>
          <div className="mt-8 pt-6 border-t border-gold/10">
            <p className="text-gold-pale/25 text-[0.6rem] tracking-[0.2em] uppercase">
              #LOCKin 2026 · {settings.coupleName}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Valid card ────────────────────────────────────────────────────
  const [firstName, ...rest] = guest.name.split(" ");
  const lastName = rest.join(" ");

  return (
    <div className="min-h-screen bg-deep-purple flex flex-col items-center justify-center px-5 py-12 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(107,33,168,0.7)_0%,transparent_70%),radial-gradient(ellipse_60%_40%_at_80%_90%,rgba(61,15,107,0.9)_0%,transparent_60%)]" />
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[radial-gradient(circle,#6b21a8,transparent)] blur-[80px] opacity-30 pointer-events-none" />
      <div className="absolute bottom-0 -right-20 w-64 h-64 rounded-full bg-[radial-gradient(circle,#c9a227,transparent)] blur-[60px] opacity-25 pointer-events-none" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm">
        {/* Top ornament */}
        <div className="flex items-center gap-3 mb-6 justify-center">
          <span className="block h-px flex-1 bg-gradient-to-r from-transparent to-gold/50" />
          <span className="text-gold text-sm">✦</span>
          <span className="block h-px flex-1 bg-gradient-to-l from-transparent to-gold/50" />
        </div>

        {/* Couple names */}
        <div className="text-center mb-6">
          <p className="font-[family-name:var(--font-display)] text-[0.6rem] tracking-[0.35em] uppercase text-gold mb-3">
            You are invited to celebrate
          </p>
          <h2 className="font-[family-name:var(--font-heading)] text-[clamp(1.6rem,6vw,2.2rem)] font-light text-cream leading-snug">
            {settings.coupleName.split("&")[0].trim()}
          </h2>
          <p className="font-[family-name:var(--font-display)] text-[0.6rem] tracking-[0.3em] uppercase text-gold my-1">
            &amp;
          </p>
          <h2 className="font-[family-name:var(--font-heading)] text-[clamp(1.6rem,6vw,2.2rem)] font-light text-cream leading-snug">
            {settings.coupleName.split("&")[1]?.trim() ?? ""}
          </h2>
        </div>

        {/* Middle ornament */}
        <div className="flex items-center gap-3 mb-6 justify-center">
          <span className="block h-px flex-1 bg-gradient-to-r from-transparent to-gold/30" />
          <span className="text-gold/60 text-xs">◆</span>
          <span className="block h-px flex-1 bg-gradient-to-l from-transparent to-gold/30" />
        </div>

        {/* Guest card */}
        <div className="relative bg-royal-purple/40 border border-gold/30 p-6 mb-6">
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-gold/60" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-gold/60" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-gold/60" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-gold/60" />
          {/* Top shimmer line */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gold/60 to-transparent" />

          <p className="font-[family-name:var(--font-display)] text-[0.55rem] tracking-[0.3em] uppercase text-gold mb-3 text-center">
            Access Card
          </p>

          <div className="text-center mb-4">
            {lastName ? (
              <>
                <p className="font-[family-name:var(--font-heading)] text-3xl font-light text-cream leading-tight">
                  {firstName}
                </p>
                <p className="font-[family-name:var(--font-heading)] text-3xl font-light text-gold-light leading-tight">
                  {lastName}
                </p>
              </>
            ) : (
              <p className="font-[family-name:var(--font-heading)] text-3xl font-light text-cream">
                {firstName}
              </p>
            )}
          </div>

          {guest.serial && (
            <div className="text-center">
              <span className="font-mono text-[0.65rem] tracking-[0.2em] text-gold-pale/50 bg-deep-purple/40 px-3 py-1 border border-gold/15">
                {guest.serial}
              </span>
            </div>
          )}
        </div>

        {/* Event details */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
              <Calendar className="w-3.5 h-3.5 text-gold" />
            </div>
            <div>
              <p className="text-[0.55rem] tracking-[0.2em] uppercase text-gold-pale/40">Date</p>
              <p className="text-cream text-sm">{settings.weddingDate}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
              <MapPin className="w-3.5 h-3.5 text-gold" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[0.55rem] tracking-[0.2em] uppercase text-gold-pale/40">Venue</p>
              <p className="text-cream text-sm">{settings.venue}</p>
            </div>
          </div>
        </div>

        {/* Get Directions button */}
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3.5 bg-gradient-to-r from-gold to-gold-light text-deep-purple font-[family-name:var(--font-display)] text-[0.7rem] tracking-[0.2em] uppercase mb-6 hover:opacity-90 transition-opacity"
        >
          <MapPin className="w-4 h-4" />
          Get Directions
        </a>

        {/* Present this card note */}
        <div className="bg-gold/5 border border-gold/15 p-4 mb-6">
          <div className="flex items-start gap-2">
            <Users className="w-3.5 h-3.5 text-gold mt-0.5 shrink-0" />
            <p className="text-gold-pale/60 text-[0.65rem] leading-relaxed">
              Please present this card at the entrance. This card is personal and
              non-transferable — it is linked to your device.
            </p>
          </div>
        </div>

        {/* Bottom ornament */}
        <div className="flex items-center gap-3 justify-center">
          <span className="block h-px flex-1 bg-gradient-to-r from-transparent to-gold/30" />
          <span className="text-gold/50 text-xs">✦</span>
          <span className="block h-px flex-1 bg-gradient-to-l from-transparent to-gold/30" />
        </div>

        <p className="text-center text-gold-pale/25 text-[0.55rem] tracking-[0.2em] uppercase mt-4">
          #LOCKin 2026
        </p>
      </div>
    </div>
  );
}
