"use client";

export default function Marquee({ items, className = '', reverse = false }: { items: string[]; className?: string; reverse?: boolean }) {
  const doubled = [...items, ...items];
  return (
    <div className={`relative overflow-hidden py-6 ${className}`}>
      <div className={`flex items-center gap-10 whitespace-nowrap ${reverse ? 'marquee-track-reverse' : 'marquee-track'}`}>
        {doubled.map((item, i) => (
          <span key={i} className="flex items-center gap-10">
            <span className="font-serif text-xl lg:text-2xl tracking-tight text-ink/50 italic">
              {item}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-ember/50 shrink-0" />
          </span>
        ))}
      </div>
    </div>
  );
}
