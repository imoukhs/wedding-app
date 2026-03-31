export function Footer({ coupleName }: { coupleName?: string }) {
  return (
    <footer className="py-8 text-center border-t border-gold/10">
      <div className="flex items-center justify-center gap-4 mb-3">
        <span className="block h-px w-12 bg-gradient-to-r from-transparent to-gold/30" />
        <span className="text-gold text-xs">&#10022;</span>
        <span className="block h-px w-12 bg-gradient-to-l from-transparent to-gold/30" />
      </div>
      <p className="font-[family-name:var(--font-display)] text-[0.65rem] tracking-[0.3em] uppercase text-gold-pale/40">
        {coupleName || "Lauretta & Caleb"} &mdash; #LOCKin 2026
      </p>
      <p className="text-gold-pale/20 text-[0.55rem] tracking-[0.15em] uppercase mt-2">
        Built by King &mdash; the last born / bride&apos;s brother
      </p>
    </footer>
  );
}
